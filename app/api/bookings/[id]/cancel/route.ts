export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { sendGmail } from '@/lib/google'
import { appointmentCancelled } from '@/lib/email-templates'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const sb = createSupabaseAdminClient()

  const { data: booking, error } = await sb
    .from('bookings')
    .select('*, services(name)')
    .eq('id', params.id)
    .single()

  if (error || !booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  }

  if (!['pending', 'confirmed'].includes(booking.status)) {
    return NextResponse.json({ error: 'This booking cannot be cancelled' }, { status: 400 })
  }

  const { error: updateError } = await sb
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', params.id)

  if (updateError) {
    return NextResponse.json({ error: 'Failed to cancel' }, { status: 500 })
  }

  const svc = booking.services as { name: string } | null
  const serviceName = svc?.name ?? 'your appointment'
  const dateStr = new Date(booking.appointment_date + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  })

  try {
    const { data: tokenRow } = await sb
      .from('admin_settings').select('value').eq('key', 'google_refresh_token').maybeSingle()
    if (tokenRow?.value) {
      await sendGmail(
        tokenRow.value,
        booking.client_email,
        'Appointment Cancelled — Braids by Brizee Bri',
        appointmentCancelled(booking.client_name, serviceName, dateStr, 'client')
      )
    }
  } catch {}

  return NextResponse.json({ success: true })
}
