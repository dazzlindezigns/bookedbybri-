import Link from 'next/link'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { Megaphone } from 'lucide-react'

type ConversationItem = {
  type: 'booking' | 'contact'
  id: string
  name: string
  phone: string | null
  lastMessage: string
  lastDirection: 'inbound' | 'outbound'
  lastAt: string
}

function timeAgo(iso: string) {
  const now = new Date()
  const then = new Date(iso)
  const diffMins = Math.floor((now.getTime() - then.getTime()) / 60000)
  if (diffMins < 1) return 'Now'
  if (diffMins < 60) return `${diffMins}m`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays}d`
  return then.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function initials(name: string) {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
}

export default async function MessagesPage() {
  const sb = createSupabaseAdminClient()

  const [{ data: bookingMessages }, { data: contactMessages }] = await Promise.all([
    sb.from('booking_messages').select('booking_id, body, direction, created_at').order('created_at', { ascending: false }),
    sb.from('contact_messages').select('contact_id, body, direction, created_at').order('created_at', { ascending: false }),
  ])

  // Deduplicate — keep only the latest message per thread
  const bookingLatest = new Map<string, { body: string; direction: string; created_at: string }>()
  for (const m of bookingMessages || []) {
    if (!bookingLatest.has(m.booking_id)) {
      bookingLatest.set(m.booking_id, { body: m.body, direction: m.direction, created_at: m.created_at })
    }
  }

  const contactLatest = new Map<string, { body: string; direction: string; created_at: string }>()
  for (const m of contactMessages || []) {
    if (!contactLatest.has(m.contact_id)) {
      contactLatest.set(m.contact_id, { body: m.body, direction: m.direction, created_at: m.created_at })
    }
  }

  const bookingIds = [...bookingLatest.keys()]
  const contactIds = [...contactLatest.keys()]

  const [{ data: bookings }, { data: contacts }] = await Promise.all([
    bookingIds.length
      ? sb.from('bookings').select('id, client_name, client_phone').in('id', bookingIds)
      : Promise.resolve({ data: [] as { id: string; client_name: string; client_phone: string }[] }),
    contactIds.length
      ? sb.from('contacts').select('id, name, phone').in('id', contactIds)
      : Promise.resolve({ data: [] as { id: string; name: string | null; phone: string | null }[] }),
  ])

  const conversations: ConversationItem[] = []

  for (const b of bookings || []) {
    const latest = bookingLatest.get(b.id)!
    conversations.push({
      type: 'booking',
      id: b.id,
      name: b.client_name,
      phone: b.client_phone,
      lastMessage: latest.body,
      lastDirection: latest.direction as 'inbound' | 'outbound',
      lastAt: latest.created_at,
    })
  }

  for (const c of contacts || []) {
    const latest = contactLatest.get(c.id)!
    conversations.push({
      type: 'contact',
      id: c.id,
      name: c.name || c.phone || 'Unknown',
      phone: c.phone,
      lastMessage: latest.body,
      lastDirection: latest.direction as 'inbound' | 'outbound',
      lastAt: latest.created_at,
    })
  }

  conversations.sort((a, b) => new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime())

  return (
    <div className="px-4 py-6">
      <div className="flex items-center justify-between mb-5">
        <h1 className="font-cormorant text-3xl font-semibold text-[#1a1a1a]">Messages</h1>
        <Link
          href="/admin/messages/broadcast"
          className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#1a1a1a] text-white text-xs font-medium hover:bg-[#2a2a2a] transition-colors"
        >
          <Megaphone size={13} />
          Broadcast
        </Link>
      </div>

      {conversations.length === 0 ? (
        <div className="bg-white border border-[#ede9e5] rounded-2xl p-10 text-center">
          <p className="text-[#b0a8a4] text-sm">No messages yet</p>
          <p className="text-[#b0a8a4] text-xs mt-1">Messages from clients will appear here</p>
        </div>
      ) : (
        <div className="bg-white border border-[#ede9e5] rounded-2xl overflow-hidden divide-y divide-[#f0ebe8]">
          {conversations.map((convo) => {
            const href = convo.type === 'booking'
              ? `/admin/bookings/${convo.id}`
              : `/admin/messages/contacts/${convo.id}`
            return (
              <Link
                key={`${convo.type}-${convo.id}`}
                href={href}
                className="flex items-center gap-3 px-4 py-3.5 hover:bg-[#fafaf9] transition-colors"
              >
                <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${
                  convo.type === 'booking' ? 'bg-[#fff0f8]' : 'bg-[#f0ebe8]'
                }`}>
                  <span className={`text-sm font-semibold ${
                    convo.type === 'booking' ? 'text-[#c4658f]' : 'text-[#8a7f7a]'
                  }`}>
                    {initials(convo.name)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <p className="font-semibold text-sm text-[#1a1a1a] truncate">{convo.name}</p>
                    <p className="text-[11px] text-[#b0a8a4] flex-shrink-0">{timeAgo(convo.lastAt)}</p>
                  </div>
                  <p className="text-xs text-[#8a7f7a] truncate">
                    {convo.lastDirection === 'outbound' ? <span className="text-[#b0a8a4]">You: </span> : null}
                    {convo.lastMessage}
                  </p>
                </div>
                {convo.lastDirection === 'inbound' && (
                  <div className="w-2 h-2 rounded-full bg-[#ffabdd] flex-shrink-0" />
                )}
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
