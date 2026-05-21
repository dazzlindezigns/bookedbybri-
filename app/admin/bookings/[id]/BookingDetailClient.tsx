'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

type BookingImage = { id: string; storage_path: string; file_name: string }
type Service = { id: string; name: string; base_price: number | null; duration_minutes: number }
type Booking = {
  id: string
  client_name: string
  client_email: string
  client_phone: string
  appointment_date: string
  appointment_time: string
  status: string
  payment_method: string
  payment_status: string
  deposit_amount: number
  final_price: number | null
  client_notes: string | null
  bri_notes: string | null
  quote_message: string | null
  services: Service | null
  booking_images: BookingImage[]
}

const DEFAULT_MESSAGE = (name: string, service: string) =>
  `Hi ${name}! I've reviewed your inspiration photos and I'm so excited to work on your ${service}. Here's your final price quote — please let me know if you have any questions!`

export default function BookingDetailClient({
  booking,
  supabaseUrl,
}: {
  booking: Booking
  supabaseUrl: string
}) {
  const router = useRouter()
  const [finalPrice, setFinalPrice] = useState<string>(booking.final_price?.toString() || '')
  const [message, setMessage] = useState(
    booking.quote_message || DEFAULT_MESSAGE(booking.client_name, booking.services?.name || 'style')
  )
  const [declineReason, setDeclineReason] = useState('')
  const [showDecline, setShowDecline] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const balanceDue =
    finalPrice && !isNaN(parseFloat(finalPrice))
      ? parseFloat(finalPrice) - booking.deposit_amount
      : null

  const photoUrl = (path: string) =>
    `${supabaseUrl}/storage/v1/object/public/booking-images/${path}`

  const handleSendQuote = async () => {
    if (!finalPrice || isNaN(parseFloat(finalPrice))) {
      setError('Please enter a valid price')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.id,
          finalPrice: parseFloat(finalPrice),
          message,
        }),
      })
      if (!res.ok) throw new Error('Failed to send quote')
      setSuccess(true)
      setTimeout(() => router.refresh(), 1500)
    } catch {
      setError('Failed to send quote. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDecline = async () => {
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch(`/api/bookings/${booking.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'declined', declineReason }),
      })
      if (!res.ok) throw new Error('Failed to decline booking')
      router.refresh()
      router.push('/admin/bookings')
    } catch {
      setError('Failed to decline. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleMarkPaid = async () => {
    setSubmitting(true)
    try {
      await fetch(`/api/bookings/${booking.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_status: 'deposit_paid' }),
      })
      router.refresh()
    } finally {
      setSubmitting(false)
    }
  }

  const formattedDate = new Date(booking.appointment_date + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  })

  return (
    <div className="space-y-5">
      {booking.booking_images?.length > 0 && (
        <div>
          <p className="text-xs text-[#8a7f7a] uppercase tracking-wider mb-3">Style Inspiration</p>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {booking.booking_images.map((img) => (
              <div key={img.id} className="relative flex-shrink-0 w-28 h-28 rounded-xl overflow-hidden">
                <Image
                  src={photoUrl(img.storage_path)}
                  alt={img.file_name}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white border border-[#ede9e5] rounded-2xl p-4 space-y-3 text-sm">
        <p className="text-xs text-[#8a7f7a] uppercase tracking-wider">Booking Summary</p>
        <div className="flex justify-between"><span className="text-[#8a7f7a]">Client</span><span className="font-medium text-[#1a1a1a]">{booking.client_name}</span></div>
        <div className="flex justify-between"><span className="text-[#8a7f7a]">Email</span><span className="text-[#1a1a1a]">{booking.client_email}</span></div>
        <div className="flex justify-between"><span className="text-[#8a7f7a]">Phone</span><span className="text-[#1a1a1a]">{booking.client_phone}</span></div>
        <div className="flex justify-between"><span className="text-[#8a7f7a]">Service</span><span className="font-medium text-[#1a1a1a]">{booking.services?.name}</span></div>
        <div className="flex justify-between"><span className="text-[#8a7f7a]">Date</span><span className="text-[#1a1a1a]">{formattedDate}</span></div>
        <div className="flex justify-between"><span className="text-[#8a7f7a]">Time</span><span className="text-[#1a1a1a]">{booking.appointment_time}</span></div>
        <div className="flex justify-between">
          <span className="text-[#8a7f7a]">Deposit</span>
          <span className="font-semibold text-[#c4658f]">
            ${booking.deposit_amount.toFixed(2)} via {booking.payment_method}
          </span>
        </div>
        {booking.payment_status === 'unpaid' && (
          <button
            onClick={handleMarkPaid}
            disabled={submitting}
            className="w-full mt-2 py-2 rounded-xl border border-amber-300 text-amber-600 text-xs hover:bg-amber-50 transition-colors"
          >
            Mark deposit as paid
          </button>
        )}
        {booking.client_notes && (
          <div>
            <p className="text-[#8a7f7a] text-xs mb-1">Client notes</p>
            <p className="text-[#1a1a1a] text-sm bg-[#f7f5f3] rounded-lg p-3">{booking.client_notes}</p>
          </div>
        )}
      </div>

      {!['declined', 'completed', 'cancelled'].includes(booking.status) && (
        <div className="border border-[#ffabdd]/40 bg-[#fff0f8] rounded-2xl p-4 space-y-4">
          <p className="font-semibold text-sm text-[#1a1a1a]">✦ Set your final price</p>

          <div>
            <label className="text-xs text-[#8a7f7a] block mb-1.5">Final total price ($)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              className="input-field text-2xl font-bold"
              placeholder="0.00"
              value={finalPrice}
              onChange={(e) => setFinalPrice(e.target.value)}
            />
          </div>

          <div className="text-sm space-y-2">
            <div className="flex justify-between text-[#8a7f7a]">
              <span>Deposit paid</span>
              <span className="text-[#1a1a1a]">${booking.deposit_amount.toFixed(2)}</span>
            </div>
            {balanceDue !== null && (
              <div className="flex justify-between font-semibold border-t border-[#ede9e5] pt-2">
                <span className="text-[#1a1a1a]">Balance due at appointment</span>
                <span className="text-[#c4658f]">${balanceDue.toFixed(2)}</span>
              </div>
            )}
          </div>

          <div>
            <label className="text-xs text-[#8a7f7a] block mb-1.5">Message to client</label>
            <textarea
              className="input-field min-h-[100px] resize-none text-sm"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          {error && (
            <p className="text-red-500 text-xs bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
          )}

          {success ? (
            <div className="py-3 rounded-xl bg-green-50 border border-green-200 text-green-600 text-sm text-center font-medium">
              ✓ Quote sent to {booking.client_email}
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => setShowDecline(true)}
                disabled={submitting}
                className="flex-1 py-3 rounded-full border border-[#ede9e5] text-[#8a7f7a] text-sm hover:border-red-300 hover:text-red-500 transition-colors bg-white"
              >
                Decline
              </button>
              <button
                onClick={handleSendQuote}
                disabled={submitting || !finalPrice}
                className="flex-1 py-3 rounded-full bg-[#1a1a1a] text-white text-sm font-semibold hover:bg-[#ffabdd] hover:text-[#1a1a1a] transition-all disabled:opacity-40"
              >
                {submitting ? 'Sending...' : 'Send quote →'}
              </button>
            </div>
          )}
        </div>
      )}

      {showDecline && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50 p-4" onClick={() => setShowDecline(false)}>
          <div
            className="w-full max-w-sm mx-auto bg-white rounded-2xl p-5 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="font-semibold text-[#1a1a1a]">Decline this booking</p>
            <div>
              <label className="text-xs text-[#8a7f7a] block mb-1.5">Reason (sent to client)</label>
              <textarea
                className="input-field resize-none min-h-[80px]"
                placeholder="e.g. Unfortunately I'm unable to take this appointment at this time."
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowDecline(false)} className="flex-1 py-3 rounded-full border border-[#ede9e5] text-sm text-[#1a1a1a]">Cancel</button>
              <button
                onClick={handleDecline}
                disabled={submitting}
                className="flex-1 py-3 rounded-full bg-red-50 border border-red-200 text-red-500 text-sm font-semibold"
              >
                Confirm decline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
