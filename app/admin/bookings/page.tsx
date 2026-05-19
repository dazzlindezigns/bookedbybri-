import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase'

const FILTERS = ['all', 'pending', 'confirmed', 'completed', 'cancelled', 'declined'] as const
type Filter = typeof FILTERS[number]

const STATUS_BADGE: Record<string, { label: string; class: string }> = {
  pending: { label: 'Pending', class: 'bg-amber-500/20 text-amber-400' },
  confirmed: { label: 'Confirmed', class: 'bg-[#ffabdd]/20 text-[#ffabdd]' },
  declined: { label: 'Declined', class: 'bg-red-500/20 text-red-400' },
  completed: { label: 'Completed', class: 'bg-green-500/20 text-green-400' },
  cancelled: { label: 'Cancelled', class: 'bg-[#3a3a3a] text-white/40' },
}

function initials(name: string) {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
}

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: { status?: string }
}) {
  const filter = (searchParams.status || 'all') as Filter
  const sb = createSupabaseServerClient()

  let query = sb
    .from('bookings')
    .select('*, services(name)')
    .order('appointment_date', { ascending: false })
    .order('appointment_time', { ascending: true })

  if (filter !== 'all') {
    query = query.eq('status', filter)
  }

  const { data: bookings } = await query

  return (
    <div className="px-4 py-6">
      <h1 className="font-cormorant text-3xl font-semibold mb-5">Bookings</h1>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5 no-scrollbar">
        {FILTERS.map((f) => (
          <Link
            key={f}
            href={f === 'all' ? '/admin/bookings' : `/admin/bookings?status=${f}`}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${
              filter === f
                ? 'bg-[#ffabdd] text-[#1a1a1a]'
                : 'bg-[#222] border border-[#3a3a3a] text-white/60 hover:border-[#ffabdd]/40'
            }`}
          >
            {f}
          </Link>
        ))}
      </div>

      {/* Booking list */}
      {bookings && bookings.length > 0 ? (
        <div className="space-y-2">
          {bookings.map((booking) => {
            const badge = STATUS_BADGE[booking.status] || STATUS_BADGE.pending
            const formattedDate = new Date(booking.appointment_date + 'T12:00:00').toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })
            return (
              <Link
                key={booking.id}
                href={`/admin/bookings/${booking.id}`}
                className="flex items-center gap-3 bg-[#222] border border-[#3a3a3a] rounded-2xl p-4 hover:border-[#ffabdd]/40 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-[#ffabdd]/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-[#ffabdd] text-sm font-semibold">{initials(booking.client_name)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{booking.client_name}</p>
                  <p className="text-white/50 text-xs truncate">
                    {(booking.services as { name: string } | null)?.name}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-white/60">{formattedDate} · {booking.appointment_time}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${badge.class}`}>
                    {badge.label}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="bg-[#222] border border-[#3a3a3a] rounded-2xl p-10 text-center">
          <p className="text-white/40 text-sm">No bookings found</p>
        </div>
      )}
    </div>
  )
}
