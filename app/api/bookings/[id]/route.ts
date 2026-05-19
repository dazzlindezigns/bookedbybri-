import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { sendGmail } from '@/lib/google'
import { bookingDeclined } from '@/lib/email-templates'

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

  if (updates.status === 'declined' && declineReason) {
    try {
      const { data: settings } = await sb
        .from('admin_settings')
        .select('value')
        .eq('key', 'google_refresh_token')
        .maybeSingle()

      if (settings?.value) {
        const serviceName = (booking.services as { name: string } | null)?.name || 'your appointment'
        await sendGmail(
          settings.value,
          booking.client_email,
          'Update on your booking — Braids by Brizee Bri',
          bookingDeclined(booking.client_name, serviceName, declineReason)
        )
      }
    } catch {
      // Email not critical
    }
  }

  return NextResponse.json(booking)
}
