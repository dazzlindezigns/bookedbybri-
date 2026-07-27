import Link from 'next/link'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { ChevronRight } from 'lucide-react'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function initials(name: string) {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
}

export default async function AdminHome() {
  const sb = createSupabaseAdminClient()
  const today = new Date().toISOString().slice(0, 10)
  const weekEnd = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10)

  const [
    { data: pendingBookings },
    { data: todayBookings },
    { data: upcomingBookings },
    { data: bookingMsgs },
    { data: contactMsgs },
    { data: contacts },
    { data: allClients },
  ] = await Promise.all([
    sb.from('bookings')
      .select('id, client_name, appointment_date, appointment_time, services(name)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false }),
    sb.from('bookings')
      .select('id, client_name, appointment_time, status, services(name)')
      .eq('appointment_date', today)
      .not('status', 'in', '("cancelled","declined")')
      .order('appointment_time', { ascending: true }),
    sb.from('bookings')
      .select('id, client_name, appointment_date, appointment_time, services(name)')
      .gt('appointment_date', today)
      .lte('appointment_date', weekEnd)
      .eq('status', 'confirmed')
      .order('appointment_date', { ascending: true })
      .order('appointment_time', { ascending: true })
      .limit(5),
    sb.from('booking_messages')
      .select('booking_id, body, direction, created_at')
      .order('created_at', { ascending: false }),
    sb.from('contact_messages')
      .select('contact_id, body, direction, created_at')
      .order('created_at', { ascending: false }),
    sb.from('contacts').select('id, name, phone'),
    sb.from('bookings').select('id, client_name').not('status', 'in', '("cancelled","declined")'),
  ])

  // Build maps of latest message per booking/contact
  const bookingLatestMap = new Map<string, { body: string; direction: string }>()
  for (const m of bookingMsgs || []) {
    if (!bookingLatestMap.has(m.booking_id)) bookingLatestMap.set(m.booking_id, m)
  }
  const contactLatestMap = new Map<string, { body: string; direction: string }>()
  for (const m of contactMsgs || []) {
    if (!contactLatestMap.has(m.contact_id)) contactLatestMap.set(m.contact_id, m)
  }

  type UnreadItem = { id: string; type: 'booking' | 'contact'; name: string; preview: string; href: string }
  const unread: UnreadItem[] = []

  const clientMap = new Map<string, string>()
  for (const b of allClients || []) clientMap.set(b.id, b.client_name)

  for (const [bookingId, msg] of Array.from(bookingLatestMap.entries())) {
    if (msg.direction === 'inbound') {
      const name = clientMap.get(bookingId) || 'Client'
      unread.push({ id: bookingId, type: 'booking', name, preview: msg.body, href: `/admin/bookings/${bookingId}` })
    }
  }

  const contactMap = new Map<string, string>()
  for (const c of contacts || []) contactMap.set(c.id, c.name || c.phone || 'Contact')

  for (const [contactId, msg] of Array.from(contactLatestMap.entries())) {
    if (msg.direction === 'inbound') {
      const name = contactMap.get(contactId) || 'Contact'
      unread.push({ id: contactId, type: 'contact', name, preview: msg.body, href: `/admin/messages/contacts/${contactId}` })
    }
  }

  const allCaughtUp = (pendingBookings?.length ?? 0) === 0 && unread.length === 0
  const dateLabel = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <div className="px-4 py-6 pb-28">
      {/* Greeting */}
      <div className="mb-6">
        <h1 className="font-cormorant text-3xl font-semibold text-[#1a1a1a]">
          {getGreeting()}, <em className="italic text-[#ffabdd]">Bri</em> ✦
        </h1>
        <p className="text-[#8a7f7a] text-sm mt-0.5">{dateLabel}</p>
      </div>

      {/* All caught up */}
      {allCaughtUp && (
        <div className="bg-green-50 border border-green-100 rounded-2xl px-5 py-4 mb-5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
            <span className="text-green-600 text-sm font-bold">✓</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-green-700">All caught up</p>
            <p className="text-xs text-green-600 mt-0.5">No pending requests or unread messages</p>
          </div>
        </div>
      )}

      {/* Pending requests */}
      {(pendingBookings?.length ?? 0) > 0 && (
        <div className="mb-5">
          <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-2">
            Needs Review · {pendingBookings!.length}
          </p>
          <div className="bg-white border border-amber-100 rounded-2xl overflow-hidden divide-y divide-amber-50">
            {pendingBookings!.map((b) => {
              const dateStr = (b.appointment_date || '').slice(0, 10)
              const formattedDate = dateStr
                ? new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                : '—'
              return (
                <Link
                  key={b.id}
                  href={`/admin/bookings/${b.id}`}
                  className="flex items-center gap-3 px-4 py-3.5 hover:bg-amber-50/50 transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0">
                    <span className="text-amber-600 text-xs font-semibold">{initials(b.client_name)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1a1a1a] truncate">{b.client_name}</p>
                    <p className="text-xs text-[#8a7f7a] truncate">
                      {(b.services as { name: string } | null)?.name}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-[#b0a8a4]">{formattedDate}</p>
                    <p className="text-[10px] text-amber-500 font-semibold mt-0.5">Review →</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Unread messages */}
      {unread.length > 0 && (
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-[#c4658f] uppercase tracking-wide">
              New Messages · {unread.length}
            </p>
            <Link href="/admin/messages" className="text-xs text-[#b0a8a4] hover:text-[#1a1a1a] flex items-center gap-0.5">
              All <ChevronRight size={12} />
            </Link>
          </div>
          <div className="bg-white border border-[#ffabdd]/30 rounded-2xl overflow-hidden divide-y divide-[#fff0f8]">
            {unread.slice(0, 5).map((item) => (
              <Link
                key={`${item.type}-${item.id}`}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3.5 hover:bg-[#fff8fc] transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-[#fff0f8] flex items-center justify-center flex-shrink-0">
                  <span className="text-[#c4658f] text-xs font-semibold">{initials(item.name)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1a1a1a] truncate">{item.name}</p>
                  <p className="text-xs text-[#8a7f7a] truncate">{item.preview}</p>
                </div>
                <div className="w-2.5 h-2.5 rounded-full bg-[#ffabdd] flex-shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Today's schedule */}
      {(todayBookings?.length ?? 0) > 0 && (
        <div className="mb-5">
          <p className="text-xs font-semibold text-[#8a7f7a] uppercase tracking-wide mb-2">Today</p>
          <div className="bg-white border border-[#ede9e5] rounded-2xl overflow-hidden divide-y divide-[#f5f2f0]">
            {(todayBookings || []).map((b) => (
              <Link
                key={b.id}
                href={`/admin/bookings/${b.id}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-[#fafaf9] transition-colors"
              >
                <p className="text-xs font-semibold text-[#1a1a1a] w-12 flex-shrink-0">{b.appointment_time}</p>
                <div className="w-px h-8 bg-[#f0ebe8] flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1a1a1a] truncate">{b.client_name}</p>
                  <p className="text-xs text-[#8a7f7a] truncate">
                    {(b.services as { name: string } | null)?.name}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Coming up */}
      {(upcomingBookings?.length ?? 0) > 0 && (
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-[#8a7f7a] uppercase tracking-wide">Coming Up</p>
            <Link href="/admin/calendar" className="text-xs text-[#b0a8a4] hover:text-[#1a1a1a] flex items-center gap-0.5">
              Calendar <ChevronRight size={12} />
            </Link>
          </div>
          <div className="bg-white border border-[#ede9e5] rounded-2xl overflow-hidden divide-y divide-[#f5f2f0]">
            {(upcomingBookings || []).map((b) => {
              const dateStr = (b.appointment_date || '').slice(0, 10)
              const formattedDate = dateStr
                ? new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                : '—'
              return (
                <Link
                  key={b.id}
                  href={`/admin/bookings/${b.id}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-[#fafaf9] transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1a1a1a] truncate">{b.client_name}</p>
                    <p className="text-xs text-[#8a7f7a] truncate">
                      {(b.services as { name: string } | null)?.name}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-[#b0a8a4]">{formattedDate}</p>
                    <p className="text-[11px] text-[#b0a8a4] mt-0.5">{b.appointment_time}</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
