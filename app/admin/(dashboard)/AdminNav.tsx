'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, CalendarDays, MessageSquare, Scissors, Settings } from 'lucide-react'

const NAV = [
  { href: '/admin', label: 'Home', icon: LayoutDashboard },
  { href: '/admin/calendar', label: 'Calendar', icon: CalendarDays },
  { href: '/admin/messages', label: 'Messages', icon: MessageSquare },
  { href: '/admin/services', label: 'Services', icon: Scissors },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

export default function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#1a1a1a] border-t border-[#2a2a2a] flex safe-pb z-10">
      {NAV.map(({ href, label, icon: Icon }) => {
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
    </nav>
  )
}
