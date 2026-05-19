import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { sendGmail } from '@/lib/google'
import { appointmentReminder } from '@/lib/email-templates'

export async function GET(req: NextRequest) {
  const secret = req.headers.get('x-cron-secret') || req.nextUrl.searchParams.get('secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const sb = createSupabaseAdminClient()

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = tomorrow.toISOString().slice(0, 10)

  const { data: bookings } = await sb
    .from('bookings')
    .select('*, services(name)')
    .eq('appointment_date', tomorrowStr)
    .eq('status', 'confirmed')
    .is('reminder_sent_at', null)

  if (!bookings?.length) {
    return NextResponse.json({ sent: 0 })
  }

  const { data: settings } = await sb
    .from('admin_settings')
    .select('value')
    .eq('key', 'google_refresh_token')
    .maybeSingle()

  if (!settings?.value) {
    return NextResponse.json({ error: 'Google not configured' }, { status: 500 })
  }

  let sent = 0
  for (const booking of bookings) {
    const serviceName = (booking.services as { name: string } | null)?.name || 'your appointment'
    const balanceDue =
      booking.final_price !== null ? booking.final_price - booking.deposit_amount : 0

    try {
      await sendGmail(
        settings.value,
        booking.client_email,
        `See you tomorrow! — Braids by Brizee Bri`,
        appointmentReminder(
          booking.client_name,
          serviceName,
          booking.appointment_date,
          booking.appointment_time,
          balanceDue
        )
      )
      await sb
        .from('bookings')
        .update({ reminder_sent_at: new Date().toISOString() })
        .eq('id', booking.id)
      sent++
    } catch {
      // Skip failed emails
    }
  }

  return NextResponse.json({ sent })
}
