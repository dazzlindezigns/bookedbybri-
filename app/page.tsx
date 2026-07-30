import Image from 'next/image'
import Link from 'next/link'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { MapPin, Instagram, Facebook, Clipboard, Sparkles, Clock, Heart } from 'lucide-react'

async function getSettings() {
  try {
    const sb = createSupabaseAdminClient()
    const { data } = await sb.from('admin_settings').select('key, value')
    const map: Record<string, string> = {}
    data?.forEach((r) => { map[r.key] = r.value })
    return map
  } catch {
    return {}
  }
}

async function getGallery() {
  try {
    const sb = createSupabaseAdminClient()
    const { data } = await sb
      .from('gallery_photos')
      .select('*')
      .eq('active', true)
      .order('display_order')
      .limit(9)
    return data || []
  } catch {
    return []
  }
}

async function getPolicies() {
  try {
    const sb = createSupabaseAdminClient()
    const { data } = await sb
      .from('policies')
      .select('*')
      .eq('active', true)
      .order('display_order')
    return data || []
  } catch {
    return []
  }
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''

function photoUrl(path: string) {
  return `${SUPABASE_URL}/storage/v1/object/public/gallery/${path}`
}

const STYLE_TAGS = [
  'Braids',
  'Wigs',
  'Quick Weaves',
  'Knotless',
  'Goddess Locs',
  'Boho Braids',
  '+ more',
]

export default async function HomePage() {
  const [settings, gallery, policies] = await Promise.all([
    getSettings(),
    getGallery(),
    getPolicies(),
  ])

  const bio =
    settings.bio ||
    "Bri is a self-taught braider from Texas with a passion for creativity and a dedication to making every client feel confident and regal. Specializing in knotless braids, goddess locs, boho styles, and more — every braid is personal."
  const instagram = settings.instagram || '@braidsbybrizeebri'
  const facebook = settings.facebook || '@braidsbybrizeebri'
  const location = settings.location || 'Pflugerville, TX'

  const visiblePhotos = gallery.slice(0, 6)
  const extraCount = gallery.length > 6 ? gallery.length - 6 : 0

  return (
    <div className="min-h-screen font-sans">
      {/* Sticky top nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-[#1a1a1a]/80 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded-full overflow-hidden flex items-center justify-center">
            <span className="font-cormorant italic text-[#ffabdd] font-bold text-base leading-none">B</span>
          </div>
          <span className="text-white text-xs font-semibold leading-tight hidden sm:block">
            Brizee Bri Luxe Hair Studio
          </span>
        </div>
        <Link
          href="/book"
          className="bg-[#ffabdd] text-[#1a1a1a] font-semibold text-sm px-5 py-2.5 rounded-full hover:bg-[#c4658f] hover:text-white transition-all duration-200 active:scale-95"
        >
          Request an Appointment
        </Link>
      </nav>

      {/* Hero — dark atmospheric */}
      <section className="relative min-h-screen bg-[#1a1a1a] flex flex-col items-center justify-center px-4 pt-20 pb-16">
        <div className="flex flex-col items-center gap-6 text-center">
          <div
            style={{
              width: 170,
              height: 170,
              borderRadius: '50%',
              background: '#1a1a1a',
              boxShadow: '0 0 0 4px #ffabdd, 0 0 32px 8px rgba(255,171,221,0.35)',
              overflow: 'hidden',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Image
              src="/logo.png"
              alt="Brizee Bri Luxe Hair Studio"
              width={154}
              height={154}
              className="object-contain"
              priority
            />
          </div>

          <div>
            <h1 className="font-cormorant italic text-6xl sm:text-7xl font-semibold text-[#ffabdd] leading-none">
              Brizee Bri
            </h1>
            <p className="font-cormorant text-2xl font-light tracking-widest text-white/80 uppercase mt-1">
              Luxe Hair Studio
            </p>
            <p className="text-[#ffabdd]/60 text-sm tracking-widest uppercase mt-2">
              Luxury Hair. Flawless Finish.
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-white/60 text-sm">
            <MapPin size={14} className="text-[#ffabdd]" />
            <span>{location}</span>
          </div>

          <Link
            href="/book"
            className="mt-2 bg-[#ffabdd] text-[#1a1a1a] font-semibold px-8 py-3.5 rounded-full hover:bg-[#c4658f] hover:text-white transition-all duration-200 active:scale-95 shadow-lg shadow-[#ffabdd]/20"
          >
            Request an Appointment
          </Link>
        </div>
      </section>

      {/* Bio — dark */}
      <section className="bg-[#141414] px-6 py-16 max-w-2xl mx-auto">
        <h2 className="font-cormorant text-4xl font-semibold text-white mb-6 text-center">
          Your Hair, Your Crown
        </h2>
        <p className="text-white/60 leading-relaxed text-center mb-8">{bio}</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {STYLE_TAGS.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1.5 rounded-full text-sm border border-[#ffabdd]/30 text-[#ffabdd] bg-[#ffabdd]/10"
            >
              {tag}
            </span>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-[#1a1a1a] px-6 py-16 max-w-2xl mx-auto">
        <h2 className="font-cormorant text-4xl font-semibold text-white mb-2 text-center">How It Works</h2>
        <p className="text-white/40 text-sm text-center mb-10">Getting booked with Bri is simple</p>
        <div className="space-y-6">
          {[
            {
              step: '01',
              title: 'Request Your Style',
              body: 'Choose your service, pick a preferred date, and submit your request — takes less than 5 minutes.',
            },
            {
              step: '02',
              title: 'Bri Reviews & Confirms',
              body: 'Bri personally reviews every request and reaches out within 24 hours to confirm your appointment and collect your deposit.',
            },
            {
              step: '03',
              title: 'Get Gorgeous',
              body: "Show up, relax, and leave with flawless braids. It's that simple.",
            },
          ].map(({ step, title, body }) => (
            <div key={step} className="flex gap-5 items-start">
              <div className="flex-shrink-0 w-12 h-12 rounded-full border border-[#ffabdd]/30 flex items-center justify-center">
                <span className="text-[#ffabdd] font-cormorant font-semibold text-lg">{step}</span>
              </div>
              <div>
                <p className="text-white font-semibold text-base mb-1">{title}</p>
                <p className="text-white/50 text-sm leading-relaxed">{body}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link
            href="/book"
            className="inline-block bg-[#ffabdd] text-[#1a1a1a] font-semibold px-8 py-3.5 rounded-full hover:bg-[#c4658f] hover:text-white transition-all duration-200 active:scale-95"
          >
            Request an Appointment →
          </Link>
        </div>
      </section>

      {/* Why Brizee Bri */}
      <section className="bg-[#141414] px-6 py-16 max-w-2xl mx-auto">
        <h2 className="font-cormorant text-4xl font-semibold text-white mb-10 text-center">Why Brizee Bri?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              icon: <Sparkles size={20} className="text-[#ffabdd]" />,
              title: 'Custom Creations',
              body: 'Every style is tailored to your vision. No cookie-cutter looks — Bri makes it personal.',
            },
            {
              icon: <Clock size={20} className="text-[#ffabdd]" />,
              title: 'Your Time Respected',
              body: 'Appointment-only means no waiting. Your time is as valuable as your style.',
            },
            {
              icon: <Heart size={20} className="text-[#ffabdd]" />,
              title: 'Hair Health First',
              body: 'Protective styles that protect. Bri prioritizes the health of your hair, not just the look.',
            },
          ].map(({ icon, title, body }) => (
            <div key={title} className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-5 flex flex-col gap-3 hover:border-[#ffabdd]/30 transition-colors">
              <div className="w-10 h-10 rounded-full bg-[#ffabdd]/10 flex items-center justify-center">
                {icon}
              </div>
              <p className="text-white font-semibold text-sm">{title}</p>
              <p className="text-white/50 text-xs leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Gallery — dark */}
      <section className="bg-[#1a1a1a] px-4 py-16 max-w-2xl mx-auto">
        <h2 className="font-cormorant text-4xl font-semibold text-white mb-8 text-center">
          Fresh out the chair ✦
        </h2>

        {visiblePhotos.length > 0 ? (
          <div className="grid grid-cols-3 gap-1.5 mb-6">
            {visiblePhotos.map((photo) => (
              <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden bg-[#2a2a2a]">
                <Image
                  src={photoUrl(photo.storage_path)}
                  alt={photo.caption || 'Brizee Bri style'}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
            {extraCount > 0 && (
              <div className="relative aspect-square rounded-lg overflow-hidden bg-[#2a2a2a] flex items-center justify-center">
                <span className="text-[#ffabdd] font-semibold text-lg">+{extraCount} more</span>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1.5 mb-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-square rounded-lg bg-[#2a2a2a] animate-pulse" />
            ))}
          </div>
        )}

        <a
          href={`https://instagram.com/${instagram.replace('@', '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between bg-[#2a2a2a] border border-white/10 rounded-2xl px-5 py-4 hover:border-[#ffabdd]/40 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Instagram size={20} className="text-[#ffabdd]" />
            <div>
              <p className="font-semibold text-sm text-white">Tag us on Instagram</p>
              <p className="text-white/50 text-xs">{instagram}</p>
            </div>
          </div>
          <span className="text-white/30 text-xs">→</span>
        </a>
      </section>

      {/* Social chips */}
      <section className="bg-[#141414] flex justify-center gap-3 px-4 pb-8">
        <a
          href={`https://instagram.com/${instagram.replace('@', '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#2a2a2a] border border-white/10 text-sm text-white hover:border-[#ffabdd]/40 transition-colors"
        >
          <Instagram size={14} className="text-[#ffabdd]" />
          {instagram}
        </a>
        <a
          href={`https://facebook.com/${facebook.replace('@', '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#2a2a2a] border border-white/10 text-sm text-white hover:border-[#ffabdd]/40 transition-colors"
        >
          <Facebook size={14} className="text-[#ffabdd]" />
          {facebook}
        </a>
      </section>

      {/* Policies accordion */}
      {policies.length > 0 && (
        <section className="bg-[#141414] px-4 pb-24 max-w-2xl mx-auto">
          <details className="group bg-[#2a2a2a] border border-white/10 rounded-2xl overflow-hidden">
            <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none select-none hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-2 text-sm font-medium text-white">
                <Clipboard size={15} className="text-[#ffabdd]" />
                Booking policies
              </div>
              <span className="text-white/30 text-xs group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div className="px-5 pb-5 pt-2 border-t border-white/10 space-y-4">
              {policies.map((policy) => (
                <div key={policy.id}>
                  <p className="font-semibold text-sm text-white">
                    {policy.icon} {policy.title}
                  </p>
                  <p className="text-white/50 text-sm mt-0.5">{policy.body}</p>
                </div>
              ))}
            </div>
          </details>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-[#0f0f0f] border-t border-white/5 px-6 py-10">
        <div className="max-w-2xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <span className="font-cormorant italic text-[#ffabdd] font-bold text-base leading-none">B</span>
              </div>
              <div>
                <p className="text-white text-sm font-semibold leading-tight">Brizee Bri Luxe Hair Studio</p>
                <p className="text-white/30 text-xs">{location}</p>
              </div>
            </div>
            <Link
              href="/book"
              className="bg-[#ffabdd] text-[#1a1a1a] font-semibold text-sm px-6 py-2.5 rounded-full hover:bg-[#c4658f] hover:text-white transition-all"
            >
              Request an Appointment
            </Link>
          </div>
          <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-white/20 text-xs">© {new Date().getFullYear()} Brizee Bri Luxe Hair Studio. All rights reserved.</p>
            <div className="flex items-center gap-4 text-xs text-white/30">
              <Link href="/privacy" className="hover:text-white/60 transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-white/60 transition-colors">Terms & Conditions</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Sticky bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-t from-[#141414] via-[#141414]/90 to-transparent pointer-events-none">
        <div className="pointer-events-auto max-w-sm mx-auto">
          <Link
            href="/book"
            className="flex items-center justify-center gap-2 w-full bg-[#ffabdd] text-[#1a1a1a] font-semibold py-4 rounded-full hover:bg-[#c4658f] hover:text-white transition-all duration-200 active:scale-95 shadow-lg shadow-[#ffabdd]/20"
          >
            ✦ Request an Appointment
          </Link>
        </div>
      </div>
    </div>
  )
}
