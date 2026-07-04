export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { sendGmail } from '@/lib/google'
import { bookingAccepted, bookingDeclined, appointmentCancelled, reviewRequest } from '@/lib/email-templates'
import { handleDepositReceived } from '@/lib/deposit'

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://brizeebri.com'

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
    .select('*, services(name, duration_minutes)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const svc = booking.services as { name: string; duration_minutes: number } | null
  const serviceName = svc?.name ?? 'your appointment'
  const cancelUrl = `${SITE_URL}/booking/${params.id}/cancel`

  const dateStr = new Date(booking.appointment_date + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  })

  // Bri accepted the request — email client to pay deposit
  if (updates.status === 'confirmed') {
    try {
      const [{ data: tokenRow }, { data: settingsRows }] = await Promise.all([
        sb.from('admin_settings').select('value').eq('key', 'google_refresh_token').maybeSingle(),
        sb.from('admin_settings').select('key, value').in('key', [
          'cashapp_handle', 'cashapp_url', 'zelle_contact', 'zelle_url',
          'applepay_url', 'cashapp_enabled', 'zelle_enabled', 'applepay_enabled', 'stripe_enabled',
        ]),
      ])

      if (tokenRow?.value) {
        const cfg: Record<string, string> = {}
        settingsRows?.forEach((r) => { cfg[r.key] = r.value })

        const methods: string[] = []
        if (cfg.cashapp_enabled === 'true' && cfg.cashapp_handle)
          methods.push(`CashApp: <strong>${cfg.cashapp_handle}</strong>${cfg.cashapp_url ? ` — <a href="${cfg.cashapp_url}">Pay now</a>` : ''}`)
        if (cfg.zelle_enabled === 'true' && cfg.zelle_contact)
          methods.push(`Zelle: <strong>${cfg.zelle_contact}</strong>${cfg.zelle_url ? ` — <a href="${cfg.zelle_url}">Pay now</a>` : ''}`)
        if (cfg.applepay_enabled === 'true' && cfg.applepay_url)
          methods.push(`Apple Pay: <a href="${cfg.applepay_url}">Pay now</a>`)
        if (cfg.stripe_enabled === 'true')
          methods.push('Card: a payment link will be sent separately')

        const paymentInstructions = methods.length
          ? methods.join('<br>')
          : 'Bri will send you payment instructions shortly.'

        await sendGmail(
          tokenRow.value,
          booking.client_email,
          "You're approved! — Brizee Bri Luxe Hair Studio",
          bookingAccepted(
            booking.client_name,
            serviceName,
            dateStr,
            booking.appointment_time,
            booking.deposit_amount ?? 0,
            paymentInstructions,
            cancelUrl
          )
        )
      }
    } catch {}
  }

  // Deposit received (manual payment marked by Bri) — add to calendar + send ICS
  if (updates.payment_status === 'deposit_paid') {
    await handleDepositReceived(params.id).catch(() => {})
  }

  // Bri declined — email client with reason
  if (updates.status === 'declined' && declineReason) {
    try {
      const { data: tokenRow } = await sb
        .from('admin_settings').select('value').eq('key', 'google_refresh_token').maybeSingle()
      if (tokenRow?.value) {
        await sendGmail(
          tokenRow.value,
          booking.client_email,
          'Update on your booking — Brizee Bri Luxe Hair Studio',
          bookingDeclined(booking.client_name, serviceName, declineReason)
        )
      }
    } catch {}
  }

  // Booking cancelled (by admin) — email client
  if (updates.status === 'cancelled') {
    try {
      const { data: tokenRow } = await sb
        .from('admin_settings').select('value').eq('key', 'google_refresh_token').maybeSingle()
      if (tokenRow?.value) {
        await sendGmail(
          tokenRow.value,
          booking.client_email,
          'Appointment Cancelled — Brizee Bri Luxe Hair Studio',
          appointmentCancelled(booking.client_name, serviceName, dateStr, 'admin')
        )
      }
    } catch {}
  }

  // Appointment completed — send Google review request
  if (updates.status === 'completed') {
    try {
      const [{ data: tokenRow }, { data: reviewRow }] = await Promise.all([
        sb.from('admin_settings').select('value').eq('key', 'google_refresh_token').maybeSingle(),
        sb.from('admin_settings').select('value').eq('key', 'google_review_url').maybeSingle(),
      ])
      if (tokenRow?.value && reviewRow?.value) {
        await sendGmail(
          tokenRow.value,
          booking.client_email,
          'How did it go? — Brizee Bri Luxe Hair Studio',
          reviewRequest(booking.client_name, serviceName, reviewRow.value)
        )
      }
    } catch {}
  }

  return NextResponse.json(booking)
}
