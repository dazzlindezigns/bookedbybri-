import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createSupabaseAdminClient } from '@/lib/supabase'

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-500/20 text-amber-400',
  confirmed: 'bg-[#ffabdd]/20 text-[#ffabdd]',
  declined: 'bg-red-500/20 text-red-400',
  completed: 'bg-green-500/20 text-green-400',
  cancelled: 'bg-gray-500/20 text-gray-400',
  no_show: 'bg-orange-500/20 text-orange-400',
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending Review',
  confirmed: 'Approved — Awaiting Deposit',
  declined: 'Declined',
  completed: 'Completed',
  cancelled: 'Cancelled',
  no_show: 'No Show',
}

const DATE_LABEL: Record<string, string> = {
  pending: 'Preferred Date',
  confirmed: 'Date',
  completed: 'Date',
  declined: 'Requested Date',
  cancelled: 'Date',
  no_show: 'Date',
}

export default async function BookingStatusPage({ params }: { params: { id: string } }) {
  const sb = createSupabaseAdminClient()
  const { data: booking } = await sb
    .from('bookings')
    .select('*, services(name, duration_minutes)')
    .eq('id', params.id)
    .single()

  if (!booking) notFound()

  const service = booking.services as { name: string; duration_minutes: number } | null
  const formattedDate = new Date(booking.appointment_date + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  const balanceDue =
    booking.final_price !== null
      ? booking.final_price - booking.deposit_amount
      : null

  const canCancel = ['pending', 'confirmed'].includes(booking.status)

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white font-sans px-4 py-12">
      <div className="max-w-sm mx-auto">
        <div className="text-center mb-8">
          <p className="font-cormorant text-base text-white/60">Braids by</p>
          <p className="font-cormorant italic text-4xl text-[#ffabdd]">Brizee Bri</p>
        </div>

        <h1 className="text-xl font-bold mb-6">Your Request</h1>

        <div className="bg-[#222] border border-[#3a3a3a] rounded-2xl p-5 mb-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-white/50 text-xs uppercase tracking-wider">Status</p>
            <span className={`text-xs px-3 py-1 rounded-full font-medium ${STATUS_STYLES[booking.status] || STATUS_STYLES.pending}`}>
              {STATUS_LABELS[booking.status] || booking.status}
            </span>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-white/50">Service</span>
              <span className="font-medium">{service?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">{DATE_LABEL[booking.status] || 'Date'}</span>
              <span className="font-medium">{formattedDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">Time</span>
              <span className="font-medium">{booking.appointment_time}</span>
            </div>
          </div>
        </div>

        {booking.status === 'confirmed' && (
          <div className="bg-[#ffabdd]/10 border border-[#ffabdd]/30 rounded-2xl p-4 mb-4">
            <p className="text-[#ffabdd] font-semibold text-sm mb-1">Your spot is approved! 🎉</p>
            <p className="text-white/60 text-xs">
              Send your ${booking.deposit_amount?.toFixed(2)} deposit to confirm your appointment.
            </p>
          </div>
        )}

        <div className="bg-[#222] border border-[#3a3a3a] rounded-2xl p-5 mb-4">
          <p className="text-white/50 text-xs uppercase tracking-wider mb-3">Payment</p>
          <div className="space-y-3 text-sm">
            {booking.payment_status === 'deposit_paid' ? (
              <div className="flex justify-between">
                <span className="text-white/50">Deposit</span>
                <span className="font-semibold text-[#ffabdd]">${booking.deposit_amount.toFixed(2)} ✓ Paid</span>
              </div>
            ) : (
              <div className="flex justify-between">
                <span className="text-white/50">Deposit</span>
                <span className="text-white/40 italic text-xs">
                  {booking.status === 'confirmed' ? `$${booking.deposit_amount?.toFixed(2)} due now` : 'Due after approval'}
                </span>
              </div>
            )}
            {booking.final_price !== null ? (
              <>
                <div className="flex justify-between">
                  <span className="text-white/50">Total price</span>
                  <span className="font-medium">${booking.final_price.toFixed(2)}</span>
                </div>
                {balanceDue !== null && balanceDue > 0 && (
                  <div className="flex justify-between border-t border-[#3a3a3a] pt-3">
                    <span className="font-semibold">Balance due at appointment</span>
                    <span className="font-bold text-[#ffabdd]">${balanceDue.toFixed(2)}</span>
                  </div>
                )}
              </>
            ) : (
              <div className="flex justify-between">
                <span className="text-white/50">Final price</span>
                <span className="text-white/40 italic text-xs">Pending Bri&apos;s review</span>
              </div>
            )}
          </div>
        </div>

        {booking.quote_message && (
          <div className="bg-[#ffabdd]/10 border border-[#ffabdd]/30 rounded-2xl p-5 mb-4">
            <p className="text-xs text-[#ffabdd] uppercase tracking-wider mb-2">Message from Bri</p>
            <p className="text-sm text-white/80">{booking.quote_message}</p>
          </div>
        )}

        {canCancel && (
          <Link
            href={`/booking/${booking.id}/cancel`}
            className="block text-center text-white/30 text-xs hover:text-red-400 transition-colors mt-6 mb-2"
          >
            Cancel this request
          </Link>
        )}

        <Link
          href="/"
          className="block text-center text-white/40 text-sm hover:text-white transition-colors mt-4"
        >
          ← Back to home
        </Link>
      </div>
    </div>
  )
}
