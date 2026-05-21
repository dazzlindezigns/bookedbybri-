import Image from 'next/image'
import Link from 'next/link'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { MapPin, Instagram, Facebook, Clipboard } from 'lucide-react'

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
  'Knotless Braids',
  'Goddess Locs',
  'Boho Braids',
  'Passion Twists',
  'Faux Locs',
  'Tribal Braids',
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
            Braids by Brizee Bri
          </span>
        </div>
        <Link
          href="/book"
          className="bg-[#ffabdd] text-[#1a1a1a] font-semibold text-sm px-5 py-2.5 rounded-full hover:bg-[#c4658f] hover:text-white transition-all duration-200 active:scale-95"
        >
          Book Now
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
              background: 'white',
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
              alt="Braids by Brizee Bri Logo"
              width={154}
              height={154}
              className="object-contain"
              priority
            />
          </div>

          <div>
            <p className="font-cormorant text-2xl font-light tracking-widest text-white/80 uppercase">
              Braids by
            </p>
            <h1 className="font-cormorant italic text-6xl sm:text-7xl font-semibold text-[#ffabdd] leading-none mt-1">
              Brizee Bri
            </h1>
          </div>

          <div className="flex items-center gap-1.5 text-white/60 text-sm">
            <MapPin size={14} className="text-[#ffabdd]" />
            <span>{location}</span>
          </div>

          <Link
            href="/book"
            className="mt-2 bg-[#ffabdd] text-[#1a1a1a] font-semibold px-8 py-3.5 rounded-full hover:bg-[#c4658f] hover:text-white transition-all duration-200 active:scale-95 shadow-lg shadow-[#ffabdd]/20"
          >
            Book an Appointment
          </Link>
        </div>
      </section>

      {/* Bio — cream */}
      <section className="bg-[#f7f5f3] px-6 py-16 max-w-2xl mx-auto">
        <h2 className="font-cormorant text-4xl font-semibold text-[#1a1a1a] mb-6 text-center">
          Your Hair, Your Crown
        </h2>
        <p className="text-[#6b6460] leading-relaxed text-center mb-8">{bio}</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {STYLE_TAGS.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1.5 rounded-full text-sm border border-[#ffabdd]/50 text-[#c4658f] bg-[#fff0f8]"
            >
              {tag}
            </span>
          ))}
        </div>
      </section>

      {/* Gallery — white */}
      <section className="bg-white px-4 py-16 max-w-2xl mx-auto">
        <h2 className="font-cormorant text-4xl font-semibold text-[#1a1a1a] mb-8 text-center">
          Fresh out the chair ✦
        </h2>

        {visiblePhotos.length > 0 ? (
          <div className="grid grid-cols-3 gap-1.5 mb-6">
            {visiblePhotos.map((photo) => (
              <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden bg-[#f7f5f3]">
                <Image
                  src={photoUrl(photo.storage_path)}
                  alt={photo.caption || 'Brizee Bri style'}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
            {extraCount > 0 && (
              <div className="relative aspect-square rounded-lg overflow-hidden bg-[#fff0f8] flex items-center justify-center">
                <span className="text-[#c4658f] font-semibold text-lg">+{extraCount} more</span>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1.5 mb-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-square rounded-lg bg-[#f7f5f3] animate-pulse" />
            ))}
          </div>
        )}

        <a
          href={`https://instagram.com/${instagram.replace('@', '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between bg-[#f7f5f3] border border-[#ede9e5] rounded-2xl px-5 py-4 hover:border-[#ffabdd]/60 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Instagram size={20} className="text-[#c4658f]" />
            <div>
              <p className="font-semibold text-sm text-[#1a1a1a]">Tag us on Instagram</p>
              <p className="text-[#8a7f7a] text-xs">{instagram}</p>
            </div>
          </div>
          <span className="text-[#b0a8a4] text-xs">→</span>
        </a>
      </section>

      {/* Social chips */}
      <section className="bg-[#f7f5f3] flex justify-center gap-3 px-4 pb-8">
        <a
          href={`https://instagram.com/${instagram.replace('@', '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#ede9e5] text-sm text-[#1a1a1a] hover:border-[#ffabdd]/60 transition-colors"
        >
          <Instagram size={14} className="text-[#c4658f]" />
          {instagram}
        </a>
        <a
          href={`https://facebook.com/${facebook.replace('@', '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#ede9e5] text-sm text-[#1a1a1a] hover:border-[#ffabdd]/60 transition-colors"
        >
          <Facebook size={14} className="text-[#c4658f]" />
          {facebook}
        </a>
      </section>

      {/* Policies accordion */}
      {policies.length > 0 && (
        <section className="bg-[#f7f5f3] px-4 pb-24 max-w-2xl mx-auto">
          <details className="group bg-white border border-[#ede9e5] rounded-2xl overflow-hidden">
            <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none select-none hover:bg-[#f7f5f3] transition-colors">
              <div className="flex items-center gap-2 text-sm font-medium text-[#1a1a1a]">
                <Clipboard size={15} className="text-[#c4658f]" />
                Booking policies
              </div>
              <span className="text-[#b0a8a4] text-xs group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div className="px-5 pb-5 pt-2 border-t border-[#ede9e5] space-y-4">
              {policies.map((policy) => (
                <div key={policy.id}>
                  <p className="font-semibold text-sm text-[#1a1a1a]">
                    {policy.icon} {policy.title}
                  </p>
                  <p className="text-[#8a7f7a] text-sm mt-0.5">{policy.body}</p>
                </div>
              ))}
            </div>
          </details>
        </section>
      )}

      {/* Sticky bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-t from-[#f7f5f3] via-[#f7f5f3]/90 to-transparent pointer-events-none">
        <div className="pointer-events-auto max-w-sm mx-auto">
          <Link
            href="/book"
            className="flex items-center justify-center gap-2 w-full bg-[#1a1a1a] text-white font-semibold py-4 rounded-full hover:bg-[#ffabdd] hover:text-[#1a1a1a] transition-all duration-200 active:scale-95 shadow-lg"
          >
            ✦ Book an appointment
          </Link>
        </div>
      </div>
    </div>
  )
}
