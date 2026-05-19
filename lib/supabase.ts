import { createClient } from '@supabase/supabase-js'

export type Database = {
  public: {
    Tables: {
      services: {
        Row: {
          id: string
          name: string
          description: string | null
          base_price: number | null
          duration_minutes: number
          requires_consultation: boolean
          hair_included: boolean
          active: boolean
          display_order: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['services']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['services']['Insert']>
      }
      gallery_photos: {
        Row: {
          id: string
          storage_path: string
          caption: string | null
          display_order: number
          active: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['gallery_photos']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['gallery_photos']['Insert']>
      }
      availability_blocks: {
        Row: {
          id: string
          day_of_week: number | null
          specific_date: string | null
          start_time: string
          end_time: string
          is_available: boolean
          note: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['availability_blocks']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['availability_blocks']['Insert']>
      }
      bookings: {
        Row: {
          id: string
          client_name: string
          client_email: string
          client_phone: string
          service_id: string
          appointment_date: string
          appointment_time: string
          status: 'pending' | 'confirmed' | 'declined' | 'completed' | 'cancelled'
          payment_method: 'stripe' | 'cashapp' | 'zelle' | 'applepay'
          payment_status: 'unpaid' | 'deposit_paid' | 'paid'
          deposit_amount: number
          final_price: number | null
          client_notes: string | null
          bri_notes: string | null
          quote_message: string | null
          google_calendar_event_id: string | null
          confirmation_sent_at: string | null
          reminder_sent_at: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['bookings']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['bookings']['Insert']>
      }
      booking_images: {
        Row: {
          id: string
          booking_id: string
          storage_path: string
          file_name: string
          uploaded_at: string
        }
        Insert: Omit<Database['public']['Tables']['booking_images']['Row'], 'id' | 'uploaded_at'>
        Update: Partial<Database['public']['Tables']['booking_images']['Insert']>
      }
      admin_settings: {
        Row: {
          id: string
          key: string
          value: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['admin_settings']['Row'], 'id' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['admin_settings']['Insert']>
      }
      policies: {
        Row: {
          id: string
          icon: string
          title: string
          body: string
          display_order: number
          active: boolean
        }
        Insert: Omit<Database['public']['Tables']['policies']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['policies']['Insert']>
      }
      push_subscriptions: {
        Row: {
          id: string
          endpoint: string
          p256dh: string
          auth: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['push_subscriptions']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['push_subscriptions']['Insert']>
      }
    }
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

export function createSupabaseAdminClient() {
  return createClient<Database>(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}
