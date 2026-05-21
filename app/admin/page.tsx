import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { CalendarDays, Clock, Star } from 'lucide-react'
import type { BookingRow, BookingImageRow } from '@/lib/supabase'

const STATUS_BADGE: Record<string, { label: string; class: string }> = {
  pending: { label: 'Pending review', class: 'bg-amber-50 text-amber-600 border border-amber-200' },
  confirmed: { label: 'Confirmed', class: 'bg-[#fff0f8] text-[#c4658f] border border-[#ffabdd]/30' },
  declined: { label: 'Declined', class: 'bg-red-50 text-red-500 border border-red-200' },
  completed: { label: 'Completed', class: 'bg-green-50 text-green-600 border border-green-200' },
  cancelled: { label: 'Cancelled', class: 'bg-[#f7f5f3] text-[#b0a8a4] border border-[#ede9e5]' },
}

function bookingActionBadge(b: { status: string; payment_status: string; booking_images?: unknown[] }) {
  if (b.status === 'pending' && (b.booking_images as unknown[] | undefined)?.length) {
    return { label: 'Review inspo', class: 'bg-blue-50 text-blue-600 border border-blue-200' }
  }
  if (b.payment_status === 'unpaid') {
    return { label: 'Verify payment', class: 'bg-amber-50 text-amber-600 border border-amber-200' }
  }
  return STATUS_BADGE[b.status] || STATUS_BADGE.pending
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function initials(name: string) {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
}

export default async function AdminDashboard() {
  const sb = createSupabaseServerClient()
  const today = new Date().toISOString().slice(0, 10)
  const weekEnd = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10)

  const { data: rawTodayBookings } = await sb
    .from('bookings')
    .select('*, services(name), booking_images(id)')
    .eq('appointment_date', today)
    .not('status', 'in', '("cancelled","declined")')
    .order('appointment_time')
  const todayBookings = rawTodayBookings as unknown as (BookingRow & {
    services: { name: string } | null
    booking_images: Pick<BookingImageRow, 'id'>[]
  })[]

  const { count: weekCount } = await sb
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .gte('appointment_date', today)
    .lte('appointment_date', weekEnd)
    .not('status', 'in', '("cancelled","declined")')

  const { count: reviewCount } = await sb
    .from('bookings')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')

  const dateLabel = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <div className="px-4 py-6">
      <div className="mb-6">
        <h1 className="font-cormorant text-3xl font-semibold text-[#1a1a1a]">
          {getGreeting()}, <em className="italic text-[#ffabdd]">Bri</em> ✦
        </h1>
        <p className="text-[#8a7f7a] text-sm mt-1">{dateLabel}</p>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white border border-[#ede9e5] rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-[#ffabdd]">{todayBookings?.length ?? 0}</p>
          <p className="text-xs text-[#8a7f7a] mt-1">Today</p>
        </div>
        <div className="bg-white border border-[#ede9e5] rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-[#1a1a1a]">{weekCount ?? 0}</p>
          <p className="text-xs text-[#8a7f7a] mt-1">This Week</p>
        </div>
        <div className="bg-white border border-[#ede9e5] rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold text-amber-500">{reviewCount ?? 0}</p>
          <p className="text-xs text-[#8a7f7a] mt-1">Need Review</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <Link
          href="/admin/availability"
          className="flex items-center gap-2 bg-white border border-[#ede9e5] rounded-xl px-4 py-3 text-sm text-[#1a1a1a] hover:border-[#ffabdd]/50 transition-colors"
        >
          <CalendarDays size={16} className="text-[#c4658f]" />Manage hours
        </Link>
        <Link
          href="/admin/services"
          className="flex items-center gap-2 bg-white border border-[#ede9e5] rounded-xl px-4 py-3 text-sm text-[#1a1a1a] hover:border-[#ffabdd]/50 transition-colors"
        >
          <Star size={16} className="text-[#c4658f]" />Edit services
        </Link>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-[#1a1a1a]">Today&apos;s Appointments</h2>
          <Link href="/admin/bookings" className="text-[#c4658f] text-xs">View all</Link>
        </div>
        {todayBookings && todayBookings.length > 0 ? (
          <div className="space-y-2">
            {todayBookings.map((booking) => {
              const badge = bookingActionBadge({ status: booking.status, payment_status: booking.payment_status, booking_images: booking.booking_images })
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
                    <p className="text-xs text-[#b0a8a4] flex items-center gap-1"><Clock size={10} />{booking.appointment_time}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${badge.class}`}>{badge.label}</span>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="bg-white border border-[#ede9e5] rounded-2xl p-8 text-center">
            <p className="text-[#b0a8a4] text-sm">No appointments today</p>
          </div>
        )}
      </div>
    </div>
  )
}
