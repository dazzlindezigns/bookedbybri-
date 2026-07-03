export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const sb = createSupabaseAdminClient()
  const { data, error } = await sb
    .from('booking_messages')
    .select('*')
    .eq('booking_id', params.id)
    .order('created_at', { ascending: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const sb = createSupabaseAdminClient()
  const { body } = await req.json()
  if (!body?.trim()) return NextResponse.json({ error: 'body required' }, { status: 400 })

  const { data, error } = await sb
    .from('booking_messages')
    .insert({ booking_id: params.id, direction: 'outbound', body: body.trim() })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // TODO: send via Telnyx SMS once TELNYX_API_KEY and TELNYX_PHONE_NUMBER are set
  // const booking = await sb.from('bookings').select('client_phone').eq('id', params.id).single()
  // await sendSms(booking.data.client_phone, body.trim())

  return NextResponse.json(data)
}
