export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase'

export async function GET() {
  const sb = createSupabaseAdminClient()

  const { data: weekly } = await sb
    .from('availability_blocks')
    .select('*')
    .not('day_of_week', 'is', null)
    .order('day_of_week')

  const { data: specific } = await sb
    .from('availability_blocks')
    .select('*')
    .not('specific_date', 'is', null)
    .order('specific_date')

  return NextResponse.json({ weekly: weekly || [], specific: specific || [] })
}

export async function POST(req: NextRequest) {
  const sb = createSupabaseAdminClient()
  const { weekly, specific } = await req.json()

  if (weekly?.length) {
    await sb.from('availability_blocks').delete().not('day_of_week', 'is', null)
    if (weekly.filter((b: { is_available: boolean }) => b.is_available).length > 0) {
      await sb.from('availability_blocks').insert(
        weekly
          .filter((b: { is_available: boolean }) => b.is_available)
          .map((b: { day_of_week: number; start_time: string; end_time: string; is_available: boolean }) => ({
            day_of_week: b.day_of_week,
            start_time: b.start_time,
            end_time: b.end_time,
            is_available: true,
            specific_date: null,
          }))
      )
    }
  }

  if (specific !== undefined) {
    await sb.from('availability_blocks').delete().not('specific_date', 'is', null)
    if (specific.length > 0) {
      await sb.from('availability_blocks').insert(
        specific
          .filter((b: { specific_date: string }) => b.specific_date)
          .map((b: { specific_date: string; start_time: string; end_time: string; note: string }) => ({
            specific_date: b.specific_date,
            start_time: b.start_time || '00:00',
            end_time: b.end_time || '23:59',
            is_available: false,
            note: b.note || null,
            day_of_week: null,
          }))
      )
    }
  }

  return NextResponse.json({ success: true })
}
