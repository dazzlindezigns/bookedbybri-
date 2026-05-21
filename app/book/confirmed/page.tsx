import Link from 'next/link'
import { CheckCircle } from 'lucide-react'

export default function ConfirmedPage({
  searchParams,
}: {
  searchParams: Record<string, string>
}) {
  const { name, service, date, time, deposit, method, id } = searchParams

  const formattedDate = date
    ? new Date(date + 'T12:00:00').toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      })
    : ''

  const isManualPayment = ['cashapp', 'zelle', 'applepay'].includes(method || '')

  return (
    <div className="min-h-screen bg-[#f7f5f3] font-sans flex flex-col items-center justify-center px-4 py-16">
      <div className="max-w-sm w-full text-center">
        <p className="font-cormorant text-lg text-[#8a7f7a] mb-1">Braids by</p>
        <p className="font-cormorant italic text-4xl text-[#ffabdd] mb-8">Brizee Bri</p>

        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-[#fff0f8] border-2 border-[#ffabdd] flex items-center justify-center">
            <CheckCircle size={40} className="text-[#ffabdd]" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-[#1a1a1a] mb-2">Booking Received!</h1>
        <p className="text-[#8a7f7a] text-sm mb-8">
          Confirmation sent to your email. Bri will be in touch within 24 hours.
        </p>

        <div className="bg-white border border-[#ede9e5] rounded-2xl p-5 text-left space-y-3 mb-6">
          {name && (
            <div className="flex justify-between text-sm">
              <span className="text-[#8a7f7a]">Name</span>
              <span className="font-medium text-[#1a1a1a]">{name}</span>
            </div>
          )}
          {service && (
            <div className="flex justify-between text-sm">
              <span className="text-[#8a7f7a]">Service</span>
              <span className="font-medium text-[#1a1a1a]">{service}</span>
            </div>
          )}
          {formattedDate && (
            <div className="flex justify-between text-sm">
              <span className="text-[#8a7f7a]">Date</span>
              <span className="font-medium text-[#1a1a1a]">{formattedDate}</span>
            </div>
          )}
          {time && (
            <div className="flex justify-between text-sm">
              <span className="text-[#8a7f7a]">Time</span>
              <span className="font-medium text-[#1a1a1a]">{time}</span>
            </div>
          )}
          <div className="border-t border-[#ede9e5] pt-3">
            <div className="flex justify-between text-sm">
              <span className="text-[#8a7f7a]">Deposit</span>
              <span className="font-semibold text-[#c4658f]">
                ${parseFloat(deposit || '0').toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-[#8a7f7a]">Status</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  isManualPayment
                    ? 'bg-amber-50 text-amber-600 border border-amber-200'
                    : 'bg-[#fff0f8] text-[#c4658f] border border-[#ffabdd]/30'
                }`}
              >
                {isManualPayment ? 'Pending payment confirmation' : 'Deposit paid'}
              </span>
            </div>
          </div>
        </div>

        {isManualPayment && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700 mb-6">
            <p className="font-semibold mb-1">Action needed</p>
            <p className="text-amber-600">
              Please send your deposit of ${parseFloat(deposit || '0').toFixed(2)} via{' '}
              {method === 'cashapp' ? 'CashApp' : method === 'zelle' ? 'Zelle' : 'Apple Pay'} to
              complete your booking. Bri will confirm once received.
            </p>
          </div>
        )}

        {id && (
          <Link
            href={`/booking/${id}`}
            className="text-[#c4658f] text-sm underline underline-offset-2 block mb-6"
          >
            View booking status →
          </Link>
        )}

        <Link
          href="/"
          className="block w-full py-3 rounded-full border border-[#ede9e5] bg-white text-[#1a1a1a] text-sm hover:border-[#ffabdd]/50 hover:bg-[#fff0f8] transition-colors"
        >
          Back to home
        </Link>
      </div>
    </div>
  )
}
