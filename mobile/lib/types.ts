export type BookingStatus = 'pending' | 'confirmed' | 'declined' | 'completed' | 'cancelled' | 'no_show'

export type Booking = {
  id: string
  client_name: string
  client_email: string
  client_phone: string
  service_id: string
  appointment_date: string
  appointment_time: string
  status: BookingStatus
  payment_method: string | null
  payment_status: string
  deposit_amount: number | null
  final_price: number | null
  client_notes: string | null
  bri_notes: string | null
  created_at: string
  services?: { name: string; duration_minutes?: number }
  booking_images?: { id: string; storage_path: string; file_name: string }[]
}

export type Message = {
  id: string
  booking_id: string
  direction: 'inbound' | 'outbound'
  body: string
  created_at: string
}

export type Service = {
  id: string
  name: string
  description: string | null
  base_price: number | null
  duration_minutes: number
  requires_consultation: boolean
  hair_included: boolean
  active: boolean
  display_order: number
}
