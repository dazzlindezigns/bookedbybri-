-- ============================================
-- SEED DATA FOR BookedByBri
-- ============================================

SET search_path TO braids;

-- Services
INSERT INTO braids.services (name, description, base_price, duration_minutes, requires_consultation, hair_included, active, display_order) VALUES
  ('Box Braids', 'Classic protective style with individual box-shaped sections. Clean, neat, and long-lasting.', 180.00, 240, false, false, true, 1),
  ('Knotless Box Braids', 'Feed-in method for a more natural look with less tension at the root. Lighter and more flexible.', 220.00, 300, false, false, true, 2),
  ('Boho Knotless Braids', 'Knotless braids with curly or wavy hair added at the ends for a bohemian, carefree vibe.', 260.00, 360, false, false, true, 3),
  ('Cornrows', 'Flat braids worked close to the scalp in straight or curved rows. Classic and versatile.', 80.00, 120, false, false, true, 4),
  ('Tribal Braids', 'Stylized cornrow patterns combined with feed-in extensions for an elevated, intricate look.', 150.00, 180, false, false, true, 5),
  ('Faux Locs', 'Wrapped or crocheted locs for the locs look without the commitment. Full and textured.', 240.00, 360, false, false, true, 6),
  ('Passion Twists', 'Rope-twist style using Freetress Water Wave hair for a gorgeous curly, romantic finish.', 200.00, 300, false, false, true, 7),
  ('Goddess Braids', 'Large, voluminous braids with curly hair peeking through for a regal, goddess-like appearance.', NULL, 300, true, false, true, 8),
  ('Custom / Consult', 'Not sure what you want or need something unique? Let''s chat and create your perfect look together.', NULL, 30, true, false, true, 9);

-- Admin Settings
INSERT INTO braids.admin_settings (key, value) VALUES
  ('business_name', 'Braids by Brizee Bri'),
  ('business_location', 'Pflugerville, TX'),
  ('business_bio', 'Hey! I''m Brizee Bri, a certified hair braider based in Pflugerville, TX. I specialize in protective styles that celebrate your natural beauty. With over 5 years of experience, I bring precision, care, and creativity to every appointment. Your hair is your crown — let me help you wear it proudly. ✨'),
  ('instagram_handle', '@brizeebri'),
  ('facebook_handle', 'BraidsbyBrizeeBri'),
  ('cashapp_handle', '$BrizeeBri'),
  ('zelle_handle', 'bri@brizeebri.com'),
  ('deposit_type', 'flat'),
  ('deposit_amount', '50'),
  ('deposit_note', 'A $50 deposit is required to secure your appointment. The deposit goes toward your total service cost.'),
  ('payment_stripe', 'true'),
  ('payment_cashapp', 'true'),
  ('payment_zelle', 'true'),
  ('payment_applepay', 'false'),
  ('google_refresh_token', ''),
  ('style_tags', 'Box Braids,Knotless,Boho Braids,Faux Locs,Goddess Braids,Cornrows,Passion Twists'),
  ('booking_notice_hours', '24'),
  ('max_daily_bookings', '3'),
  ('site_url', 'https://bookedbybri.com');

-- Policies
INSERT INTO braids.policies (icon, title, body, display_order, active) VALUES
  ('💳', 'Deposit Policy', 'A non-refundable deposit is required to secure your appointment slot. This deposit will be applied toward your total service cost. Your appointment is not confirmed until the deposit is received.', 1, true),
  ('⏰', 'Late Policy', 'Please arrive on time for your appointment. A grace period of 15 minutes is allowed. Arrivals more than 15 minutes late may result in a cancellation and forfeiture of your deposit.', 2, true),
  ('❌', 'Cancellation Policy', 'If you need to cancel or reschedule, please do so at least 48 hours in advance. Cancellations within 48 hours will result in forfeiture of your deposit. No-shows will be charged 50% of the service price.', 3, true),
  ('✨', 'Hair Preparation', 'Please arrive with clean, dry, and completely detangled hair. Hair that is not properly prepped may result in additional charges or refusal of service. If your service requires hair extensions, please confirm whether they are included.', 4, true),
  ('📸', 'Photo & Social Media', 'By booking an appointment, you consent to Bri photographing your finished style for portfolio and social media use. If you prefer not to be photographed, please let us know before your appointment.', 5, true);
