import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from './supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export function createSupabaseServerClient() {
  const cookieStore = cookies()
  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    db: { schema: 'braids' },
    cookies: {
      get(name: string) { return cookieStore.get(name)?.value },
      set(name: string, value: string, options: CookieOptions) {
        try { (cookieStore as unknown as { set: (opts: object) => void }).set({ name, value, ...options }) } catch {}
      },
      remove(name: string, options: CookieOptions) {
        try { (cookieStore as unknown as { set: (opts: object) => void }).set({ name, value: '', ...options }) } catch {}
      },
    },
  })
}
