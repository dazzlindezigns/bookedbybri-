export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { sendGmail } from '@/lib/google'
import { bookingConfirmed, bookingDeclined } from '@/lib/email-templates'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const sb = createSupabaseAdminClient()
  const { data, error } = await sb
    .from('bookings')
    .select('*, services(*), booking_images(*)')
    .eq('id', params.id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json(data)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const sb = createSupabaseAdminClient()
  const body = await req.json()
  const { declineReason, ...updates } = body

  const { data: booking, error } = await sb
    .from('bookings')
    .update(updates)
    .eq('id', params.id)
    .select('*, services(name)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: settings } = await sb
    .from('admin_settings')
    .select('value')
    .eq('key', 'google_refresh_token')
    .maybeSingle()

  const serviceName = (booking.services as { name: string } | null)?.name || 'your appointment'

  if (updates.status === 'confirmed') {
    try {
      if (settings?.value) {
        const depositPaid = booking.deposit_amount || 0
        const balanceDue = booking.final_price ? booking.final_price - depositPaid : 0
        const dateStr = new Date(booking.appointment_date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
        await sendGmail(
          settings.value,
          booking.client_email,
          "You're confirmed! — Braids by Brizee Bri",
          bookingConfirmed(booking.client_name, serviceName, dateStr, booking.appointment_time, depositPaid, balanceDue)
        )
      }
    } catch {}
  }

  if (updates.status === 'declined' && declineReason) {
    try {
      if (settings?.value) {
        await sendGmail(
          settings.value,
          booking.client_email,
          'Update on your booking — Braids by Brizee Bri',
          bookingDeclined(booking.client_name, serviceName, declineReason)
        )
      }
    } catch {}
  }

  return NextResponse.json(booking)
}
