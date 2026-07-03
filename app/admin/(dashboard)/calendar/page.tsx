import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'

type CalendarBooking = {
  id: string
  client_name: string
  appointment_date: string
  appointment_time: string
  status: string
  services: { name: string } | null
}

const STATUS_COLOR: Record<string, string> = {
  confirmed: 'bg-[#ffabdd] text-[#1a1a1a]',
  pending: 'bg-amber-100 text-amber-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-gray-100 text-gray-500',
  declined: 'bg-red-100 text-red-600',
  no_show: 'bg-orange-100 text-orange-700',
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: { month?: string; year?: string }
}) {
  const now = new Date()
  const year = parseInt(searchParams.year || String(now.getFullYear()))
  const month = parseInt(searchParams.month || String(now.getMonth() + 1))

  if (isNaN(year) || isNaN(month) || month < 1 || month > 12) notFound()

  const sb = createSupabaseServerClient()

  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const endDate = `${year}-${String(month).padStart(2, '0')}-${new Date(year, month, 0).getDate()}`

  const { data: rawBookings } = await sb
    .from('bookings')
    .select('id, client_name, appointment_date, appointment_time, status, services(name)')
    .gte('appointment_date', startDate)
    .lte('appointment_date', endDate)
    .not('status', 'in', '("declined","cancelled")')
    .order('appointment_time')

  const bookings = (rawBookings || []) as CalendarBooking[]

  // Group by date
  const byDate: Record<string, CalendarBooking[]> = {}
  for (const b of bookings) {
    if (!byDate[b.appointment_date]) byDate[b.appointment_date] = []
    byDate[b.appointment_date].push(b)
  }

  // Calendar grid
  const firstDayOfMonth = new Date(year, month - 1, 1).getDay()
  const daysInMonth = new Date(year, month, 0).getDate()
  const days: (number | null)[] = Array(firstDayOfMonth).fill(null)
  for (let d = 1; d <= daysInMonth; d++) days.push(d)

  const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })

  const prevMonth = month === 1 ? 12 : month - 1
  const prevYear = month === 1 ? year - 1 : year
  const nextMonth = month === 12 ? 1 : month + 1
  const nextYear = month === 12 ? year + 1 : year

  const todayStr = new Date().toISOString().split('T')[0]

  return (
    <div className="px-4 py-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="font-cormorant text-3xl font-semibold text-[#1a1a1a]">Calendar</h1>
        <Link href="/admin/bookings" className="text-xs text-[#8a7f7a] hover:text-[#1a1a1a]">List view →</Link>
      </div>

      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <Link
          href={`/admin/calendar?month=${prevMonth}&year=${prevYear}`}
          className="p-2 rounded-full hover:bg-[#f7f5f3] text-[#1a1a1a] transition-colors"
        >
          ←
        </Link>
        <p className="font-semibold text-[#1a1a1a]">{monthName}</p>
        <Link
          href={`/admin/calendar?month=${nextMonth}&year=${nextYear}`}
          className="p-2 rounded-full hover:bg-[#f7f5f3] text-[#1a1a1a] transition-colors"
        >
          →
        </Link>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d} className="text-center text-xs text-[#b0a8a4] py-1 font-medium">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 border-t border-l border-[#ede9e5]">
        {days.map((day, idx) => {
          if (!day) {
            return (
              <div key={idx} className="min-h-[80px] border-b border-r border-[#ede9e5] bg-[#fafaf9]" />
            )
          }

          const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const dayBookings = byDate[dateStr] || []
          const isToday = dateStr === todayStr
          const hasConflict = dayBookings.filter((b) => b.status === 'confirmed').length > 1

          return (
            <div
              key={idx}
              className={`min-h-[80px] border-b border-r border-[#ede9e5] p-1 ${
                isToday ? 'bg-[#fff8fc]' : 'bg-white'
              } ${hasConflict ? 'ring-1 ring-inset ring-amber-300' : ''}`}
            >
              <p className={`text-xs mb-1 w-6 h-6 flex items-center justify-center rounded-full ${
                isToday ? 'bg-[#ffabdd] text-[#1a1a1a] font-bold' : 'text-[#8a7f7a]'
              }`}>
                {day}
              </p>
              <div className="space-y-0.5">
                {dayBookings.slice(0, 3).map((b) => (
                  <Link
                    key={b.id}
                    href={`/admin/bookings/${b.id}`}
                    className={`block text-[10px] leading-tight px-1 py-0.5 rounded truncate ${STATUS_COLOR[b.status] || STATUS_COLOR.confirmed}`}
                    title={`${b.client_name} · ${b.appointment_time}`}
                  >
                    {b.appointment_time.replace(':00', '').replace(' ', '')} {b.client_name.split(' ')[0]}
                  </Link>
                ))}
                {dayBookings.length > 3 && (
                  <p className="text-[10px] text-[#b0a8a4] pl-1">+{dayBookings.length - 3} more</p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-4">
        {[
          { color: 'bg-[#ffabdd]', label: 'Confirmed' },
          { color: 'bg-amber-100', label: 'Pending' },
          { color: 'bg-green-100', label: 'Completed' },
          { color: 'bg-orange-100', label: 'No show' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded ${color}`} />
            <span className="text-xs text-[#8a7f7a]">{label}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded border border-amber-300 ring-1 ring-amber-300" />
          <span className="text-xs text-[#8a7f7a]">Conflict</span>
        </div>
      </div>

      {/* Upcoming this month */}
      {bookings.filter((b) => b.status === 'confirmed' && b.appointment_date >= todayStr).length > 0 && (
        <div className="mt-6">
          <h2 className="text-sm font-semibold text-[#1a1a1a] mb-3">Upcoming confirmed</h2>
          <div className="space-y-2">
            {bookings
              .filter((b) => b.status === 'confirmed' && b.appointment_date >= todayStr)
              .sort((a, b) => a.appointment_date.localeCompare(b.appointment_date) || a.appointment_time.localeCompare(b.appointment_time))
              .map((b) => (
                <Link
                  key={b.id}
                  href={`/admin/bookings/${b.id}`}
                  className="flex items-center gap-3 bg-white border border-[#ede9e5] rounded-xl p-3 hover:border-[#ffabdd]/50 transition-colors"
                >
                  <div className="text-center flex-shrink-0 w-10">
                    <p className="text-xs text-[#8a7f7a]">
                      {new Date(b.appointment_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short' })}
                    </p>
                    <p className="text-lg font-bold text-[#1a1a1a] leading-tight">
                      {new Date(b.appointment_date + 'T12:00:00').getDate()}
                    </p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-[#1a1a1a] truncate">{b.client_name}</p>
                    <p className="text-xs text-[#8a7f7a] truncate">{b.services?.name} · {b.appointment_time}</p>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[#fff0f8] text-[#c4658f] border border-[#ffabdd]/30 flex-shrink-0">
                    Confirmed
                  </span>
                </Link>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}
