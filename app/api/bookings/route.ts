export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { sendGmail } from '@/lib/google'
import { bookingReceived } from '@/lib/email-templates'
import { sendPushNotification } from '@/lib/push'

export async function GET(req: NextRequest) {
  const sb = createSupabaseAdminClient()
  const { searchParams } = req.nextUrl
  const status = searchParams.get('status')

  let query = sb
    .from('bookings')
    .select('*, services(name)')
    .order('appointment_date', { ascending: false })

  if (status) query = query.eq('status', status as 'pending' | 'confirmed' | 'declined' | 'completed' | 'cancelled')

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const sb = createSupabaseAdminClient()
  const formData = await req.formData()

  const service_id = formData.get('service_id') as string
  const appointment_date = formData.get('appointment_date') as string
  const appointment_time = formData.get('appointment_time') as string
  const client_name = formData.get('client_name') as string
  const client_email = formData.get('client_email') as string
  const client_phone = formData.get('client_phone') as string
  const client_notes = formData.get('client_notes') as string
  const payment_method = formData.get('payment_method') as string
  const deposit_amount = parseFloat(formData.get('deposit_amount') as string)
  const images = formData.getAll('images') as File[]

  const { data: booking, error } = await sb
    .from('bookings')
    .insert({
      service_id,
      appointment_date,
      appointment_time,
      client_name,
      client_email,
      client_phone,
      client_notes: client_notes || null,
      payment_method: payment_method as 'stripe' | 'cashapp' | 'zelle' | 'applepay',
      payment_status: payment_method === 'stripe' ? 'deposit_paid' : 'unpaid',
      deposit_amount,
      status: 'pending',
      final_price: null,
    })
    .select('*, services(name)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (images.length > 0) {
    for (const file of images) {
      const ext = file.name.split('.').pop()
      const path = `${booking.id}/${Date.now()}.${ext}`
      const buffer = Buffer.from(await file.arrayBuffer())

      await sb.storage.from('booking-images').upload(path, buffer, {
        contentType: file.type,
        upsert: false,
      })

      await sb.from('booking_images').insert({
        booking_id: booking.id,
        storage_path: path,
        file_name: file.name,
      })
    }
  }

  const serviceName = (booking.services as { name: string } | null)?.name || 'your appointment'

  try {
    const { data: settings } = await sb
      .from('admin_settings')
      .select('value')
      .eq('key', 'google_refresh_token')
      .maybeSingle()

    if (settings?.value) {
      await sendGmail(
        settings.value,
        client_email,
        'We got your booking request! — Brizee Bri Luxe Hair Studio',
        bookingReceived(client_name, serviceName, appointment_date, appointment_time)
      )
      await sb.from('bookings').update({ confirmation_sent_at: new Date().toISOString() }).eq('id', booking.id)
    }
  } catch {
    // Email not critical
  }

  try {
    const { data: subs } = await sb.from('push_subscriptions').select('*')
    if (subs?.length) {
      for (const sub of subs) {
        await sendPushNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          { title: 'New booking!', body: `${client_name} — ${serviceName}`, url: `/admin/bookings/${booking.id}` }
        ).catch(() => {})
      }
    }
  } catch {
    // Push not critical
  }

  return NextResponse.json({ id: booking.id })
}
