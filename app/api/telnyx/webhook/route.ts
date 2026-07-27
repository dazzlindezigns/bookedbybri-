export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const payload = await req.json()

  const event = payload?.data?.event_type
  if (event !== 'message.received') return NextResponse.json({ ok: true })

  const from: string = payload?.data?.payload?.from?.phone_number ?? ''
  const text: string = payload?.data?.payload?.text ?? ''
  if (!from || !text) return NextResponse.json({ ok: true })

  const sb = createSupabaseAdminClient()

  const digits = from.replace(/\D/g, '')
  const last10 = digits.slice(-10)

  // Try to match to a booking first
  const { data: booking } = await sb
    .from('bookings')
    .select('id')
    .ilike('client_phone', `%${last10}%`)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (booking) {
    await sb.from('booking_messages').insert({
      booking_id: booking.id,
      direction: 'inbound',
      body: text,
    })
    return NextResponse.json({ ok: true })
  }

  // No booking — find or create a contact
  const { data: existingContact } = await sb
    .from('contacts')
    .select('id')
    .ilike('phone', `%${last10}%`)
    .maybeSingle()

  let contactId = existingContact?.id

  if (!contactId) {
    const { data: newContact } = await sb
      .from('contacts')
      .insert({ phone: from })
      .select('id')
      .single()
    contactId = newContact?.id
  }

  if (contactId) {
    await sb.from('contact_messages').insert({
      contact_id: contactId,
      direction: 'inbound',
      body: text,
    })
  }

  return NextResponse.json({ ok: true })
}
