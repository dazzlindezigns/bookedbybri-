export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase'

const SENSITIVE_KEYS = new Set(['google_refresh_token'])

export async function GET() {
  const sb = createSupabaseAdminClient()
  const { data, error } = await sb.from('admin_settings').select('key, value')
  if (error) return NextResponse.json({}, { status: 500 })
  const map: Record<string, string> = {}
  data?.forEach((r) => {
    if (SENSITIVE_KEYS.has(r.key)) return
    map[r.key] = r.value
  })
  // Expose connection status without exposing the token value
  const tokenRow = data?.find((r) => r.key === 'google_refresh_token')
  map.google_connected = tokenRow?.value ? 'true' : 'false'
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
