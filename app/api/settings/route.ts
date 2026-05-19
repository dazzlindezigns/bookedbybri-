import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase'

export async function GET() {
  const sb = createSupabaseAdminClient()
  const { data, error } = await sb.from('admin_settings').select('key, value')
  if (error) return NextResponse.json({}, { status: 500 })
  const map: Record<string, string> = {}
  data?.forEach((r) => { map[r.key] = r.value })
  return NextResponse.json(map)
}

export async function PATCH(req: NextRequest) {
  const sb = createSupabaseAdminClient()
  const updates: Record<string, string> = await req.json()

  const upserts = Object.entries(updates).map(([key, value]) => ({ key, value }))

  const { error } = await sb
    .from('admin_settings')
    .upsert(upserts, { onConflict: 'key' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
