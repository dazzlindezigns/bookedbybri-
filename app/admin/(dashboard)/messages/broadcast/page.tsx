'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, Send } from 'lucide-react'

type Channel = 'sms' | 'email' | 'both'

export default function BroadcastPage() {
  const [message, setMessage] = useState('')
  const [subject, setSubject] = useState('')
  const [channel, setChannel] = useState<Channel>('sms')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{ smsSent: number; emailSent: number } | null>(null)
  const [error, setError] = useState('')

  const handleSend = async () => {
    if (!message.trim() || sending) return
    const label = channel === 'both' ? 'SMS + email' : channel.toUpperCase()
    if (!confirm(`Send this ${label} broadcast to all clients and contacts?`)) return
    setSending(true)
    setError('')
    setResult(null)
    try {
      const res = await fetch('/api/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, subject, channel }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong')
      setResult(data)
      setMessage('')
      setSubject('')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="px-4 py-6">
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

        {/* Subject (email only) */}
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
            placeholder={
              channel === 'email'
                ? 'Write your message...'
                : 'Keep it short — 160 chars per SMS segment'
            }
            rows={6}
            className="w-full border border-[#ede9e5] rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-[#ffabdd]"
          />
        </div>

        {/* Result */}
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

        {/* Send */}
        <button
          onClick={handleSend}
          disabled={!message.trim() || sending}
          className="w-full py-3.5 rounded-2xl bg-[#ffabdd] text-[#1a1a1a] font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-40 hover:bg-[#c4658f] hover:text-white transition-all"
        >
          <Send size={15} />
          {sending ? 'Sending...' : 'Send to all clients & contacts'}
        </button>

        <p className="text-xs text-[#b0a8a4] text-center leading-relaxed">
          Sends to all clients with bookings + all saved contacts.{'\n'}
          SMS requires Telnyx · Email requires Google to be connected.
        </p>
      </div>
    </div>
  )
}
