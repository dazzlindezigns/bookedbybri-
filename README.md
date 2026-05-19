# BookedByBri — Braids by Brizee Bri

A full-stack Next.js 14 PWA for a hair braiding business in Pflugerville, TX.

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Supabase** (PostgreSQL + Auth + Storage)
- **Tailwind CSS** with custom brand theme
- **next-pwa** for PWA/service worker support
- **Stripe** for card payments / deposits
- **Google Calendar + Gmail APIs** for calendar sync and email
- **Web Push API** for admin push notifications

---

## Setup Guide

### 1. Supabase Project Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the migration:
   ```
   supabase/migrations/001_initial_schema.sql
   ```
3. Then run the seed data:
   ```
   supabase/seed.sql
   ```
4. Create two Storage buckets:
   - `gallery` (public)
   - `booking-images` (private)
5. Copy your **Project URL** and **anon key** from Settings → API

### 2. Google Cloud Console Setup

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project (or use an existing one)
3. Enable these APIs:
   - **Google Calendar API**
   - **Gmail API**
4. Go to **Credentials** → Create **OAuth 2.0 Client ID**
   - Application type: **Web application**
   - Authorized redirect URIs: `https://yourdomain.com/api/auth/google`
5. Copy the **Client ID** and **Client Secret**

### 3. Google Auth Flow

After deploying:

1. Navigate to `/api/auth/google` in your browser (while logged into admin)
2. Authorize the Google account you want to use for Calendar + Gmail
3. You'll be redirected back with a success message
4. The refresh token is stored securely in your Supabase `admin_settings` table

### 4. Stripe Setup

1. Create an account at [stripe.com](https://stripe.com)
2. Get your **Publishable Key** and **Secret Key** from the Dashboard
3. Set up a webhook:
   - Endpoint: `https://yourdomain.com/api/stripe/webhook`
   - Events: `payment_intent.succeeded`
4. Copy the **Webhook Signing Secret**

### 5. VAPID Key Generation (Push Notifications)

Run this in your terminal to generate VAPID keys:

```bash
npx web-push generate-vapid-keys
```

Copy the output to your `.env` file.

### 6. Environment Variables

Copy `.env.example` to `.env.local` and fill in all values:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=https://yourdomain.com/api/auth/google

STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_EMAIL=mailto:bri@yourdomain.com

CRON_SECRET=a_random_secret_string
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

### 7. Vercel Deployment

1. Push this repo to GitHub
2. Import to [vercel.com](https://vercel.com)
3. Add all environment variables in Vercel project settings
4. Deploy!

### 8. Vercel Cron Job Setup

Add this to your `vercel.json` for daily reminder emails:

```json
{
  "crons": [
    {
      "path": "/api/cron/reminders",
      "schedule": "0 10 * * *"
    }
  ]
}
```

This runs at 10 AM UTC daily. The route is protected by the `CRON_SECRET` header that Vercel sends automatically.

### 9. Logo Upload

1. Place your logo file at `public/logo.png`
2. The logo should be square (e.g., 512×512px) for best results
3. It appears in a white circle/pill throughout the app

### 10. First Admin Login

1. Go to your Supabase project → Authentication → Users
2. Click **Add User** → create a user with email + password
3. Navigate to `https://yourdomain.com/admin/login`
4. Sign in with those credentials

---

## Admin Features

- **Dashboard** — Today's appointments, stats, quick actions
- **Bookings** — Full booking list with filter by status
- **Booking Detail** — Review inspo photos, set final price, send quote, decline
- **Services** — Add/edit/delete services, configure deposit
- **Gallery** — Upload/delete photos shown on the public landing page
- **Availability** — Set weekly hours, block specific dates
- **Settings** — Business info, social handles, payment methods, policies, Google + Stripe integration

## Public Features

- Beautiful landing page with hero, bio, gallery, policies accordion
- Multi-step booking flow (service → date/time → info → inspiration → payment)
- Support for Stripe card payments, Cash App, Zelle
- Booking confirmation screen with status tracking page
- PWA — installable on iOS/Android

---

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)
