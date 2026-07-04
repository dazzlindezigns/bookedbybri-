import Link from 'next/link'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { Clock } from 'lucide-react'
import type { BookingRow, BookingImageRow } from '@/lib/supabase'

const STATUS_BADGE: Record<string, { label: string; class: string }> = {
  pending:   { label: 'Pending',   class: 'bg-amber-50 text-amber-600 border border-amber-200' },
  confirmed: { label: 'Confirmed', class: 'bg-[#fff0f8] text-[#c4658f] border border-[#ffabdd]/30' },
  declined:  { label: 'Declined',  class: 'bg-red-50 text-red-500 border border-red-200' },
  completed: { label: 'Completed', class: 'bg-green-50 text-green-600 border border-green-200' },
  cancelled: { label: 'Cancelled', class: 'bg-[#f7f5f3] text-[#b0a8a4] border border-[#ede9e5]' },
  no_show:   { label: 'No Show',   class: 'bg-orange-50 text-orange-600 border border-orange-200' },
}

const FILTERS = ['all', 'pending', 'confirmed', 'completed', 'cancelled', 'declined', 'no_show'] as const
type Filter = typeof FILTERS[number]

function initials(name: string) {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export default async function AdminHome({
  searchParams,
}: {
  searchParams: { status?: string; client?: string }
}) {
  const sb = createSupabaseAdminClient()
  const filter = (searchParams.status || 'all') as Filter
  const clientEmail = searchParams.client
  const today = new Date().toISOString().slice(0, 10)
  const weekEnd = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10)

  const [
    { count: todayCount },
    { count: weekCount },
    { count: reviewCount },
    bookingsResult,
  ] = await Promise.all([
    sb.from('bookings').select('*', { count: 'exact', head: true })
      .eq('appointment_date', today)
      .not('status', 'in', '("cancelled","declined")'),
    sb.from('bookings').select('*', { count: 'exact', head: true })
      .gte('appointment_date', today)
      .lte('appointment_date', weekEnd)
      .not('status', 'in', '("cancelled","declined")'),
    sb.from('bookings').select('*', { count: 'exact', head: true })
      .eq('status', 'pending'),
    (() => {
      let q = sb.from('bookings')
        .select('*, services(name), booking_images(id)')
        .order('appointment_date', { ascending: false })
        .order('appointment_time', { ascending: true })
      if (filter !== 'all') q = q.eq('status', filter)
      if (clientEmail) q = q.eq('client_email', clientEmail)
      return q
    })(),
  ])

  const bookings = (bookingsResult.data || []) as unknown as (BookingRow & {
    services: { name: string } | null
    booking_images: Pick<BookingImageRow, 'id'>[]
  })[]

  const dateLabel = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <div className="px-4 py-6">
      {/* Greeting */}
      <div className="mb-5">
        <h1 className="font-cormorant text-3xl font-semibold text-[#1a1a1a]">
          {getGreeting()}, <em className="italic text-[#ffabdd]">Bri</em> ✦
        </h1>
        <p className="text-[#8a7f7a] text-sm mt-0.5">{dateLabel}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2.5 mb-6">
        <div className="bg-white border border-[#ede9e5] rounded-2xl p-3 text-center">
          <p className="text-2xl font-bold text-[#ffabdd]">{todayCount ?? 0}</p>
          <p className="text-[11px] text-[#8a7f7a] mt-0.5">Today</p>
        </div>
        <div className="bg-white border border-[#ede9e5] rounded-2xl p-3 text-center">
          <p className="text-2xl font-bold text-[#1a1a1a]">{weekCount ?? 0}</p>
          <p className="text-[11px] text-[#8a7f7a] mt-0.5">This Week</p>
        </div>
        <div className="bg-white border border-[#ede9e5] rounded-2xl p-3 text-center">
          <p className="text-2xl font-bold text-amber-500">{reviewCount ?? 0}</p>
          <p className="text-[11px] text-[#8a7f7a] mt-0.5">Need Review</p>
        </div>
      </div>

      {/* Filter tabs */}
      {!clientEmail && (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 no-scrollbar">
          {FILTERS.map((f) => (
            <Link
              key={f}
              href={f === 'all' ? '/admin' : `/admin?status=${f}`}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filter === f
                  ? 'bg-[#1a1a1a] text-white'
                  : 'bg-white border border-[#ede9e5] text-[#8a7f7a] hover:border-[#ffabdd]/50'
              }`}
            >
              {f === 'no_show' ? 'No Show' : f.charAt(0).toUpperCase() + f.slice(1)}
            </Link>
          ))}
        </div>
      )}

      {clientEmail && (
        <div className="bg-[#fff0f8] border border-[#ffabdd]/30 rounded-xl px-4 py-3 mb-4">
          <p className="text-xs text-[#8a7f7a]">Showing all bookings for</p>
          <p className="text-sm font-medium text-[#1a1a1a]">{clientEmail}</p>
          <Link href="/admin" className="text-xs text-[#c4658f] hover:underline">Clear filter</Link>
        </div>
      )}

      {/* Bookings list */}
      {bookings.length > 0 ? (
        <div className="space-y-2">
          {bookings.map((booking) => {
            const badge = STATUS_BADGE[booking.status] || STATUS_BADGE.pending
            const dateStr = (booking.appointment_date || '').slice(0, 10)
            const formattedDate = dateStr
              ? new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
              : '—'
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
                  <p className="text-xs text-[#b0a8a4] flex items-center gap-1 justify-end">
                    <Clock size={10} />{formattedDate} · {booking.appointment_time}
                  </p>
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
