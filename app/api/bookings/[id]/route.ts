export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { createCalendarEvent, sendGmail, sendGmailWithIcs } from '@/lib/google'
import { bookingConfirmed, bookingDeclined } from '@/lib/email-templates'
import { generateIcs, calendarTimes } from '@/lib/ics'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const sb = createSupabaseAdminClient()
  const { data, error } = await sb
    .from('bookings')
    .select('*, services(*), booking_images(*)')
    .eq('id', params.id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json(data)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const sb = createSupabaseAdminClient()
  const body = await req.json()
  const { declineReason, ...updates } = body

  const { data: booking, error } = await sb
    .from('bookings')
    .update(updates)
    .eq('id', params.id)
    .select('*, services(name, duration_minutes)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: settings } = await sb
    .from('admin_settings')
    .select('value')
    .eq('key', 'google_refresh_token')
    .maybeSingle()

  const svc = booking.services as { name: string; duration_minutes: number } | null
  const serviceName = svc?.name || 'your appointment'
  const durationMinutes = svc?.duration_minutes || 180

  if (updates.status === 'confirmed') {
    try {
      if (settings?.value) {
        const depositPaid = booking.deposit_amount || 0
        const balanceDue = booking.final_price ? booking.final_price - depositPaid : 0
        const dateStr = new Date(booking.appointment_date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

        // Add to Bri's Google Calendar
        const { startDateTime, endDateTime } = calendarTimes(booking.appointment_date, booking.appointment_time, durationMinutes)
        const calEvent = await createCalendarEvent(settings.value, {
          summary: `${serviceName} — ${booking.client_name}`,
          description: `Phone: ${booking.client_phone}\nEmail: ${booking.client_email}${booking.client_notes ? `\nNotes: ${booking.client_notes}` : ''}`,
          startDateTime,
          endDateTime,
        })
        if (calEvent?.id) {
          await sb.from('bookings').update({ google_calendar_event_id: calEvent.id }).eq('id', params.id)
        }

        // Send confirmation email with ICS calendar invite
        const ics = generateIcs({
          uid: booking.id,
          summary: `Braids Appointment — ${serviceName}`,
          description: `Your appointment with Braids by Brizee Bri in Pflugerville, TX`,
          date: booking.appointment_date,
          time: booking.appointment_time,
          durationMinutes,
          organizerEmail: 'brielle.washington09@gmail.com',
          attendeeEmail: booking.client_email,
          attendeeName: booking.client_name,
        })

        await sendGmailWithIcs(
          settings.value,
          booking.client_email,
          "You're confirmed! — Braids by Brizee Bri",
          bookingConfirmed(booking.client_name, serviceName, dateStr, booking.appointment_time, depositPaid, balanceDue),
          ics
        )
      }
    } catch {}
  }

  if (updates.status === 'declined' && declineReason) {
    try {
      if (settings?.value) {
        await sendGmail(
          settings.value,
          booking.client_email,
          'Update on your booking — Braids by Brizee Bri',
          bookingDeclined(booking.client_name, serviceName, declineReason)
        )
      }
    } catch {}
  }

  return NextResponse.json(booking)
}
