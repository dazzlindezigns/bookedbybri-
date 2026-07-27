export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { sendSms } from '@/lib/telnyx'

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

  // Send SMS to client's phone if Telnyx is configured
  try {
    const { data: booking } = await sb
      .from('bookings')
      .select('client_phone')
      .eq('id', params.id)
      .single()
    if (booking?.client_phone) {
      await sendSms(booking.client_phone, body.trim())
    }
  } catch {
    // SMS failure doesn't block the message from saving
  }

  return NextResponse.json(data)
}
