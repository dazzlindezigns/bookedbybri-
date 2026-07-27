'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { ChevronLeft, Send, Search, Check } from 'lucide-react'

type Channel = 'sms' | 'email' | 'both'
type Recipient = { id: string; type: 'booking' | 'contact'; name: string; phone: string | null; email: string | null }

export default function BroadcastPage() {
  const [message, setMessage] = useState('')
  const [subject, setSubject] = useState('')
  const [channel, setChannel] = useState<Channel>('sms')
  const [audience, setAudience] = useState<'all' | 'select'>('all')
  const [recipients, setRecipients] = useState<Recipient[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState('')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{ smsSent: number; emailSent: number } | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/broadcast').then((r) => r.json()).then(setRecipients).catch(() => {})
  }, [])

  const filtered = useMemo(() =>
    search.trim()
      ? recipients.filter((r) =>
          r.name.toLowerCase().includes(search.toLowerCase()) ||
          (r.phone || '').includes(search) ||
          (r.email || '').toLowerCase().includes(search.toLowerCase())
        )
      : recipients,
    [recipients, search]
  )

  const allSelected = filtered.length > 0 && filtered.every((r) => selected.has(r.id))

  const toggleAll = () => {
    if (allSelected) {
      setSelected((prev) => {
        const next = new Set(prev)
        filtered.forEach((r) => next.delete(r.id))
        return next
      })
    } else {
      setSelected((prev) => {
        const next = new Set(prev)
        filtered.forEach((r) => next.add(r.id))
        return next
      })
    }
  }

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const selectedRecipients = recipients.filter((r) => selected.has(r.id))
  const sendCount = audience === 'all' ? recipients.length : selected.size

  const handleSend = async () => {
    if (!message.trim() || sending) return
    if (audience === 'select' && selected.size === 0) {
      setError('Select at least one person to send to.')
      return
    }
    const label = channel === 'both' ? 'SMS + email' : channel.toUpperCase()
    const to = audience === 'all' ? 'all clients & contacts' : `${selected.size} selected ${selected.size === 1 ? 'person' : 'people'}`
    if (!confirm(`Send this ${label} to ${to}?`)) return

    setSending(true)
    setError('')
    setResult(null)
    try {
      const res = await fetch('/api/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          subject,
          channel,
          selected: audience === 'select' ? selectedRecipients : undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong')
      setResult(data)
      setMessage('')
      setSubject('')
      setSelected(new Set())
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="px-4 py-6 pb-32">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/messages" className="p-1.5 rounded-full hover:bg-[#f7f5f3]">
          <ChevronLeft size={20} className="text-[#1a1a1a]" />
        </Link>
        <h1 className="font-cormorant text-3xl font-semibold text-[#1a1a1a]">Broadcast</h1>
      </div>

      <div className="space-y-5">
        {/* Channel */}
        <div>
          <p className="text-xs font-semibold text-[#8a7f7a] uppercase tracking-wide mb-2">Send via</p>
          <div className="flex gap-2">
            {(['sms', 'email', 'both'] as Channel[]).map((c) => (
              <button
                key={c}
                onClick={() => setChannel(c)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                  channel === c
                    ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]'
                    : 'bg-white text-[#8a7f7a] border-[#ede9e5] hover:border-[#ffabdd]/50'
                }`}
              >
                {c === 'sms' ? 'SMS' : c === 'email' ? 'Email' : 'Both'}
              </button>
            ))}
          </div>
        </div>

        {/* Audience */}
        <div>
          <p className="text-xs font-semibold text-[#8a7f7a] uppercase tracking-wide mb-2">Send to</p>
          <div className="flex gap-2">
            <button
              onClick={() => setAudience('all')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                audience === 'all'
                  ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]'
                  : 'bg-white text-[#8a7f7a] border-[#ede9e5] hover:border-[#ffabdd]/50'
              }`}
            >
              Everyone ({recipients.length})
            </button>
            <button
              onClick={() => setAudience('select')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                audience === 'select'
                  ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]'
                  : 'bg-white text-[#8a7f7a] border-[#ede9e5] hover:border-[#ffabdd]/50'
              }`}
            >
              {audience === 'select' && selected.size > 0 ? `${selected.size} selected` : 'Select people'}
            </button>
          </div>
        </div>

        {/* Recipient selector */}
        {audience === 'select' && (
          <div className="bg-white border border-[#ede9e5] rounded-2xl overflow-hidden">
            {/* Search */}
            <div className="flex items-center gap-2 px-3 py-2.5 border-b border-[#ede9e5]">
              <Search size={14} className="text-[#b0a8a4] flex-shrink-0" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, phone, or email..."
                className="flex-1 text-sm focus:outline-none text-[#1a1a1a] placeholder:text-[#b0a8a4]"
              />
            </div>

            {/* Select all row */}
            <button
              onClick={toggleAll}
              className="w-full flex items-center gap-3 px-4 py-3 border-b border-[#ede9e5] hover:bg-[#fafaf9] transition-colors"
            >
              <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                allSelected ? 'bg-[#1a1a1a] border-[#1a1a1a]' : 'border-[#d0cac7]'
              }`}>
                {allSelected && <Check size={12} className="text-white" />}
              </div>
              <span className="text-sm font-semibold text-[#1a1a1a]">
                {allSelected ? 'Deselect all' : `Select all${search ? ' matching' : ''}`}
              </span>
              <span className="text-xs text-[#b0a8a4] ml-auto">{filtered.length} people</span>
            </button>

            {/* Recipient list */}
            <div className="max-h-60 overflow-y-auto divide-y divide-[#f5f2f0]">
              {filtered.length === 0 && (
                <p className="text-center text-xs text-[#b0a8a4] py-6">No results</p>
              )}
              {filtered.map((r) => {
                const isSelected = selected.has(r.id)
                const sub = [r.phone, r.email].filter(Boolean).join(' · ')
                return (
                  <button
                    key={r.id}
                    onClick={() => toggle(r.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#fafaf9] transition-colors text-left"
                  >
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      isSelected ? 'bg-[#ffabdd] border-[#ffabdd]' : 'border-[#d0cac7]'
                    }`}>
                      {isSelected && <Check size={12} className="text-[#1a1a1a]" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1a1a1a] truncate">{r.name}</p>
                      {sub && <p className="text-xs text-[#8a7f7a] truncate">{sub}</p>}
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                      r.type === 'booking' ? 'bg-[#fff0f8] text-[#c4658f]' : 'bg-[#f0ebe8] text-[#8a7f7a]'
                    }`}>
                      {r.type === 'booking' ? 'client' : 'contact'}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Subject */}
        {(channel === 'email' || channel === 'both') && (
          <div>
            <p className="text-xs font-semibold text-[#8a7f7a] uppercase tracking-wide mb-2">Subject line</p>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Summer special — book now!"
              className="w-full border border-[#ede9e5] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#ffabdd]"
            />
          </div>
        )}

        {/* Message */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-[#8a7f7a] uppercase tracking-wide">Message</p>
            {(channel === 'sms' || channel === 'both') && (
              <p className="text-[11px] text-[#b0a8a4]">{message.length} chars</p>
            )}
          </div>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={channel === 'email' ? 'Write your message...' : 'Keep it short — 160 chars per SMS segment'}
            rows={5}
            className="w-full border border-[#ede9e5] rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-[#ffabdd]"
          />
        </div>

        {/* Result / Error */}
        {result && (
          <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3">
            <p className="text-sm text-green-700 font-semibold">Sent!</p>
            {result.smsSent > 0 && <p className="text-xs text-green-600 mt-0.5">SMS: {result.smsSent} delivered</p>}
            {result.emailSent > 0 && <p className="text-xs text-green-600">Email: {result.emailSent} delivered</p>}
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!message.trim() || sending || (audience === 'select' && selected.size === 0)}
          className="w-full py-3.5 rounded-2xl bg-[#ffabdd] text-[#1a1a1a] font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-40 hover:bg-[#c4658f] hover:text-white transition-all"
        >
          <Send size={15} />
          {sending
            ? 'Sending...'
            : `Send to ${sendCount > 0 ? sendCount : '...'} ${sendCount === 1 ? 'person' : 'people'}`}
        </button>
      </div>
    </div>
  )
}
