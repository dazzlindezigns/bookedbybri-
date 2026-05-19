import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { sendGmail } from '@/lib/google'
import { createCalendarEvent } from '@/lib/google'
import { quoteReady } from '@/lib/email-templates'

export async function POST(req: NextRequest) {
  const sb = createSupabaseAdminClient()
  const { bookingId, finalPrice, message } = await req.json()

  const { data: booking, error } = await sb
    .from('bookings')
    .select('*, services(name, duration_minutes)')
    .eq('id', bookingId)
    .single()

  if (error || !booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })

  const service = booking.services as { name: string; duration_minutes: number } | null
  const balanceDue = finalPrice - booking.deposit_amount

  // Update booking
  await sb.from('bookings').update({
    final_price: finalPrice,
    status: 'confirmed',
    quote_message: message,
  }).eq('id', bookingId)

  // Get Google refresh token
  const { data: settings } = await sb
    .from('admin_settings')
    .select('value')
    .eq('key', 'google_refresh_token')
    .maybeSingle()

  if (settings?.value) {
    // Send quote email
    try {
      await sendGmail(
        settings.value,
        booking.client_email,
        `Your price quote — Braids by Brizee Bri`,
        quoteReady(
          booking.client_name,
          service?.name || 'your style',
          booking.appointment_date,
          booking.appointment_time,
          finalPrice,
          booking.deposit_amount,
          balanceDue,
          message
        )
      )
    } catch {
      // Email failure non-critical
    }

    // Create Google Calendar event
    try {
      const durationMin = service?.duration_minutes || 120
      const [datePart] = booking.appointment_date.split('T')
      const timeStr = booking.appointment_time
      const isPm = timeStr.toLowerCase().includes('pm')
      const isAm = timeStr.toLowerCase().includes('am')
      const cleaned = timeStr.toLowerCase().replace(/[apm\s]/g, '')
      const [h, m] = cleaned.split(':').map(Number)
      let hours = h
      if (isPm && h !== 12) hours += 12
      if (isAm && h === 12) hours = 0
      const startDT = `${datePart}T${String(hours).padStart(2, '0')}:${String(m || 0).padStart(2, '0')}:00`
      const endDate = new Date(startDT)
      endDate.setMinutes(endDate.getMinutes() + durationMin)
      const endDT = endDate.toISOString().slice(0, 19)

      const event = await createCalendarEvent(settings.value, {
        summary: `${booking.client_name} — ${service?.name}`,
        description: `Client: ${booking.client_name}\nEmail: ${booking.client_email}\nPhone: ${booking.client_phone}\nNotes: ${booking.client_notes || 'None'}`,
        startDateTime: startDT,
        endDateTime: endDT,
        attendeeEmail: booking.client_email,
      })

      await sb.from('bookings').update({ google_calendar_event_id: event.id }).eq('id', bookingId)
    } catch {
      // Calendar not critical
    }
  }

  return NextResponse.json({ success: true })
}
