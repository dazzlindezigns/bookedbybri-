import { createSupabaseAdminClient } from './supabase'
import { createCalendarEvent, sendGmailWithIcs } from './google'
import { generateIcs, calendarTimes } from './ics'
import { bookingConfirmed } from './email-templates'

export async function handleDepositReceived(bookingId: string) {
  const sb = createSupabaseAdminClient()

  const [{ data: booking }, { data: tokenRow }] = await Promise.all([
    sb.from('bookings').select('*, services(name, duration_minutes)').eq('id', bookingId).single(),
    sb.from('admin_settings').select('value').eq('key', 'google_refresh_token').maybeSingle(),
  ])

  if (!booking || !tokenRow?.value) return

  const svc = booking.services as { name: string; duration_minutes: number } | null
  const serviceName = svc?.name ?? 'your appointment'
  const durationMinutes = svc?.duration_minutes ?? 180
  const depositPaid = booking.deposit_amount ?? 0
  const balanceDue = booking.final_price ? booking.final_price - depositPaid : 0
  const dateStr = new Date(booking.appointment_date + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  })

  // Add to Bri's Google Calendar
  try {
    const { startDateTime, endDateTime } = calendarTimes(booking.appointment_date, booking.appointment_time, durationMinutes)
    const calEvent = await createCalendarEvent(tokenRow.value, {
      summary: `${serviceName} — ${booking.client_name}`,
      description: [
        `Phone: ${booking.client_phone}`,
        `Email: ${booking.client_email}`,
        booking.client_notes ? `Notes: ${booking.client_notes}` : '',
      ].filter(Boolean).join('\n'),
      startDateTime,
      endDateTime,
    })
    if (calEvent?.id) {
      await sb.from('bookings').update({ google_calendar_event_id: calEvent.id }).eq('id', bookingId)
    }
  } catch {}

  // Send client confirmation email with .ics calendar invite
  try {
    const ics = generateIcs({
      uid: booking.id,
      summary: `Braids Appointment — ${serviceName}`,
      description: 'Your appointment with Braids by Brizee Bri in Pflugerville, TX',
      date: booking.appointment_date,
      time: booking.appointment_time,
      durationMinutes,
      organizerEmail: 'brielle.washington09@gmail.com',
      attendeeEmail: booking.client_email,
      attendeeName: booking.client_name,
    })

    await sendGmailWithIcs(
      tokenRow.value,
      booking.client_email,
      "You're confirmed! — Braids by Brizee Bri",
      bookingConfirmed(booking.client_name, serviceName, dateStr, booking.appointment_time, depositPaid, balanceDue),
      ics
    )
  } catch {}
}
