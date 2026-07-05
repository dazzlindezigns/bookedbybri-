export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { sendGmail } from '@/lib/google'

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://brizeebri.com'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || ''

export async function GET(req: NextRequest) {
  const secret = req.headers.get('x-cron-secret') || req.nextUrl.searchParams.get('secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const sb = createSupabaseAdminClient()

  const { data: bookings } = await sb
    .from('bookings')
    .select('id, client_name, appointment_date, appointment_time, services(name)')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })

  if (!bookings?.length) {
    return NextResponse.json({ pending: 0 })
  }

  const { data: settings } = await sb
    .from('admin_settings')
    .select('value')
    .eq('key', 'google_refresh_token')
    .maybeSingle()

  if (!settings?.value || !ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Google or admin email not configured' }, { status: 500 })
  }

  const rows = bookings.map((b) => {
    const dateStr = (b.appointment_date || '').slice(0, 10)
    const formattedDate = dateStr
      ? new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      : '—'
    const serviceName = (b.services as { name: string } | null)?.name || '—'
    return `
      <tr>
        <td style="padding: 10px 12px; border-bottom: 1px solid #f0f0f0; font-size: 14px; color: #1a1a1a;">${b.client_name}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #f0f0f0; font-size: 14px; color: #5a5a5a;">${serviceName}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #f0f0f0; font-size: 14px; color: #5a5a5a;">${formattedDate} · ${b.appointment_time}</td>
        <td style="padding: 10px 12px; border-bottom: 1px solid #f0f0f0;">
          <a href="${SITE_URL}/admin/bookings/${b.id}" style="color: #c4658f; font-size: 13px; text-decoration: none; font-weight: 600;">Review →</a>
        </td>
      </tr>
    `
  }).join('')

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin: 0; padding: 0; background: #f2f2f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff;">
    <div style="background: #1a1a1a; padding: 24px; text-align: center;">
      <span style="font-family: Georgia, serif; font-size: 18px; font-weight: 700; color: #ffffff;">Brizee Bri Luxe</span>
      <p style="color: #ffabdd; font-size: 12px; margin: 4px 0 0; letter-spacing: 1px; text-transform: uppercase;">Admin Reminder</p>
    </div>
    <div style="padding: 32px 24px;">
      <h1 style="font-family: Georgia, serif; font-size: 24px; color: #1a1a1a; margin: 0 0 8px;">You have ${bookings.length} pending request${bookings.length === 1 ? '' : 's'} ⏳</h1>
      <p style="color: #8a8a8a; font-size: 15px; margin: 0 0 24px;">These clients are waiting for a response. Tap any row to review.</p>
      <table style="width: 100%; border-collapse: collapse; background: #fafaf9; border-radius: 12px; overflow: hidden;">
        <thead>
          <tr style="background: #f0ebe8;">
            <th style="padding: 10px 12px; text-align: left; font-size: 12px; color: #8a7f7a; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Client</th>
            <th style="padding: 10px 12px; text-align: left; font-size: 12px; color: #8a7f7a; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Service</th>
            <th style="padding: 10px 12px; text-align: left; font-size: 12px; color: #8a7f7a; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Date</th>
            <th style="padding: 10px 12px;"></th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <div style="text-align: center; margin-top: 28px;">
        <a href="${SITE_URL}/admin" style="display: inline-block; background: #ffabdd; color: #1a1a1a; font-size: 14px; font-weight: 700; padding: 12px 28px; border-radius: 50px; text-decoration: none;">Open Admin Dashboard →</a>
      </div>
    </div>
    <div style="background: #1a1a1a; padding: 20px; text-align: center;">
      <p style="color: #8a8a8a; font-size: 11px; margin: 0;">© Brizee Bri Luxe Hair Studio · This is an automated reminder.</p>
    </div>
  </div>
</body>
</html>
  `.trim()

  try {
    await sendGmail(
      settings.value,
      ADMIN_EMAIL,
      `⏳ ${bookings.length} pending request${bookings.length === 1 ? '' : 's'} need your review — Brizee Bri`,
      html
    )
    return NextResponse.json({ pending: bookings.length, sent: true })
  } catch {
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
