'use client'

import { useState, useEffect, useCallback } from 'react'
import { Phone, Delete } from 'lucide-react'

type PersonRecord = {
  id: string
  type: 'booking' | 'contact'
  name: string
  phone: string | null
  email: string | null
}

const KEYS: [string, string][] = [
  ['1', ''], ['2', 'ABC'], ['3', 'DEF'],
  ['4', 'GHI'], ['5', 'JKL'], ['6', 'MNO'],
  ['7', 'PQRS'], ['8', 'TUV'], ['9', 'WXYZ'],
  ['*', ''], ['0', '+'], ['#', ''],
]

function initials(name: string) {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
}

export default function PhonePage() {
  const [number, setNumber] = useState('')
  const [contacts, setContacts] = useState<PersonRecord[]>([])

  useEffect(() => {
    fetch('/api/people').then((r) => r.json()).then((d) => setContacts(Array.isArray(d) ? d : []))
  }, [])

  const pressKey = useCallback((digit: string) => {
    if (!digit) return
    setNumber((n) => n + digit)
  }, [])

  return (
    <div className="px-4 py-6 max-w-5xl mx-auto">
      <h1 className="font-cormorant text-3xl font-semibold text-[#1a1a1a] mb-6">Phone</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

        {/* Dark keypad */}
        <div className="bg-[#1a1a1a] rounded-3xl p-6 flex flex-col gap-5">
          {/* My Number */}
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-[0.18em] text-white/25 mb-1">My Number</p>
            <p className="text-sm font-medium text-white/40">Telnyx number not connected yet</p>
          </div>

          {/* Number display */}
          <div className="bg-[#2a2a2a] rounded-2xl px-5 py-4 flex items-center justify-between min-h-[62px]">
            <span className="text-[30px] font-light text-white tracking-widest flex-1 leading-none">
              {number || <span className="text-white/15 text-xl font-light">Enter number</span>}
            </span>
            {number && (
              <button
                onClick={() => setNumber((n) => n.slice(0, -1))}
                onDoubleClick={() => setNumber('')}
                className="ml-3 p-1.5 rounded-full text-white/30 hover:text-white/70 hover:bg-white/10 transition-all"
                title="Double-click to clear"
              >
                <Delete size={17} />
              </button>
            )}
          </div>

          {/* Key grid */}
          <div className="grid grid-cols-3 gap-3">
            {KEYS.map(([digit, letters]) => (
              <button
                key={digit}
                onClick={() => pressKey(digit)}
                className="flex flex-col items-center justify-center py-4 rounded-2xl bg-[#2a2a2a] hover:bg-[#333333] active:bg-[#404040] transition-all active:scale-[0.97]"
              >
                <span className="text-[22px] font-light text-white leading-tight">{digit}</span>
                {letters && <span className="text-[9px] text-white/25 tracking-[0.15em] mt-0.5">{letters}</span>}
              </button>
            ))}
          </div>

          {/* Bottom row: Contacts | Call | Delete */}
          <div className="flex items-center justify-between px-2 pt-1">
            {/* Contacts icon */}
            <div className="flex flex-col items-center gap-1.5 text-white/30 w-16">
              <div className="w-11 h-11 rounded-full bg-[#2a2a2a] flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
              </div>
              <span className="text-[10px]">Contacts</span>
            </div>

            {/* Call button */}
            <button
              onClick={() => window.alert('Calling will be available once your Telnyx number is connected. Texting works now!')}
              disabled={!number}
              className="w-16 h-16 rounded-full bg-[#ffabdd] flex items-center justify-center disabled:opacity-35 hover:bg-[#c4658f] transition-all active:scale-95 shadow-xl shadow-[#ffabdd]/25"
            >
              <Phone size={26} className="text-[#1a1a1a]" />
            </button>

            {/* Delete */}
            <button
              onClick={() => setNumber((n) => n.slice(0, -1))}
              disabled={!number}
              className="flex flex-col items-center gap-1.5 text-white/30 hover:text-white/60 disabled:opacity-0 transition-all w-16"
            >
              <div className="w-11 h-11 rounded-full bg-[#2a2a2a] flex items-center justify-center">
                <Delete size={18} />
              </div>
              <span className="text-[10px]">Delete</span>
            </button>
          </div>

          <p className="text-center text-[10px] text-white/15">Texting works now · Calling coming once Telnyx is live</p>
        </div>

        {/* Contacts list */}
        <div className="bg-white border border-[#ede9e5] rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#ede9e5]">
            <p className="font-semibold text-sm text-[#1a1a1a]">Contacts</p>
            <p className="text-xs text-[#8a7f7a] mt-0.5">{contacts.length} people · tap phone to dial</p>
          </div>
          <div className="overflow-y-auto max-h-[520px] divide-y divide-[#f7f5f3]">
            {contacts.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-sm text-[#b0a8a4]">No contacts yet</p>
              </div>
            )}
            {contacts.filter((c) => c.phone).map((c) => (
              <div key={`${c.type}-${c.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-[#f7f5f3] transition-colors">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  c.type === 'booking' ? 'bg-[#fff0f8]' : 'bg-[#f7f5f3]'
                }`}>
                  <span className={`text-xs font-bold ${c.type === 'booking' ? 'text-[#c4658f]' : 'text-[#8a7f7a]'}`}>
                    {initials(c.name)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#1a1a1a] truncate">{c.name}</p>
                  <p className="text-xs text-[#8a7f7a]">{c.phone}</p>
                </div>
                <button
                  onClick={() => setNumber(c.phone!)}
                  className="w-9 h-9 rounded-full bg-[#f7f5f3] hover:bg-[#fff0f8] flex items-center justify-center transition-colors flex-shrink-0"
                  title={`Load ${c.phone} into dialer`}
                >
                  <Phone size={15} className="text-[#c4658f]" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
