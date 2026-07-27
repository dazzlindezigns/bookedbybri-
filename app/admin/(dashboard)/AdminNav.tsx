'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, CalendarDays, MessageSquare, Images, Sparkles } from 'lucide-react'

const PRIMARY = [
  { href: '/admin', label: 'Home', icon: LayoutDashboard },
  { href: '/admin/calendar', label: 'Calendar', icon: CalendarDays },
  { href: '/admin/messages', label: 'Messages', icon: MessageSquare },
  { href: '/admin/gallery', label: 'Gallery', icon: Images },
]

const OVERFLOW = [
  { href: '/admin/services', label: 'Services', icon: Scissors },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

export default function AdminNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const overflowActive = OVERFLOW.some((item) => pathname.startsWith(item.href))

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
      )}

      {/* Overflow panel */}
      {open && (
        <div className="fixed bottom-[58px] right-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl z-30 overflow-hidden shadow-2xl min-w-[160px]">
          {OVERFLOW.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-5 py-3.5 border-b border-[#2a2a2a] last:border-0 transition-colors ${
                  active ? 'text-[#ffabdd]' : 'text-white/70 hover:text-white'
                }`}
              >
                <Icon size={17} />
                <span className="text-sm font-medium">{label}</span>
              </Link>
            )
          })}
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 bg-[#1a1a1a] border-t border-[#2a2a2a] flex safe-pb z-10">
        {PRIMARY.map(({ href, label, icon: Icon }) => {
          const active = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-colors ${
                active ? 'text-[#ffabdd]' : 'text-white/40 hover:text-white/70'
              }`}
            >
              <Icon size={20} />
              <span className="text-[10px]">{label}</span>
            </Link>
          )
        })}

        <button
          onClick={() => setOpen((v) => !v)}
          className={`flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-colors ${
            overflowActive || open ? 'text-[#ffabdd]' : 'text-white/40 hover:text-white/70'
          }`}
        >
          <Sparkles size={20} />
        </button>
      </nav>
    </>
  )
}
