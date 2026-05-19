import { NextRequest, NextResponse } from 'next/server'
import { createPaymentIntent } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  const { amount, bookingId, clientName, serviceName } = await req.json()

  if (!amount || amount <= 0) {
    return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
  }

  try {
    const intent = await createPaymentIntent(amount, {
      bookingId: bookingId || '',
      clientName: clientName || '',
      serviceName: serviceName || '',
    })
    return NextResponse.json({ clientSecret: intent.client_secret })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Payment failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
