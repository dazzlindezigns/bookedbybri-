export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase'

export async function GET() {
  const sb = createSupabaseAdminClient()
  const { data, error } = await sb
    .from('contacts')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const sb = createSupabaseAdminClient()
  const { name, phone, email, notes } = await req.json()
  const { data, error } = await sb
    .from('contacts')
    .insert({ name, phone, email, notes })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
