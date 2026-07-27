'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { ChevronLeft, Send, Pencil, Check, X } from 'lucide-react'

type Message = { id: string; direction: 'inbound' | 'outbound'; body: string; created_at: string }
type Contact = { id: string; name: string | null; phone: string | null; email: string | null; notes: string | null }

function timeLabel(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
}

export default function ContactConversationPage({ params }: { params: { id: string } }) {
  const [contact, setContact] = useState<Contact | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [editEmail, setEditEmail] = useState('')
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
  }

  useEffect(() => { load() }, [])
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

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

  if (!contact) {
    return <div className="flex items-center justify-center h-screen text-[#b0a8a4] text-sm">Loading...</div>
  }

  const displayName = contact.name || contact.phone || 'Unknown'

  return (
    <div className="flex flex-col h-[100dvh] bg-[#f7f5f3]">
      {/* Header */}
      <div className="bg-white border-b border-[#ede9e5] px-4 py-3 flex items-start gap-3 flex-shrink-0">
        <Link href="/admin/messages" className="p-1.5 rounded-full hover:bg-[#f7f5f3] mt-0.5">
          <ChevronLeft size={20} className="text-[#1a1a1a]" />
        </Link>

        {editing ? (
          <div className="flex-1 space-y-1.5">
            <input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Full name"
              className="w-full text-sm border border-[#ede9e5] rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#ffabdd]"
            />
            <div className="flex gap-1.5">
              <input
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                placeholder="Phone"
                className="flex-1 text-xs border border-[#ede9e5] rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#ffabdd]"
              />
              <input
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                placeholder="Email"
                className="flex-1 text-xs border border-[#ede9e5] rounded-lg px-2 py-1.5 focus:outline-none focus:border-[#ffabdd]"
              />
            </div>
          </div>
        ) : (
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-[#1a1a1a] truncate">{displayName}</p>
            {contact.phone && <p className="text-xs text-[#8a7f7a]">{contact.phone}</p>}
            {!contact.name && (
              <p className="text-[10px] text-[#ffabdd] font-medium mt-0.5">Tap ✏️ to add name</p>
            )}
          </div>
        )}

        {editing ? (
          <div className="flex gap-1 mt-0.5">
            <button onClick={handleSave} className="p-1.5 rounded-full bg-[#ffabdd] hover:bg-[#c4658f]">
              <Check size={15} className="text-[#1a1a1a]" />
            </button>
            <button onClick={() => setEditing(false)} className="p-1.5 rounded-full hover:bg-[#f7f5f3]">
              <X size={15} className="text-[#8a7f7a]" />
            </button>
          </div>
        ) : (
          <button onClick={() => setEditing(true)} className="p-1.5 rounded-full hover:bg-[#f7f5f3] mt-0.5">
            <Pencil size={15} className="text-[#8a7f7a]" />
          </button>
        )}
      </div>

      {/* Messages thread */}
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

      {/* Input bar */}
      <div className="bg-white border-t border-[#ede9e5] px-4 py-3 safe-pb flex-shrink-0">
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
  )
}
