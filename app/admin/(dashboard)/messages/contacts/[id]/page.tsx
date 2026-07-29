'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { ChevronLeft, Phone, MessageSquare, Calendar, Mail, Pencil, Check, X, Send } from 'lucide-react'

type Message = { id: string; direction: 'inbound' | 'outbound'; body: string; created_at: string }
type Contact = { id: string; name: string | null; phone: string | null; email: string | null; notes: string | null; created_at: string }
type Tab = 'overview' | 'messages' | 'notes'

function initials(name: string | null) {
  if (!name) return '?'
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
}

function timeLabel(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

export default function ContactProfilePage({ params }: { params: { id: string } }) {
  const [contact, setContact] = useState<Contact | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [tab, setTab] = useState<Tab>('overview')
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [notes, setNotes] = useState('')
  const [savingNotes, setSavingNotes] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const load = async () => {
    const [contactRes, msgsRes] = await Promise.all([
      fetch(`/api/contacts/${params.id}`),
      fetch(`/api/contacts/${params.id}/messages`),
    ])
    const contactData = await contactRes.json()
    const msgsData = await msgsRes.json()
    setContact(contactData)
    setMessages(Array.isArray(msgsData) ? msgsData : [])
    setEditName(contactData.name || '')
    setEditPhone(contactData.phone || '')
    setEditEmail(contactData.email || '')
    setNotes(contactData.notes || '')
  }

  useEffect(() => { load() }, [])
  useEffect(() => {
    if (tab === 'messages') messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, tab])

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return
    setSending(true)
    const body = newMessage.trim()
    setNewMessage('')
    await fetch(`/api/contacts/${params.id}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body }),
    })
    await load()
    setSending(false)
  }

  const handleSave = async () => {
    await fetch(`/api/contacts/${params.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName, phone: editPhone, email: editEmail }),
    })
    setEditing(false)
    await load()
  }

  const handleSaveNotes = async () => {
    setSavingNotes(true)
    await fetch(`/api/contacts/${params.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes }),
    })
    setSavingNotes(false)
    await load()
  }

  if (!contact) {
    return <div className="flex items-center justify-center h-screen text-[#b0a8a4] text-sm">Loading...</div>
  }

  const displayName = contact.name || contact.phone || 'Unknown'

  return (
    <div className="flex flex-col h-[100dvh]">
      {/* Dark header */}
      <div className="bg-[#1a1a1a] px-4 pt-4 pb-6 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <Link href="/admin/messages" className="p-1.5 rounded-full hover:bg-white/10">
            <ChevronLeft size={20} className="text-white" />
          </Link>
          {editing ? (
            <div className="flex gap-1">
              <button onClick={handleSave} className="p-1.5 rounded-full bg-[#ffabdd]">
                <Check size={15} className="text-[#1a1a1a]" />
              </button>
              <button onClick={() => setEditing(false)} className="p-1.5 rounded-full hover:bg-white/10">
                <X size={15} className="text-white/60" />
              </button>
            </div>
          ) : (
            <button onClick={() => setEditing(true)} className="p-1.5 rounded-full hover:bg-white/10">
              <Pencil size={15} className="text-white/60" />
            </button>
          )}
        </div>

        {/* Avatar + name */}
        <div className="flex flex-col items-center gap-2 mb-5">
          <div className="w-20 h-20 rounded-full bg-[#fff0f8] flex items-center justify-center">
            <span className="text-2xl font-bold text-[#c4658f]">{initials(contact.name)}</span>
          </div>
          {editing ? (
            <div className="w-full max-w-xs space-y-2 mt-1">
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Full name"
                className="w-full text-center text-sm bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white placeholder:text-white/30 focus:outline-none focus:border-[#ffabdd]"
              />
              <input
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                placeholder="Phone"
                className="w-full text-center text-sm bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white placeholder:text-white/30 focus:outline-none focus:border-[#ffabdd]"
              />
              <input
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                placeholder="Email"
                className="w-full text-center text-sm bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white placeholder:text-white/30 focus:outline-none focus:border-[#ffabdd]"
              />
            </div>
          ) : (
            <>
              <p className="text-white font-semibold text-xl">{displayName}</p>
              {contact.phone && <p className="text-[#ffabdd] text-sm">{contact.phone}</p>}
            </>
          )}
        </div>

        {/* Action buttons */}
        {!editing && (
          <div className="flex justify-center gap-6">
            {contact.phone && (
              <a href={`tel:${contact.phone}`} className="flex flex-col items-center gap-1.5">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                  <Phone size={18} className="text-white" />
                </div>
                <span className="text-[10px] text-white/50">Call</span>
              </a>
            )}
            <button onClick={() => setTab('messages')} className="flex flex-col items-center gap-1.5">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                <MessageSquare size={18} className="text-white" />
              </div>
              <span className="text-[10px] text-white/50">Text</span>
            </button>
            <Link
              href={`/admin/bookings/new?phone=${encodeURIComponent(contact.phone || '')}&name=${encodeURIComponent(contact.name || '')}`}
              className="flex flex-col items-center gap-1.5"
            >
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                <Calendar size={18} className="text-white" />
              </div>
              <span className="text-[10px] text-white/50">Book</span>
            </Link>
            {contact.email && (
              <a href={`mailto:${contact.email}`} className="flex flex-col items-center gap-1.5">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                  <Mail size={18} className="text-white" />
                </div>
                <span className="text-[10px] text-white/50">Email</span>
              </a>
            )}
          </div>
        )}
      </div>

      {/* Tab bar */}
      <div className="bg-[#1a1a1a] border-t border-white/10 flex flex-shrink-0">
        {(['overview', 'messages', 'notes'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-3 text-xs font-semibold transition-colors border-b-2 ${
              tab === t ? 'text-[#ffabdd] border-[#ffabdd]' : 'text-white/40 border-transparent'
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden bg-[#f7f5f3]">

        {/* Overview */}
        {tab === 'overview' && (
          <div className="overflow-y-auto h-full p-4 space-y-3">
            <div className="bg-white rounded-2xl border border-[#ede9e5] overflow-hidden">
              {contact.phone && (
                <div className="flex items-center gap-3 px-4 py-3 border-b border-[#ede9e5]">
                  <Phone size={15} className="text-[#c4658f] flex-shrink-0" />
                  <span className="text-sm text-[#1a1a1a]">{contact.phone}</span>
                </div>
              )}
              {contact.email && (
                <div className="flex items-center gap-3 px-4 py-3 border-b border-[#ede9e5]">
                  <Mail size={15} className="text-[#c4658f] flex-shrink-0" />
                  <span className="text-sm text-[#1a1a1a]">{contact.email}</span>
                </div>
              )}
              {contact.created_at && (
                <div className="flex items-center gap-3 px-4 py-3">
                  <Calendar size={15} className="text-[#c4658f] flex-shrink-0" />
                  <span className="text-sm text-[#8a7f7a]">
                    Contact since {new Date(contact.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </span>
                </div>
              )}
            </div>

            {messages.length > 0 && (
              <div>
                <p className="text-[10px] text-[#b0a8a4] font-semibold uppercase tracking-widest mb-2 px-1">Last message</p>
                <button
                  onClick={() => setTab('messages')}
                  className="w-full bg-white rounded-2xl border border-[#ede9e5] p-4 text-left hover:border-[#ffabdd]/50 transition-colors"
                >
                  <p className="text-sm text-[#1a1a1a] line-clamp-2">{messages[messages.length - 1].body}</p>
                  <p className="text-xs text-[#b0a8a4] mt-1">{timeLabel(messages[messages.length - 1].created_at)}</p>
                </button>
              </div>
            )}

            <div>
              <p className="text-[10px] text-[#b0a8a4] font-semibold uppercase tracking-widest mb-2 px-1">Notes</p>
              <button
                onClick={() => setTab('notes')}
                className="w-full bg-white rounded-2xl border border-[#ede9e5] p-4 text-left hover:border-[#ffabdd]/50 transition-colors"
              >
                {contact.notes ? (
                  <p className="text-sm text-[#1a1a1a] line-clamp-3">{contact.notes}</p>
                ) : (
                  <p className="text-sm text-[#b0a8a4]">Tap to add notes...</p>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Messages */}
        {tab === 'messages' && (
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
              {messages.length === 0 && (
                <p className="text-center text-xs text-[#b0a8a4] mt-10">No messages yet</p>
              )}
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[78%] px-3.5 py-2.5 rounded-2xl ${
                    msg.direction === 'outbound'
                      ? 'bg-[#1a1a1a] text-white rounded-br-sm'
                      : 'bg-white text-[#1a1a1a] border border-[#ede9e5] rounded-bl-sm'
                  }`}>
                    <p className="text-sm leading-relaxed">{msg.body}</p>
                    <p className={`text-[10px] mt-0.5 ${msg.direction === 'outbound' ? 'text-white/40' : 'text-[#b0a8a4]'}`}>
                      {timeLabel(msg.created_at)}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="bg-white border-t border-[#ede9e5] px-4 py-3 flex-shrink-0">
              <div className="flex items-end gap-2">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                  placeholder="Message..."
                  rows={1}
                  className="flex-1 resize-none rounded-2xl border border-[#ede9e5] px-4 py-2.5 text-sm text-[#1a1a1a] placeholder:text-[#b0a8a4] focus:outline-none focus:border-[#ffabdd] min-h-[42px] max-h-[120px]"
                />
                <button
                  onClick={handleSend}
                  disabled={!newMessage.trim() || sending}
                  className="w-10 h-10 rounded-full bg-[#ffabdd] flex items-center justify-center flex-shrink-0 disabled:opacity-40 hover:bg-[#c4658f] transition-colors"
                >
                  <Send size={16} className="text-[#1a1a1a]" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
        {tab === 'notes' && (
          <div className="p-4 flex flex-col h-full">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this contact..."
              className="flex-1 bg-white border border-[#ede9e5] rounded-2xl p-4 text-sm text-[#1a1a1a] placeholder:text-[#b0a8a4] focus:outline-none focus:border-[#ffabdd] resize-none"
            />
            <button
              onClick={handleSaveNotes}
              disabled={savingNotes}
              className="mt-3 py-3 rounded-full bg-[#ffabdd] text-[#1a1a1a] font-semibold text-sm disabled:opacity-40 hover:bg-[#c4658f] hover:text-white transition-all"
            >
              {savingNotes ? 'Saving...' : 'Save Notes'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
