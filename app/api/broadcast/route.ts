export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { sendSms } from '@/lib/telnyx'
import { sendGmail } from '@/lib/google'

export async function POST(req: NextRequest) {
  const { message, subject, channel } = await req.json()
  if (!message?.trim()) return NextResponse.json({ error: 'message required' }, { status: 400 })

  const sb = createSupabaseAdminClient()
  const phones = new Set<string>()
  const emails = new Set<string>()

  const [{ data: bookings }, { data: contacts }] = await Promise.all([
    sb.from('bookings').select('client_phone, client_email').not('status', 'in', '("cancelled","declined")'),
    sb.from('contacts').select('phone, email'),
  ])

  for (const b of bookings || []) {
    if (b.client_phone) phones.add(b.client_phone)
    if (b.client_email) emails.add(b.client_email)
  }
  for (const c of contacts || []) {
    if (c.phone) phones.add(c.phone)
    if (c.email) emails.add(c.email)
  }

  let smsSent = 0
  let emailSent = 0

  if (channel === 'sms' || channel === 'both') {
    for (const phone of phones) {
      try { await sendSms(phone, message.trim()); smsSent++ } catch {}
    }
  }

  if (channel === 'email' || channel === 'both') {
    const { data: settings } = await sb
      .from('admin_settings').select('value').eq('key', 'google_refresh_token').maybeSingle()

    if (settings?.value) {
      const html = `
        <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px;">
          <p style="font-size: 15px; color: #1a1a1a; line-height: 1.6; white-space: pre-wrap;">${message.trim()}</p>
          <hr style="border: none; border-top: 1px solid #ede9e5; margin: 24px 0;">
          <p style="font-size: 12px; color: #8a8a8a;">— Brizee Bri Luxe Hair Studio · Pflugerville, TX</p>
        </div>`
      for (const email of emails) {
        try {
          await sendGmail(settings.value, email, subject || 'Message from Brizee Bri Luxe Hair Studio', html)
          emailSent++
        } catch {}
      }
    }
  }

  await sb.from('broadcasts').insert({ message: message.trim(), channel, sent_count: smsSent + emailSent })

  return NextResponse.json({ smsSent, emailSent })
}
