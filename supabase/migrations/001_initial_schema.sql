-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- SCHEMA
-- ============================================
CREATE SCHEMA IF NOT EXISTS braids;
SET search_path TO braids;

-- ============================================
-- TABLES
-- ============================================

-- Services table
CREATE TABLE braids.services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  base_price NUMERIC(10,2),
  duration_minutes INTEGER NOT NULL DEFAULT 120,
  requires_consultation BOOLEAN NOT NULL DEFAULT false,
  hair_included BOOLEAN NOT NULL DEFAULT false,
  active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Gallery photos table
CREATE TABLE braids.gallery_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  storage_path TEXT NOT NULL,
  caption TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Availability blocks table
CREATE TABLE braids.availability_blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6),
  specific_date DATE,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT day_or_date CHECK (
    (day_of_week IS NOT NULL AND specific_date IS NULL) OR
    (day_of_week IS NULL AND specific_date IS NOT NULL)
  )
);

-- Bookings table
CREATE TABLE braids.bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  service_id UUID NOT NULL REFERENCES braids.services(id),
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'declined', 'completed', 'cancelled')),
  payment_method TEXT NOT NULL DEFAULT 'stripe'
    CHECK (payment_method IN ('stripe', 'cashapp', 'zelle', 'applepay')),
  payment_status TEXT NOT NULL DEFAULT 'unpaid'
    CHECK (payment_status IN ('unpaid', 'deposit_paid', 'paid')),
  deposit_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  final_price NUMERIC(10,2),
  client_notes TEXT,
  bri_notes TEXT,
  quote_message TEXT,
  google_calendar_event_id TEXT,
  confirmation_sent_at TIMESTAMPTZ,
  reminder_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Booking images table
CREATE TABLE braids.booking_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES braids.bookings(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Admin settings table
CREATE TABLE braids.admin_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Policies table
CREATE TABLE braids.policies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  icon TEXT NOT NULL DEFAULT '📋',
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true
);

-- Push subscriptions table
CREATE TABLE braids.push_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_bookings_status ON braids.bookings(status);
CREATE INDEX idx_bookings_appointment_date ON braids.bookings(appointment_date);
CREATE INDEX idx_bookings_client_email ON braids.bookings(client_email);
CREATE INDEX idx_availability_day_of_week ON braids.availability_blocks(day_of_week);
CREATE INDEX idx_availability_specific_date ON braids.availability_blocks(specific_date);
CREATE INDEX idx_gallery_active ON braids.gallery_photos(active, display_order);
CREATE INDEX idx_services_active ON braids.services(active, display_order);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE braids.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE braids.gallery_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE braids.availability_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE braids.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE braids.booking_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE braids.admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE braids.policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE braids.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Services: public can read active services, admin can do everything
CREATE POLICY "Public read active services" ON braids.services
  FOR SELECT USING (active = true);

CREATE POLICY "Admin full access services" ON braids.services
  FOR ALL USING (auth.role() = 'authenticated');

-- Gallery photos: public can read active photos
CREATE POLICY "Public read active gallery" ON braids.gallery_photos
  FOR SELECT USING (active = true);

CREATE POLICY "Admin full access gallery" ON braids.gallery_photos
  FOR ALL USING (auth.role() = 'authenticated');

-- Availability blocks: public can read, admin can manage
CREATE POLICY "Public read availability" ON braids.availability_blocks
  FOR SELECT USING (true);

CREATE POLICY "Admin full access availability" ON braids.availability_blocks
  FOR ALL USING (auth.role() = 'authenticated');

-- Bookings: public can insert, authenticated can read/update all
CREATE POLICY "Public can create bookings" ON braids.bookings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can read own booking" ON braids.bookings
  FOR SELECT USING (true);

CREATE POLICY "Admin full access bookings" ON braids.bookings
  FOR ALL USING (auth.role() = 'authenticated');

-- Booking images: public can insert, authenticated can manage
CREATE POLICY "Public can upload booking images" ON braids.booking_images
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can read booking images" ON braids.booking_images
  FOR SELECT USING (true);

CREATE POLICY "Admin full access booking_images" ON braids.booking_images
  FOR ALL USING (auth.role() = 'authenticated');

-- Admin settings: public can read, authenticated can manage
CREATE POLICY "Public read settings" ON braids.admin_settings
  FOR SELECT USING (true);

CREATE POLICY "Admin full access settings" ON braids.admin_settings
  FOR ALL USING (auth.role() = 'authenticated');

-- Policies: public can read active, admin can manage
CREATE POLICY "Public read active policies" ON braids.policies
  FOR SELECT USING (active = true);

CREATE POLICY "Admin full access policies" ON braids.policies
  FOR ALL USING (auth.role() = 'authenticated');

-- Push subscriptions: public can insert, authenticated can manage
CREATE POLICY "Public can subscribe" ON braids.push_subscriptions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin full access push_subscriptions" ON braids.push_subscriptions
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================
-- STORAGE BUCKETS (run via Supabase dashboard or CLI)
-- ============================================
-- INSERT INTO storage.buckets (id, name, public) VALUES ('gallery', 'gallery', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('booking-images', 'booking-images', false);
