import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { sendGmail, createCalendarEvent } from '@/lib/google'
import { bookingConfirmed } from '@/lib/email-templates'

export async function POST(req: NextRequest) {
  const sb = createSupabaseAdminClient()
  const { bookingId } = await req.json()

  const { data: booking, error } = await sb
    .from('bookings')
    .select('*, services(name, duration_minutes)')
    .eq('id', bookingId)
    .single()

  if (error || !booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  }

  const service = booking.services as { name: string; duration_minutes: number } | null
  const balanceDue = booking.final_price ? booking.final_price - booking.deposit_amount : 0

  // Update status to confirmed
  await sb.from('bookings').update({ status: 'confirmed' }).eq('id', bookingId)

  // Get Google credentials
  const { data: settings } = await sb
    .from('admin_settings')
    .select('value')
    .eq('key', 'google_refresh_token')
    .maybeSingle()

  if (settings?.value) {
    // Send confirmation email
    try {
      await sendGmail(
        settings.value,
        booking.client_email,
        `Your appointment is confirmed! — Braids by Brizee Bri`,
        bookingConfirmed(
          booking.client_name,
          service?.name || 'your style',
          booking.appointment_date,
          booking.appointment_time,
          booking.deposit_amount,
          balanceDue
        )
      )
      await sb
        .from('bookings')
        .update({ confirmation_sent_at: new Date().toISOString() })
        .eq('id', bookingId)
    } catch {
      // Non-critical
    }

    // Create Google Calendar event
    try {
      const durationMin = service?.duration_minutes || 120
      const datePart = booking.appointment_date
      const [timePart] = [booking.appointment_time]
      const [h, m] = timePart.split(':').map(Number)

      const startDT = `${datePart}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`
      const endDate = new Date(`${datePart}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`)
      endDate.setMinutes(endDate.getMinutes() + durationMin)
      const endDT = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}T${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}:00`

      const event = await createCalendarEvent(settings.value, {
        summary: `${booking.client_name} — ${service?.name}`,
        description: `Client: ${booking.client_name}\nEmail: ${booking.client_email}\nPhone: ${booking.client_phone}`,
        startDateTime: startDT,
        endDateTime: endDT,
        attendeeEmail: booking.client_email,
      })

      await sb
        .from('bookings')
        .update({ google_calendar_event_id: event.id })
        .eq('id', bookingId)
    } catch {
      // Calendar not critical
    }
  }

  return NextResponse.json({ success: true })
}
