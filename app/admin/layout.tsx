import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import AdminNav from './AdminNav'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const sb = createSupabaseServerClient()
  const { data: { session } } = await sb.auth.getSession()

  if (!session) {
    redirect('/admin/login')
  }

  return (
    <div className="min-h-screen bg-[#111] text-white font-sans">
      <header className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-[#1a1a1a] border-b border-[#2a2a2a]">
        <div>
          <p className="font-cormorant text-base leading-tight">
            Braids by <em className="italic text-[#ffabdd]">Brizee Bri</em>
          </p>
          <p className="text-[10px] uppercase tracking-widest text-white/30">Admin</p>
        </div>
        <div className="w-8 h-8 rounded-full border border-[#3a3a3a] flex items-center justify-center text-white/50 hover:border-[#ffabdd]/40 cursor-pointer">
          <span className="text-sm">🔔</span>
        </div>
      </header>
      <main className="pb-24">{children}</main>
      <AdminNav />
    </div>
  )
}
