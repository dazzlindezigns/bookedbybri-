-- Seed data for BookedByBri

INSERT INTO services (name, description, base_price, duration_minutes, requires_consultation, hair_included, active, display_order) VALUES
  ('Box Braids', 'Classic protective style with individual box-shaped sections. Clean, neat, and long-lasting.', 180.00, 240, false, false, true, 1),
  ('Knotless Box Braids', 'Feed-in method for a more natural look with less tension at the root. Lighter and more flexible.', 220.00, 300, false, false, true, 2),
  ('Boho Knotless Braids', 'Knotless braids with curly or wavy hair added at the ends for a bohemian, carefree vibe.', 260.00, 360, false, false, true, 3),
  ('Cornrows', 'Flat braids worked close to the scalp in straight or curved rows. Classic and versatile.', 80.00, 120, false, false, true, 4),
  ('Tribal Braids', 'Stylized cornrow patterns combined with feed-in extensions for an elevated, intricate look.', 150.00, 180, false, false, true, 5),
  ('Faux Locs', 'Wrapped or crocheted locs for the locs look without the commitment. Full and textured.', 240.00, 360, false, false, true, 6),
  ('Passion Twists', 'Rope-twist style using Freetress Water Wave hair for a gorgeous curly, romantic finish.', 200.00, 300, false, false, true, 7),
  ('Goddess Braids', 'Large, voluminous braids with curly hair peeking through for a regal, goddess-like appearance.', NULL, 300, true, false, true, 8),
  ('Custom / Consult', 'Not sure what you want? Let''s chat and create your perfect look together.', NULL, 30, true, false, true, 9);

INSERT INTO admin_settings (key, value) VALUES
  ('business_name', 'Braids by Brizee Bri'),
  ('location', 'Pflugerville, TX'),
  ('bio', 'Hey! I''m Brizee Bri, a certified hair braider based in Pflugerville, TX. I specialize in protective styles that celebrate your natural beauty. With over 5 years of experience, I bring precision, care, and creativity to every appointment. Your hair is your crown — let me help you wear it proudly. ✨'),
  ('instagram', '@brizeebri'),
  ('facebook', '@BraidsbyBrizeeBri'),
  ('cashapp_handle', '$BrizeeBri'),
  ('zelle_contact', 'bri@brizeebri.com'),
  ('deposit_type', 'flat'),
  ('deposit_value', '50'),
  ('stripe_enabled', 'true'),
  ('cashapp_enabled', 'true'),
  ('zelle_enabled', 'true'),
  ('applepay_enabled', 'false'),
  ('google_refresh_token', '');

INSERT INTO policies (icon, title, body, display_order, active) VALUES
  ('💳', 'Deposit Policy', 'A non-refundable deposit is required to secure your appointment slot. This deposit will be applied toward your total service cost. Your appointment is not confirmed until the deposit is received.', 1, true),
  ('⏰', 'Late Policy', 'Please arrive on time. A grace period of 15 minutes is allowed. Arrivals more than 15 minutes late may result in cancellation and forfeiture of your deposit.', 2, true),
  ('❌', 'Cancellation Policy', 'If you need to cancel or reschedule, please do so at least 48 hours in advance. Cancellations within 48 hours forfeit the deposit. No-shows will be charged 50% of the service price.', 3, true),
  ('✨', 'Hair Preparation', 'Please arrive with clean, dry, and completely detangled hair. Improper hair prep may result in additional charges. Confirm whether hair extensions are included in your service.', 4, true),
  ('📸', 'Photo & Social Media', 'By booking, you consent to Bri photographing your finished style for portfolio and social media use. Let us know before your appointment if you prefer not to be photographed.', 5, true);
