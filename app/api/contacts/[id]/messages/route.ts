export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { sendSms } from '@/lib/telnyx'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const sb = createSupabaseAdminClient()
  const { data, error } = await sb
    .from('contact_messages')
    .select('*')
    .eq('contact_id', params.id)
    .order('created_at', { ascending: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const sb = createSupabaseAdminClient()
  const { body } = await req.json()
  if (!body?.trim()) return NextResponse.json({ error: 'body required' }, { status: 400 })

  const { data, error } = await sb
    .from('contact_messages')
    .insert({ contact_id: params.id, direction: 'outbound', body: body.trim() })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  try {
    const { data: contact } = await sb.from('contacts').select('phone').eq('id', params.id).single()
    if (contact?.phone) await sendSms(contact.phone, body.trim())
  } catch {
    // SMS failure doesn't block the message
  }

  return NextResponse.json(data)
}
