'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, Plus, X, Phone, Mail } from 'lucide-react'
import type { PersonRecord } from '@/app/api/people/route'

type Tab = 'all' | 'clients' | 'contacts'

function timeAgo(iso: string) {
  const diffMins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (diffMins < 1) return 'Now'
  if (diffMins < 60) return `${diffMins}m`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays}d`
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function initials(name: string) {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
}

function isPhoneNumber(s: string) {
  return s.replace(/\D/g, '').length >= 10
}

export default function MessagesPage() {
  const router = useRouter()
  const [people, setPeople] = useState<PersonRecord[]>([])
  const [tab, setTab] = useState<Tab>('all')
  const [search, setSearch] = useState('')
  const [composeOpen, setComposeOpen] = useState(false)
  const [composeSearch, setComposeSearch] = useState('')
  const [creating, setCreating] = useState(false)
  const composeInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/people').then((r) => r.json()).then(setPeople).catch(() => {})
  }, [])

  useEffect(() => {
    if (composeOpen) setTimeout(() => composeInputRef.current?.focus(), 100)
  }, [composeOpen])

  const filtered = useMemo(() => {
    let list = people
    if (tab === 'clients') list = list.filter((p) => p.type === 'booking')
    if (tab === 'contacts') list = list.filter((p) => p.type === 'contact')
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        (p.phone || '').includes(q) ||
        (p.email || '').toLowerCase().includes(q)
      )
    }
    return list
  }, [people, tab, search])

  const composeSuggestions = useMemo(() => {
    if (!composeSearch.trim()) return people
    const q = composeSearch.toLowerCase()
    return people.filter((p) =>
      p.name.toLowerCase().includes(q) ||
      (p.phone || '').includes(q) ||
      (p.email || '').toLowerCase().includes(q)
    )
  }, [people, composeSearch])

  const showNewNumber = composeSearch.trim() && isPhoneNumber(composeSearch) &&
    !people.some((p) => (p.phone || '').replace(/\D/g, '').includes(composeSearch.replace(/\D/g, '')))

  const handleSelectPerson = (person: PersonRecord) => {
    setComposeOpen(false)
    setComposeSearch('')
    const href = person.type === 'booking'
      ? `/admin/bookings/${person.id}`
      : `/admin/messages/contacts/${person.id}`
    router.push(href)
  }

  const handleNewNumber = async () => {
    if (creating) return
    setCreating(true)
    const digits = composeSearch.replace(/\D/g, '')
    const phone = digits.length === 10 ? `+1${digits}` : `+${digits}`
    const res = await fetch('/api/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    })
    const contact = await res.json()
    setCreating(false)
    setComposeOpen(false)
    setComposeSearch('')
    router.push(`/admin/messages/contacts/${contact.id}`)
  }

  const hrefFor = (p: PersonRecord) =>
    p.type === 'booking' ? `/admin/bookings/${p.id}` : `/admin/messages/contacts/${p.id}`

  const counts = {
    all: people.length,
    clients: people.filter((p) => p.type === 'booking').length,
    contacts: people.filter((p) => p.type === 'contact').length,
  }

  return (
    <div className="px-4 py-6 pb-28">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-cormorant text-3xl font-semibold text-[#1a1a1a]">Messages</h1>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/messages/broadcast"
            className="px-3 py-1.5 rounded-full bg-[#f0ebe8] text-[#8a7f7a] text-xs font-medium hover:bg-[#e8e2de] transition-colors"
          >
            Broadcast
          </Link>
          <button
            onClick={() => setComposeOpen(true)}
            className="w-9 h-9 rounded-full bg-[#ffabdd] flex items-center justify-center hover:bg-[#c4658f] transition-colors"
          >
            <Plus size={18} className="text-[#1a1a1a]" />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-white border border-[#ede9e5] rounded-xl px-3 py-2.5 mb-4">
        <Search size={15} className="text-[#b0a8a4] flex-shrink-0" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search clients & contacts..."
          className="flex-1 text-sm focus:outline-none text-[#1a1a1a] placeholder:text-[#b0a8a4]"
        />
        {search && (
          <button onClick={() => setSearch('')}>
            <X size={14} className="text-[#b0a8a4]" />
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {(['all', 'clients', 'contacts'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              tab === t
                ? 'bg-[#1a1a1a] text-white'
                : 'bg-white border border-[#ede9e5] text-[#8a7f7a] hover:border-[#ffabdd]/50'
            }`}
          >
            {t === 'all' ? 'All' : t === 'clients' ? 'Clients' : 'Contacts'} · {counts[t]}
          </button>
        ))}
      </div>

      {/* People list */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-[#ede9e5] rounded-2xl p-10 text-center">
          <p className="text-[#b0a8a4] text-sm">{search ? 'No results' : 'No people yet'}</p>
        </div>
      ) : (
        <div className="bg-white border border-[#ede9e5] rounded-2xl overflow-hidden divide-y divide-[#f0ebe8]">
          {filtered.map((person) => (
            <Link
              key={`${person.type}-${person.id}`}
              href={hrefFor(person)}
              className="flex items-center gap-3 px-4 py-3.5 hover:bg-[#fafaf9] transition-colors"
            >
              <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${
                person.type === 'booking' ? 'bg-[#fff0f8]' : 'bg-[#f0ebe8]'
              }`}>
                <span className={`text-sm font-semibold ${
                  person.type === 'booking' ? 'text-[#c4658f]' : 'text-[#8a7f7a]'
                }`}>
                  {initials(person.name)}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <p className="font-semibold text-sm text-[#1a1a1a] truncate">{person.name}</p>
                  {person.lastMessageAt && (
                    <p className="text-[11px] text-[#b0a8a4] flex-shrink-0">{timeAgo(person.lastMessageAt)}</p>
                  )}
                </div>
                {person.lastMessage ? (
                  <p className="text-xs text-[#8a7f7a] truncate">
                    {person.lastDirection === 'outbound'
                      ? <span className="text-[#b0a8a4]">You: </span>
                      : null}
                    {person.lastMessage}
                  </p>
                ) : (
                  <div className="flex items-center gap-2">
                    {person.phone && (
                      <span className="text-xs text-[#b0a8a4] flex items-center gap-1">
                        <Phone size={10} />{person.phone}
                      </span>
                    )}
                    {person.email && (
                      <span className="text-xs text-[#b0a8a4] flex items-center gap-1">
                        <Mail size={10} />{person.email}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {person.lastDirection === 'inbound' && (
                <div className="w-2.5 h-2.5 rounded-full bg-[#ffabdd] flex-shrink-0" />
              )}
            </Link>
          ))}
        </div>
      )}

      {/* Compose sheet */}
      {composeOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => { setComposeOpen(false); setComposeSearch('') }} />
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 max-h-[75vh] flex flex-col">
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-[#f0ebe8]">
              <p className="font-semibold text-[#1a1a1a]">New message</p>
              <button onClick={() => { setComposeOpen(false); setComposeSearch('') }}>
                <X size={20} className="text-[#8a7f7a]" />
              </button>
            </div>

            <div className="px-4 py-3 border-b border-[#f0ebe8]">
              <div className="flex items-center gap-2 bg-[#f7f5f3] rounded-xl px-3 py-2.5">
                <Search size={14} className="text-[#b0a8a4] flex-shrink-0" />
                <input
                  ref={composeInputRef}
                  value={composeSearch}
                  onChange={(e) => setComposeSearch(e.target.value)}
                  placeholder="Search name, phone, or enter a number..."
                  className="flex-1 text-sm bg-transparent focus:outline-none text-[#1a1a1a] placeholder:text-[#b0a8a4]"
                />
              </div>
            </div>

            <div className="overflow-y-auto flex-1 divide-y divide-[#f5f2f0]">
              {showNewNumber && (
                <button
                  onClick={handleNewNumber}
                  disabled={creating}
                  className="w-full flex items-center gap-3 px-5 py-4 hover:bg-[#fafaf9] transition-colors text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-[#fff0f8] flex items-center justify-center flex-shrink-0">
                    <Plus size={18} className="text-[#c4658f]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#1a1a1a]">{creating ? 'Creating...' : 'New contact'}</p>
                    <p className="text-xs text-[#8a7f7a]">{composeSearch}</p>
                  </div>
                </button>
              )}

              {composeSuggestions.length === 0 && !showNewNumber && (
                <p className="text-center text-xs text-[#b0a8a4] py-8">No results — try a phone number to start fresh</p>
              )}

              {composeSuggestions.map((person) => (
                <button
                  key={`${person.type}-${person.id}`}
                  onClick={() => handleSelectPerson(person)}
                  className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-[#fafaf9] transition-colors text-left"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    person.type === 'booking' ? 'bg-[#fff0f8]' : 'bg-[#f0ebe8]'
                  }`}>
                    <span className={`text-sm font-semibold ${
                      person.type === 'booking' ? 'text-[#c4658f]' : 'text-[#8a7f7a]'
                    }`}>
                      {initials(person.name)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1a1a1a] truncate">{person.name}</p>
                    <p className="text-xs text-[#b0a8a4] truncate">{person.phone || person.email || ''}</p>
                  </div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                    person.type === 'booking' ? 'bg-[#fff0f8] text-[#c4658f]' : 'bg-[#f0ebe8] text-[#8a7f7a]'
                  }`}>
                    {person.type === 'booking' ? 'client' : 'contact'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
