import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import BookingDetailClient from './BookingDetailClient'
import type { BookingWithRelations } from '@/lib/supabase'

export default async function BookingDetailPage({ params }: { params: { id: string } }) {
  const sb = createSupabaseServerClient()
  const { data: rawBooking } = await sb.from('bookings').select('*, services(*), booking_images(*)').eq('id', params.id).single()
  if (!rawBooking) notFound()
  const booking = rawBooking as unknown as BookingWithRelations
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  return (
    <div className="px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/bookings" className="p-2 rounded-full hover:bg-[#ede9e5] transition-colors -ml-2 text-[#1a1a1a]">←</Link>
        <div>
          <p className="font-cormorant text-lg leading-tight text-[#1a1a1a]">Braids by <em className="italic text-[#ffabdd]">Brizee Bri</em></p>
          <p className="text-[#8a7f7a] text-xs">{booking.client_name} · {(booking.services as { name: string } | null)?.name} · {new Date(booking.appointment_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
        </div>
      </div>
      <BookingDetailClient booking={booking} supabaseUrl={supabaseUrl} />
    </div>
  )
}
