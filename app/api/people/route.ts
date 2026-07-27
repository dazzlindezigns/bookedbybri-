export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase'

export type PersonRecord = {
  id: string
  type: 'booking' | 'contact'
  name: string
  phone: string | null
  email: string | null
  lastMessage: string | null
  lastMessageAt: string | null
  lastDirection: 'inbound' | 'outbound' | null
}

export async function GET() {
  const sb = createSupabaseAdminClient()

  const [
    { data: bookings },
    { data: contacts },
    { data: bookingMsgs },
    { data: contactMsgs },
  ] = await Promise.all([
    sb.from('bookings')
      .select('id, client_name, client_phone, client_email')
      .not('status', 'in', '("cancelled","declined")')
      .order('created_at', { ascending: false }),
    sb.from('contacts').select('*').order('created_at', { ascending: false }),
    sb.from('booking_messages').select('booking_id, body, direction, created_at').order('created_at', { ascending: false }),
    sb.from('contact_messages').select('contact_id, body, direction, created_at').order('created_at', { ascending: false }),
  ])

  const bookingMsgMap = new Map<string, { body: string; direction: string; created_at: string }>()
  for (const m of bookingMsgs || []) {
    if (!bookingMsgMap.has(m.booking_id)) bookingMsgMap.set(m.booking_id, m)
  }

  const contactMsgMap = new Map<string, { body: string; direction: string; created_at: string }>()
  for (const m of contactMsgs || []) {
    if (!contactMsgMap.has(m.contact_id)) contactMsgMap.set(m.contact_id, m)
  }

  const people: PersonRecord[] = []
  const seen = new Set<string>()

  for (const b of bookings || []) {
    const key = b.client_phone || b.client_email || b.id
    if (seen.has(key)) continue
    seen.add(key)
    const latest = bookingMsgMap.get(b.id)
    people.push({
      id: b.id,
      type: 'booking',
      name: b.client_name,
      phone: b.client_phone,
      email: b.client_email,
      lastMessage: latest?.body ?? null,
      lastMessageAt: latest?.created_at ?? null,
      lastDirection: (latest?.direction ?? null) as 'inbound' | 'outbound' | null,
    })
  }

  for (const c of contacts || []) {
    const key = c.phone || c.email || c.id
    if (seen.has(key)) continue
    seen.add(key)
    const latest = contactMsgMap.get(c.id)
    people.push({
      id: c.id,
      type: 'contact',
      name: c.name || c.phone || 'Unknown',
      phone: c.phone,
      email: c.email,
      lastMessage: latest?.body ?? null,
      lastMessageAt: latest?.created_at ?? null,
      lastDirection: (latest?.direction ?? null) as 'inbound' | 'outbound' | null,
    })
  }

  // Sort: recent messages first, then alphabetically
  people.sort((a, b) => {
    if (a.lastMessageAt && b.lastMessageAt) {
      return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
    }
    if (a.lastMessageAt) return -1
    if (b.lastMessageAt) return 1
    return a.name.localeCompare(b.name)
  })

  return NextResponse.json(people)
}
