import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import AdminNav from './AdminNav'

export const metadata: Metadata = {
  title: 'Admin | Brizee Bri Luxe Hair Studio',
  manifest: '/admin-manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Bri Admin',
  },
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const sb = createSupabaseServerClient()
  const { data: { session } } = await sb.auth.getSession()

  if (!session) {
    redirect('/admin/login')
  }

  return (
    <div className="min-h-screen bg-[#f7f5f3] font-sans">
      <header className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-[#111] border-b border-white/5">
        <div>
          <p className="font-cormorant text-base leading-tight text-white">
            <em className="italic text-[#ffabdd]">Brizee Bri</em> Luxe Hair Studio
          </p>
          <p className="text-[10px] uppercase tracking-widest text-white/30">Admin</p>
        </div>
        <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-white/50 hover:border-[#ffabdd]/40 cursor-pointer">
          <span className="text-sm">🔔</span>
        </div>
      </header>
      <main className="pb-24">{children}</main>
      <AdminNav />
    </div>
  )
}
