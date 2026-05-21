import { createClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'

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
        Insert: {
          id?: string
          name: string
          description?: string | null
          base_price?: number | null
          duration_minutes: number
          requires_consultation: boolean
          hair_included: boolean
          active: boolean
          display_order: number
        }
        Update: Partial<Database['public']['Tables']['services']['Insert']>
        Relationships: []
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
        Insert: {
          id?: string
          storage_path: string
          caption?: string | null
          display_order: number
          active: boolean
        }
        Update: Partial<Database['public']['Tables']['gallery_photos']['Insert']>
        Relationships: []
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
        Insert: {
          id?: string
          day_of_week?: number | null
          specific_date?: string | null
          start_time: string
          end_time: string
          is_available: boolean
          note?: string | null
        }
        Update: Partial<Database['public']['Tables']['availability_blocks']['Insert']>
        Relationships: []
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
        Insert: {
          id?: string
          client_name: string
          client_email: string
          client_phone: string
          service_id: string
          appointment_date: string
          appointment_time: string
          status?: 'pending' | 'confirmed' | 'declined' | 'completed' | 'cancelled'
          payment_method: 'stripe' | 'cashapp' | 'zelle' | 'applepay'
          payment_status?: 'unpaid' | 'deposit_paid' | 'paid'
          deposit_amount: number
          final_price?: number | null
          client_notes?: string | null
          bri_notes?: string | null
          quote_message?: string | null
          google_calendar_event_id?: string | null
          confirmation_sent_at?: string | null
          reminder_sent_at?: string | null
        }
        Update: Partial<Database['public']['Tables']['bookings']['Insert']>
        Relationships: [
          {
            foreignKeyName: "bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          }
        ]
      }
      booking_images: {
        Row: {
          id: string
          booking_id: string
          storage_path: string
          file_name: string
          uploaded_at: string
        }
        Insert: {
          id?: string
          booking_id: string
          storage_path: string
          file_name: string
        }
        Update: Partial<Database['public']['Tables']['booking_images']['Insert']>
        Relationships: [
          {
            foreignKeyName: "booking_images_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          }
        ]
      }
      admin_settings: {
        Row: {
          id: string
          key: string
          value: string
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          value: string
        }
        Update: Partial<Database['public']['Tables']['admin_settings']['Insert']>
        Relationships: []
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
        Insert: {
          id?: string
          icon: string
          title: string
          body: string
          display_order: number
          active: boolean
        }
        Update: Partial<Database['public']['Tables']['policies']['Insert']>
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          id: string
          endpoint: string
          p256dh: string
          auth: string
          created_at: string
        }
        Insert: {
          id?: string
          endpoint: string
          p256dh: string
          auth: string
        }
        Update: Partial<Database['public']['Tables']['push_subscriptions']['Insert']>
        Relationships: []
      }
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}

// Convenience type aliases for query results
export type BookingRow = Database['public']['Tables']['bookings']['Row']
export type ServiceRow = Database['public']['Tables']['services']['Row']
export type BookingImageRow = Database['public']['Tables']['booking_images']['Row']
export type GalleryPhotoRow = Database['public']['Tables']['gallery_photos']['Row']
export type AdminSettingRow = Database['public']['Tables']['admin_settings']['Row']
export type PolicyRow = Database['public']['Tables']['policies']['Row']
export type PushSubscriptionRow = Database['public']['Tables']['push_subscriptions']['Row']
export type AvailabilityBlockRow = Database['public']['Tables']['availability_blocks']['Row']

export type BookingWithRelations = BookingRow & {
  services: Pick<ServiceRow, 'id' | 'name' | 'base_price' | 'duration_minutes'> | null
  booking_images: Pick<BookingImageRow, 'id' | 'storage_path' | 'file_name'>[]
}

export function createBrowserSupabaseClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export function createSupabaseAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}
