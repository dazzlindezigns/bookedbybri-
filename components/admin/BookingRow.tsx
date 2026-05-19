import Link from 'next/link'
import Badge from '@/components/ui/Badge'

interface Booking {
  id: string; client_name: string; client_email: string; service_id: string
  appointment_date: string; appointment_time: string; status: string; payment_status: string
  services?: { name: string }
}

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
}

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' })
}

export default function BookingRow({ booking }: { booking: Booking }) {
  return (
    <Link href={`/admin/bookings/${booking.id}`} className="flex items-center gap-3 px-4 py-3.5 hover:bg-white/5 transition-colors border-b border-[#2a2a2a] last:border-b-0">
      <div className="w-10 h-10 rounded-full bg-[#ffabdd]/15 border border-[#ffabdd]/30 flex items-center justify-center flex-shrink-0">
        <span className="text-[#ffabdd] text-sm font-semibold">{getInitials(booking.client_name)}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium truncate">{booking.client_name}</p>
        <p className="text-white/40 text-xs truncate">{booking.services?.name || 'Service'} · {formatDate(booking.appointment_date)}</p>
      </div>
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <Badge status={booking.status} />
      </div>
    </Link>
  )
}
