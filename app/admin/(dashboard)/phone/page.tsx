'use client'

import { useState, useEffect, useCallback } from 'react'
import { Phone, Delete, Clock, Users, Mic } from 'lucide-react'

type PersonRecord = {
  id: string
  type: 'booking' | 'contact'
  name: string
  phone: string | null
  email: string | null
}

type PhoneTab = 'keypad' | 'recents' | 'contacts'

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
  const [tab, setTab] = useState<PhoneTab>('keypad')
  const [number, setNumber] = useState('')
  const [contacts, setContacts] = useState<PersonRecord[]>([])

  useEffect(() => {
    fetch('/api/people').then((r) => r.json()).then((d) => setContacts(Array.isArray(d) ? d : []))
  }, [])

  const pressKey = useCallback((digit: string) => {
    if (!digit) return
    setNumber((n) => n + digit)
  }, [])

  const handleCall = () => {
    if (!number) return
    window.alert('Calling will be available once your Telnyx number is fully connected.')
  }

  const callContact = (phone: string) => {
    setNumber(phone)
    setTab('keypad')
  }

  return (
    <div className="px-4 py-6 max-w-5xl mx-auto">
      <h1 className="font-cormorant text-3xl font-semibold text-[#1a1a1a] mb-6">Phone</h1>

      {/* Telnyx notice */}
      <div className="bg-[#fff8e1] border border-[#ffe082] rounded-2xl px-4 py-3 mb-6 flex items-start gap-2">
        <Mic size={14} className="text-[#f59e0b] mt-0.5 flex-shrink-0" />
        <div className="text-xs text-[#92400e]">
          <strong>Calling is coming soon.</strong> Once your Telnyx number is active and connected, you'll be able to call clients directly from here. Texting works now.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Keypad panel */}
        <div className="bg-white border border-[#ede9e5] rounded-2xl p-6">
          <div className="flex gap-1 mb-6 bg-[#f7f5f3] rounded-xl p-1">
            {([['keypad', 'Keypad'], ['recents', 'Recents'], ['contacts', 'Contacts']] as [PhoneTab, string][]).map(([t, label]) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${
                  tab === t ? 'bg-white text-[#1a1a1a] shadow-sm' : 'text-[#8a7f7a]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {tab === 'keypad' && (
            <div className="flex flex-col items-center gap-4">
              {/* Number display */}
              <div className="flex items-center gap-2 min-h-[56px] w-full justify-center">
                <span className="text-4xl font-light text-[#1a1a1a] tracking-widest flex-1 text-center">
                  {number || <span className="text-[#d4cdc9]">Enter number</span>}
                </span>
                {number && (
                  <button
                    onClick={() => setNumber((n) => n.slice(0, -1))}
                    onDoubleClick={() => setNumber('')}
                    className="p-2 rounded-full hover:bg-[#f7f5f3] text-[#8a7f7a] transition-colors"
                    title="Backspace (double-click to clear)"
                  >
                    <Delete size={20} />
                  </button>
                )}
              </div>

              {/* Grid */}
              <div className="grid grid-cols-3 gap-3 w-full">
                {KEYS.map(([digit, letters]) => (
                  <button
                    key={digit}
                    onClick={() => pressKey(digit)}
                    className="flex flex-col items-center justify-center py-3.5 rounded-2xl border border-[#ede9e5] bg-[#f7f5f3] hover:bg-[#fff0f8] hover:border-[#ffabdd]/40 transition-all active:scale-95"
                  >
                    <span className="text-2xl font-light text-[#1a1a1a] leading-tight">{digit}</span>
                    {letters && <span className="text-[9px] text-[#b0a8a4] tracking-[0.15em] mt-0.5">{letters}</span>}
                  </button>
                ))}
              </div>

              {/* Call button */}
              <button
                onClick={handleCall}
                disabled={!number}
                className="w-16 h-16 rounded-full bg-[#ffabdd] flex items-center justify-center disabled:opacity-40 hover:bg-[#c4658f] transition-all active:scale-95 shadow-lg shadow-[#ffabdd]/30 mt-2"
              >
                <Phone size={26} className="text-[#1a1a1a]" />
              </button>
            </div>
          )}

          {tab === 'recents' && (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <Clock size={36} className="text-[#ede9e5]" />
              <p className="font-medium text-sm text-[#8a7f7a]">No recent calls</p>
              <p className="text-xs text-[#b0a8a4]">Call history will appear once Telnyx is connected</p>
            </div>
          )}

          {tab === 'contacts' && (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <Users size={36} className="text-[#ede9e5]" />
              <p className="font-medium text-sm text-[#8a7f7a]">Find contacts on the right →</p>
            </div>
          )}
        </div>

        {/* Contacts panel */}
        <div className="bg-white border border-[#ede9e5] rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#ede9e5]">
            <p className="font-semibold text-sm text-[#1a1a1a]">Contacts</p>
            <p className="text-xs text-[#8a7f7a] mt-0.5">{contacts.length} people · tap to dial</p>
          </div>
          <div className="overflow-y-auto max-h-[480px] divide-y divide-[#f7f5f3]">
            {contacts.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-sm text-[#b0a8a4]">No contacts yet</p>
              </div>
            )}
            {contacts.filter((c) => c.phone).map((c) => (
              <div key={`${c.type}-${c.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-[#f7f5f3] transition-colors">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                  c.type === 'booking' ? 'bg-[#fff0f8]' : 'bg-[#f7f5f3]'
                }`}>
                  <span className={`text-xs font-bold ${c.type === 'booking' ? 'text-[#c4658f]' : 'text-[#8a7f7a]'}`}>
                    {initials(c.name)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1a1a1a] truncate">{c.name}</p>
                  <p className="text-xs text-[#8a7f7a]">{c.phone}</p>
                </div>
                <button
                  onClick={() => callContact(c.phone!)}
                  className="w-8 h-8 rounded-full bg-[#f7f5f3] hover:bg-[#fff0f8] flex items-center justify-center transition-colors"
                  title={`Dial ${c.phone}`}
                >
                  <Phone size={14} className="text-[#c4658f]" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
