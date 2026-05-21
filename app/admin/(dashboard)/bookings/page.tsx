import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import type { BookingRow } from '@/lib/supabase'

const FILTERS = ['all', 'pending', 'confirmed', 'completed', 'cancelled', 'declined'] as const
type Filter = typeof FILTERS[number]

const STATUS_BADGE: Record<string, { label: string; class: string }> = {
  pending: { label: 'Pending', class: 'bg-amber-50 text-amber-600 border border-amber-200' },
  confirmed: { label: 'Confirmed', class: 'bg-[#fff0f8] text-[#c4658f] border border-[#ffabdd]/30' },
  declined: { label: 'Declined', class: 'bg-red-50 text-red-500 border border-red-200' },
  completed: { label: 'Completed', class: 'bg-green-50 text-green-600 border border-green-200' },
  cancelled: { label: 'Cancelled', class: 'bg-[#f7f5f3] text-[#b0a8a4] border border-[#ede9e5]' },
}

function initials(name: string) {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
}

export default async function BookingsPage({ searchParams }: { searchParams: { status?: string } }) {
  const filter = (searchParams.status || 'all') as Filter
  const sb = createSupabaseServerClient()

  let query = sb.from('bookings').select('*, services(name)').order('appointment_date', { ascending: false }).order('appointment_time', { ascending: true })
  if (filter !== 'all') query = query.eq('status', filter)
  const { data: rawBookings } = await query
  const bookings = rawBookings as unknown as (BookingRow & { services: { name: string } | null })[]

  return (
    <div className="px-4 py-6">
      <h1 className="font-cormorant text-3xl font-semibold text-[#1a1a1a] mb-5">Bookings</h1>
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5 no-scrollbar">
        {FILTERS.map((f) => (
          <Link
            key={f}
            href={f === 'all' ? '/admin/bookings' : `/admin/bookings?status=${f}`}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${
              filter === f
                ? 'bg-[#1a1a1a] text-white'
                : 'bg-white border border-[#ede9e5] text-[#8a7f7a] hover:border-[#ffabdd]/50'
            }`}
          >
            {f}
          </Link>
        ))}
      </div>
      {bookings && bookings.length > 0 ? (
        <div className="space-y-2">
          {bookings.map((booking) => {
            const badge = STATUS_BADGE[booking.status] || STATUS_BADGE.pending
            const formattedDate = new Date(booking.appointment_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            return (
              <Link
                key={booking.id}
                href={`/admin/bookings/${booking.id}`}
                className="flex items-center gap-3 bg-white border border-[#ede9e5] rounded-2xl p-4 hover:border-[#ffabdd]/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-[#fff0f8] flex items-center justify-center flex-shrink-0">
                  <span className="text-[#c4658f] text-sm font-semibold">{initials(booking.client_name)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-[#1a1a1a] truncate">{booking.client_name}</p>
                  <p className="text-[#8a7f7a] text-xs truncate">{(booking.services as { name: string } | null)?.name}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-[#b0a8a4]">{formattedDate} · {booking.appointment_time}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${badge.class}`}>{badge.label}</span>
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="bg-white border border-[#ede9e5] rounded-2xl p-10 text-center">
          <p className="text-[#b0a8a4] text-sm">No bookings found</p>
        </div>
      )}
    </div>
  )
}
