import Link from 'next/link'
import { Clock } from 'lucide-react'

export default function ConfirmedPage({
  searchParams,
}: {
  searchParams: Record<string, string>
}) {
  const { name, service, date, time, deposit, id } = searchParams

  const formattedDate = date
    ? new Date(date + 'T12:00:00').toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      })
    : ''

  return (
    <div className="min-h-screen bg-[#f7f5f3] font-sans flex flex-col items-center justify-center px-4 py-16">
      <div className="max-w-sm w-full text-center">
        <p className="font-cormorant italic text-4xl text-[#ffabdd] mb-1">Brizee Bri</p>
        <p className="font-cormorant text-lg text-[#8a7f7a] mb-8">Luxe Hair Studio</p>

        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-[#fff0f8] border-2 border-[#ffabdd] flex items-center justify-center">
            <Clock size={36} className="text-[#ffabdd]" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-[#1a1a1a] mb-2">Request Submitted!</h1>
        <p className="text-[#8a7f7a] text-sm mb-2">
          Bri will review your request and reach out within 24 hours.
        </p>
        <p className="text-[#b0a8a4] text-xs mb-8">
          A confirmation has been sent to your email.
        </p>

        <div className="bg-white border border-[#ede9e5] rounded-2xl p-5 text-left space-y-3 mb-5">
          <p className="text-xs text-[#8a7f7a] uppercase tracking-wider mb-1">Request Details</p>
          {name && (
            <div className="flex justify-between text-sm">
              <span className="text-[#8a7f7a]">Name</span>
              <span className="font-medium text-[#1a1a1a]">{name}</span>
            </div>
          )}
          {service && (
            <div className="flex justify-between text-sm">
              <span className="text-[#8a7f7a]">Style</span>
              <span className="font-medium text-[#1a1a1a]">{service}</span>
            </div>
          )}
          {formattedDate && (
            <div className="flex justify-between text-sm">
              <span className="text-[#8a7f7a]">Preferred Date</span>
              <span className="font-medium text-[#1a1a1a]">{formattedDate}</span>
            </div>
          )}
          {time && (
            <div className="flex justify-between text-sm">
              <span className="text-[#8a7f7a]">Preferred Time</span>
              <span className="font-medium text-[#1a1a1a]">{time}</span>
            </div>
          )}
          <div className="border-t border-[#ede9e5] pt-3 flex justify-between text-sm">
            <span className="text-[#8a7f7a]">Status</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200">
              Pending Bri&apos;s Review
            </span>
          </div>
        </div>

        <div className="bg-[#fff0f8] border border-[#ffabdd]/30 rounded-xl p-4 text-sm text-[#c4658f] mb-6 text-left">
          <p className="font-semibold mb-1">What happens next?</p>
          <ol className="text-[#6b6460] space-y-1 list-decimal list-inside text-xs">
            <li>Bri reviews your request</li>
            <li>She approves (or may suggest a different date/time)</li>
            <li>You pay your ${parseFloat(deposit || '0').toFixed(2)} deposit to confirm your spot</li>
            <li>You get a calendar invite — you&apos;re all set! 🎉</li>
          </ol>
        </div>

        {id && (
          <Link
            href={`/booking/${id}`}
            className="text-[#c4658f] text-sm underline underline-offset-2 block mb-6"
          >
            Track your request status →
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
