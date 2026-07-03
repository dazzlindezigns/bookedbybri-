'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'

export default function CancelBookingPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [cancelled, setCancelled] = useState(false)
  const [error, setError] = useState('')

  const handleCancel = async () => {
    setConfirming(true)
    setError('')
    try {
      const res = await fetch(`/api/bookings/${params.id}/cancel`, { method: 'POST' })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Something went wrong')
        return
      }
      setCancelled(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setConfirming(false)
    }
  }

  if (cancelled) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] text-white font-sans flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center">
          <p className="font-cormorant italic text-4xl text-[#ffabdd] mb-8">Brizee Bri</p>
          <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">💔</span>
          </div>
          <h1 className="text-xl font-bold mb-3">Request Cancelled</h1>
          <p className="text-white/60 text-sm mb-2">Your appointment has been cancelled.</p>
          <p className="text-white/40 text-xs mb-8">
            Per our policy, deposits are non-refundable. A confirmation email has been sent to you.
          </p>
          <Link
            href="/"
            className="block w-full py-3 rounded-full border border-[#3a3a3a] text-white/60 text-sm hover:border-[#ffabdd]/50 hover:text-white transition-colors"
          >
            Back to home
          </Link>
          <p className="text-white/30 text-xs mt-6">
            We hope to see you again soon! Feel free to request a new appointment anytime.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white font-sans flex items-center justify-center px-4">
      <div className="max-w-sm w-full">
        <div className="text-center mb-8">
          <p className="font-cormorant text-base text-white/60">Braids by</p>
          <p className="font-cormorant italic text-4xl text-[#ffabdd]">Brizee Bri</p>
        </div>

        <div className="bg-[#222] border border-[#3a3a3a] rounded-2xl p-6 mb-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-red-900/40 flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={20} className="text-red-400" />
            </div>
            <h1 className="text-lg font-bold">Cancel Appointment?</h1>
          </div>

          <p className="text-white/60 text-sm mb-5 leading-relaxed">
            Are you sure you want to cancel this appointment? Please note:
          </p>

          <ul className="text-white/50 text-sm space-y-2 mb-6">
            <li className="flex items-start gap-2">
              <span className="text-red-400 mt-0.5">•</span>
              <span><strong className="text-white/70">Deposits are non-refundable</strong> per our booking policy</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400 mt-0.5">•</span>
              <span>You will need to submit a new request to rebook</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-400 mt-0.5">•</span>
              <span>Bri will be notified of the cancellation</span>
            </li>
          </ul>

          {error && (
            <div className="bg-red-900/30 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm mb-4">
              {error}
            </div>
          )}

          <button
            onClick={handleCancel}
            disabled={confirming}
            className="w-full py-3 rounded-full bg-red-900/50 border border-red-500/50 text-red-400 font-semibold text-sm hover:bg-red-900 hover:text-red-300 transition-all disabled:opacity-50 mb-3"
          >
            {confirming ? 'Cancelling...' : 'Yes, Cancel My Appointment'}
          </button>

          <Link
            href={`/booking/${params.id}`}
            className="block w-full py-3 rounded-full border border-[#3a3a3a] text-white/50 text-sm text-center hover:border-[#ffabdd]/50 hover:text-white transition-colors"
          >
            Keep My Appointment
          </Link>
        </div>
      </div>
    </div>
  )
}
