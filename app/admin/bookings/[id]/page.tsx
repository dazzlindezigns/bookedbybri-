import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import BookingDetailClient from './BookingDetailClient'

export default async function BookingDetailPage({ params }: { params: { id: string } }) {
  const sb = createSupabaseServerClient()
  const { data: booking } = await sb.from('bookings').select('*, services(*), booking_images(*)').eq('id', params.id).single()
  if (!booking) notFound()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  return (
    <div className="px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/bookings" className="p-2 rounded-full hover:bg-white/10 transition-colors -ml-2">←</Link>
        <div>
          <p className="font-cormorant text-lg leading-tight">Braids by <em className="italic text-[#ffabdd]">Brizee Bri</em></p>
          <p className="text-white/40 text-xs">{booking.client_name} · {(booking.services as { name: string } | null)?.name} · {new Date(booking.appointment_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
        </div>
      </div>
      <BookingDetailClient booking={booking} supabaseUrl={supabaseUrl} />
    </div>
  )
}
