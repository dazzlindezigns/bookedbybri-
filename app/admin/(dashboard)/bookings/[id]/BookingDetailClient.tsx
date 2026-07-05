'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AlertTriangle, Pencil, Send } from 'lucide-react'

type Message = { id: string; direction: 'inbound' | 'outbound'; body: string; created_at: string }

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
  conflictingBookings = [],
  clientBookingCount = 0,
}: {
  booking: Booking
  supabaseUrl: string
  conflictingBookings?: { id: string; client_name: string; appointment_time: string }[]
  clientBookingCount?: number
}) {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sendingMsg, setSendingMsg] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch(`/api/bookings/${booking.id}/messages`)
      .then((r) => r.ok ? r.json() : [])
      .then((data) => { if (Array.isArray(data)) setMessages(data) })
  }, [booking.id])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return
    setSendingMsg(true)
    const res = await fetch(`/api/bookings/${booking.id}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body: newMessage.trim() }),
    })
    if (res.ok) {
      const data = await res.json()
      setMessages((prev) => [...prev, data])
      setNewMessage('')
    }
    setSendingMsg(false)
  }

  const [finalPrice, setFinalPrice] = useState<string>(booking.final_price?.toString() || '')
  const [message, setMessage] = useState(
    booking.quote_message || DEFAULT_MESSAGE(booking.client_name, booking.services?.name || 'style')
  )
  const [declineReason, setDeclineReason] = useState('')
  const [showDecline, setShowDecline] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  // Date/time editing
  const [editingDateTime, setEditingDateTime] = useState(false)
  const [editDate, setEditDate] = useState(booking.appointment_date)
  const [editTime, setEditTime] = useState(booking.appointment_time)

  const balanceDue =
    finalPrice && !isNaN(parseFloat(finalPrice))
      ? parseFloat(finalPrice) - booking.deposit_amount
      : null

  const photoUrl = (path: string) =>
    `${supabaseUrl}/storage/v1/object/public/booking-images/${path}`

  const patch = async (updates: Record<string, unknown>, extra?: Record<string, unknown>) => {
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch(`/api/bookings/${booking.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...updates, ...extra }),
      })
      if (!res.ok) throw new Error('Request failed')
      router.refresh()
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

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

  const handleAccept = async () => {
    await patch({ status: 'confirmed' })
  }

  const handleMarkPaid = async () => {
    await patch({ payment_status: 'deposit_paid' })
  }

  const handleSaveDateTime = async () => {
    await patch({ appointment_date: editDate, appointment_time: editTime })
    setEditingDateTime(false)
  }

  const handleMarkComplete = async () => {
    if (!confirm('Mark this appointment as completed? This will send a Google review request email to the client.')) return
    await patch({ status: 'completed' })
  }

  const handleMarkNoShow = async () => {
    if (!confirm('Mark this client as a no-show?')) return
    await patch({ status: 'no_show' })
  }

  const handleCancel = async () => {
    if (!confirm('Cancel this appointment? The client will be notified. Deposits are non-refundable.')) return
    await patch({ status: 'cancelled' })
  }

  const formattedDate = new Date(booking.appointment_date + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  })

  return (
    <div className="space-y-5">

      {/* Conflict warning — shown for pending requests with overlapping confirmed bookings */}
      {conflictingBookings.length > 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4">
          <div className="flex items-start gap-2 mb-2">
            <AlertTriangle size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm font-semibold text-amber-700">Schedule conflict detected</p>
          </div>
          <p className="text-xs text-amber-600 mb-2">
            You already have confirmed bookings on{' '}
            {new Date(booking.appointment_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}:
          </p>
          {conflictingBookings.map((c) => (
            <Link
              key={c.id}
              href={`/admin/bookings/${c.id}`}
              className="block text-xs text-amber-700 font-medium hover:underline"
            >
              {c.client_name} · {c.appointment_time} →
            </Link>
          ))}
          <p className="text-xs text-amber-500 mt-2">Accept only if you can accommodate both, or negotiate a different time via chat.</p>
        </div>
      )}

      {/* Accept / Decline — only shown when pending */}
      {booking.status === 'pending' && (
        <div className="bg-[#fff0f8] border border-[#ffabdd]/40 rounded-2xl p-4 space-y-3">
          <p className="text-sm font-semibold text-[#1a1a1a]">New request — review and respond</p>
          {error && <p className="text-red-500 text-xs bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
          <div className="flex gap-2">
            <button
              onClick={() => setShowDecline(true)}
              disabled={submitting}
              className="flex-1 py-3 rounded-full border border-[#ede9e5] text-sm text-[#8a7f7a] bg-white hover:border-red-300 hover:text-red-500 transition-colors"
            >
              Decline
            </button>
            <button
              onClick={handleAccept}
              disabled={submitting}
              className="flex-1 py-3 rounded-full bg-[#ffabdd] text-[#1a1a1a] text-sm font-semibold hover:bg-[#c4658f] hover:text-white transition-all disabled:opacity-50"
            >
              {submitting ? 'Accepting...' : 'Accept ✓'}
            </button>
          </div>
          <p className="text-[#8a7f7a] text-xs text-center">Accepting emails the client to pay their deposit</p>
        </div>
      )}

      {/* Confirmed actions */}
      {booking.status === 'confirmed' && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 space-y-2">
          <p className="text-sm font-semibold text-green-700 mb-3">Appointment confirmed</p>
          {error && <p className="text-red-500 text-xs bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleMarkComplete}
              disabled={submitting}
              className="py-2.5 rounded-full bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              Mark Complete ✓
            </button>
            <button
              onClick={handleMarkNoShow}
              disabled={submitting}
              className="py-2.5 rounded-full border border-orange-300 text-orange-600 text-sm hover:bg-orange-50 transition-colors disabled:opacity-50"
            >
              No-show
            </button>
          </div>
          <button
            onClick={handleCancel}
            disabled={submitting}
            className="w-full py-2 rounded-full border border-red-200 text-red-500 text-xs hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            Cancel appointment
          </button>
        </div>
      )}

      {/* Cancel button for pending requests */}
      {booking.status === 'pending' && (
        <div className="text-center">
          <button
            onClick={handleCancel}
            disabled={submitting}
            className="text-xs text-[#b0a8a4] hover:text-red-500 transition-colors"
          >
            Cancel this request
          </button>
        </div>
      )}

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
        <div className="flex items-center justify-between">
          <p className="text-xs text-[#8a7f7a] uppercase tracking-wider">Booking Summary</p>
          {clientBookingCount > 0 && (
            <Link
              href={`/admin/bookings?client=${encodeURIComponent(booking.client_email)}`}
              className="text-xs text-[#c4658f] hover:underline"
            >
              +{clientBookingCount} past booking{clientBookingCount !== 1 ? 's' : ''} →
            </Link>
          )}
        </div>
        <div className="flex justify-between"><span className="text-[#8a7f7a]">Client</span><span className="font-medium text-[#1a1a1a]">{booking.client_name}</span></div>
        <div className="flex justify-between"><span className="text-[#8a7f7a]">Email</span><span className="text-[#1a1a1a]">{booking.client_email}</span></div>
        <div className="flex justify-between"><span className="text-[#8a7f7a]">Phone</span><span className="text-[#1a1a1a]">{booking.client_phone}</span></div>
        <div className="flex justify-between"><span className="text-[#8a7f7a]">Service</span><span className="font-medium text-[#1a1a1a]">{booking.services?.name}</span></div>

        {/* Editable Date & Time */}
        {editingDateTime ? (
          <div className="border border-[#ffabdd]/40 rounded-xl p-3 space-y-2 bg-[#fff0f8]">
            <p className="text-xs text-[#8a7f7a] uppercase tracking-wider">Edit Date & Time</p>
            <input
              type="date"
              value={editDate}
              onChange={(e) => setEditDate(e.target.value)}
              className="input-field text-sm"
              min={new Date().toISOString().split('T')[0]}
            />
            <input
              type="text"
              value={editTime}
              onChange={(e) => setEditTime(e.target.value)}
              placeholder="e.g. 10:00 AM"
              className="input-field text-sm"
            />
            <div className="flex gap-2">
              <button onClick={() => setEditingDateTime(false)} className="flex-1 py-1.5 text-xs rounded-full border border-[#ede9e5] text-[#8a7f7a]">Cancel</button>
              <button onClick={handleSaveDateTime} disabled={submitting} className="flex-1 py-1.5 text-xs rounded-full bg-[#ffabdd] text-[#1a1a1a] font-semibold disabled:opacity-50">Save</button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center">
              <span className="text-[#8a7f7a]">{booking.status === 'pending' ? 'Preferred Date' : 'Date'}</span>
              <div className="flex items-center gap-2">
                <span className="text-[#1a1a1a]">{formattedDate}</span>
                {['pending', 'confirmed'].includes(booking.status) && (
                  <button onClick={() => setEditingDateTime(true)} className="text-[#b0a8a4] hover:text-[#c4658f]">
                    <Pencil size={13} />
                  </button>
                )}
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#8a7f7a]">Time</span>
              <span className="text-[#1a1a1a]">{booking.appointment_time}</span>
            </div>
          </>
        )}

        <div className="flex justify-between">
          <span className="text-[#8a7f7a]">Deposit</span>
          <span className="font-semibold text-[#c4658f]">
            ${(booking.deposit_amount ?? 0).toFixed(2)} via {booking.payment_method}
          </span>
        </div>
        {booking.payment_status === 'unpaid' && booking.status === 'confirmed' && (
          <button
            onClick={handleMarkPaid}
            disabled={submitting}
            className="w-full mt-2 py-2 rounded-xl bg-green-50 border border-green-300 text-green-600 text-xs font-semibold hover:bg-green-100 transition-colors"
          >
            💰 Mark deposit as received
          </button>
        )}
        {booking.payment_status === 'deposit_paid' && (
          <div className="text-xs text-green-600 bg-green-50 rounded-lg px-3 py-2 text-center">
            ✓ Deposit received
          </div>
        )}
        {booking.client_notes && (
          <div>
            <p className="text-[#8a7f7a] text-xs mb-1">Client notes</p>
            <p className="text-[#1a1a1a] text-sm bg-[#f7f5f3] rounded-lg p-3">{booking.client_notes}</p>
          </div>
        )}
      </div>

      {!['declined', 'completed', 'cancelled', 'no_show'].includes(booking.status) && (
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
              <span className="text-[#1a1a1a]">${(booking.deposit_amount ?? 0).toFixed(2)}</span>
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

      {/* Messages thread */}
      <div className="bg-white border border-[#ede9e5] rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-[#ede9e5]">
          <p className="text-xs text-[#8a7f7a] uppercase tracking-wider">Messages</p>
        </div>
        <div className="p-4 space-y-3 max-h-72 overflow-y-auto">
          {messages.length === 0 ? (
            <p className="text-[#b0a8a4] text-xs text-center py-4">No messages yet</p>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                  msg.direction === 'outbound'
                    ? 'bg-[#1a1a1a] text-white rounded-br-sm'
                    : 'bg-[#f7f5f3] text-[#1a1a1a] rounded-bl-sm'
                }`}>
                  <p className="leading-snug">{msg.body}</p>
                  <p className={`text-[10px] mt-1 ${msg.direction === 'outbound' ? 'text-white/40' : 'text-[#b0a8a4]'}`}>
                    {new Date(msg.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="px-3 py-3 border-t border-[#ede9e5] flex gap-2">
          <input
            className="flex-1 bg-[#f7f5f3] border border-[#ede9e5] rounded-full px-4 py-2 text-sm text-[#1a1a1a] placeholder-[#b0a8a4] focus:outline-none focus:border-[#ffabdd] transition-colors"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage() } }}
          />
          <button
            onClick={handleSendMessage}
            disabled={sendingMsg || !newMessage.trim()}
            className="w-9 h-9 rounded-full bg-[#ffabdd] flex items-center justify-center hover:bg-[#c4658f] transition-colors disabled:opacity-40 flex-shrink-0"
          >
            <Send size={14} className="text-[#1a1a1a]" />
          </button>
        </div>
      </div>

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
