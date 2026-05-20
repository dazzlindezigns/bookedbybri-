export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase'

export async function GET() {
  const sb = createSupabaseAdminClient()
  const { data, error } = await sb.from('policies').select('*').eq('active', true).order('display_order')
  if (error) return NextResponse.json([], { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const sb = createSupabaseAdminClient()
  const body = await req.json()
  const { data, error } = await sb.from('policies').insert(body).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PATCH(req: NextRequest) {
  const sb = createSupabaseAdminClient()
  const id = req.nextUrl.searchParams.get('id')
  const body = await req.json()
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  const { data, error } = await sb.from('policies').update(body).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
