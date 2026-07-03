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

  // Normalize phone: strip non-digits, take last 10
  const digits = from.replace(/\D/g, '')
  const last10 = digits.slice(-10)

  const { data: booking } = await sb
    .from('bookings')
    .select('id')
    .ilike('client_phone', `%${last10}%`)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!booking) return NextResponse.json({ ok: true })

  await sb.from('booking_messages').insert({
    booking_id: booking.id,
    direction: 'inbound',
    body: text,
  })

  // TODO: push notification to admin on new inbound message

  return NextResponse.json({ ok: true })
}
