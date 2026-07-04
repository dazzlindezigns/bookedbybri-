'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserSupabaseClient } from '@/lib/supabase'

export default function AdminLoginPage() {
  const router = useRouter()
  const supabase = useMemo(() => createBrowserSupabaseClient(), [])
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError(authError.message)
      setLoading(false)
    } else {
      router.push('/admin')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f5f3] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="font-cormorant italic text-5xl text-[#ffabdd] mb-1">Brizee Bri</p>
          <p className="font-cormorant text-xl text-[#8a7f7a]">Luxe Hair Studio</p>
          <p className="text-[#b0a8a4] text-xs uppercase tracking-widest">Admin</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs text-[#8a7f7a] mb-1.5 uppercase tracking-wider">Email</label>
            <input
              className="input-field"
              type="email"
              placeholder="bri@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs text-[#8a7f7a] mb-1.5 uppercase tracking-wider">Password</label>
            <input
              className="input-field"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-full bg-[#1a1a1a] text-white font-semibold hover:bg-[#ffabdd] hover:text-[#1a1a1a] transition-all duration-200 active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
