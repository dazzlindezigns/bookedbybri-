export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { sendSms } from '@/lib/telnyx'
import { sendGmail } from '@/lib/google'

export type BroadcastRecipient = {
  id: string
  type: 'booking' | 'contact'
  name: string
  phone: string | null
  email: string | null
}

// GET — return deduplicated list of all clients + contacts for the selector
export async function GET() {
  const sb = createSupabaseAdminClient()

  const [{ data: bookings }, { data: contacts }] = await Promise.all([
    sb.from('bookings')
      .select('id, client_name, client_phone, client_email')
      .not('status', 'in', '("cancelled","declined")')
      .order('client_name'),
    sb.from('contacts').select('id, name, phone, email').order('name'),
  ])

  // Deduplicate booking clients by phone (keep latest booking per phone)
  const seen = new Set<string>()
  const recipients: BroadcastRecipient[] = []

  for (const b of bookings || []) {
    const key = b.client_phone || b.client_email || b.id
    if (seen.has(key)) continue
    seen.add(key)
    recipients.push({ id: b.id, type: 'booking', name: b.client_name, phone: b.client_phone, email: b.client_email })
  }

  for (const c of contacts || []) {
    const key = c.phone || c.email || c.id
    if (seen.has(key)) continue
    seen.add(key)
    recipients.push({ id: c.id, type: 'contact', name: c.name || c.phone || 'Unknown', phone: c.phone, email: c.email })
  }

  return NextResponse.json(recipients)
}

// POST — send broadcast (to all, or to selected recipients)
export async function POST(req: NextRequest) {
  const { message, subject, channel, selected } = await req.json()
  // selected: BroadcastRecipient[] | undefined — if undefined, send to all
  if (!message?.trim()) return NextResponse.json({ error: 'message required' }, { status: 400 })

  const sb = createSupabaseAdminClient()

  let phones: string[]
  let emails: string[]

  if (selected && Array.isArray(selected) && selected.length > 0) {
    const phoneSet = new Set<string>()
    const emailSet = new Set<string>()
    for (const r of selected as BroadcastRecipient[]) {
      if (r.phone) phoneSet.add(r.phone)
      if (r.email) emailSet.add(r.email)
    }
    phones = Array.from(phoneSet)
    emails = Array.from(emailSet)
  } else {
    // Send to everyone
    const phoneSet = new Set<string>()
    const emailSet = new Set<string>()
    const [{ data: bookings }, { data: contacts }] = await Promise.all([
      sb.from('bookings').select('client_phone, client_email').not('status', 'in', '("cancelled","declined")'),
      sb.from('contacts').select('phone, email'),
    ])
    for (const b of bookings || []) {
      if (b.client_phone) phoneSet.add(b.client_phone)
      if (b.client_email) emailSet.add(b.client_email)
    }
    for (const c of contacts || []) {
      if (c.phone) phoneSet.add(c.phone)
      if (c.email) emailSet.add(c.email)
    }
    phones = Array.from(phoneSet)
    emails = Array.from(emailSet)
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
