export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase'

export async function GET() {
  const sb = createSupabaseAdminClient()
  const { data, error } = await sb
    .from('gallery_photos')
    .select('*')
    .eq('active', true)
    .order('display_order')
  if (error) return NextResponse.json([], { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const sb = createSupabaseAdminClient()
  const formData = await req.formData()
  const file = formData.get('file') as File
  const displayOrder = parseInt(formData.get('display_order') as string) || 1

  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 })

  const ext = file.name.split('.').pop()
  const path = `gallery/${Date.now()}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())

  const { error: uploadError } = await sb.storage
    .from('gallery')
    .upload(path, buffer, { contentType: file.type, upsert: false })

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 })

  const { data, error } = await sb
    .from('gallery_photos')
    .insert({ storage_path: path, display_order: displayOrder, active: true })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest) {
  const sb = createSupabaseAdminClient()
  const id = req.nextUrl.searchParams.get('id')
  const path = req.nextUrl.searchParams.get('path')

  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  await sb.from('gallery_photos').delete().eq('id', id)

  if (path) {
    await sb.storage.from('gallery').remove([path])
  }

  return NextResponse.json({ success: true })
}
