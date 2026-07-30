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
  } catch { return {} }
}

async function getGallery() {
  try {
    const sb = createSupabaseAdminClient()
    const { data } = await sb.from('gallery_photos').select('*').eq('active', true).order('display_order').limit(9)
    return data || []
  } catch { return [] }
}

async function getPolicies() {
  try {
    const sb = createSupabaseAdminClient()
    const { data } = await sb.from('policies').select('*').eq('active', true).order('display_order')
    return data || []
  } catch { return [] }
}

async function getServices() {
  try {
    const sb = createSupabaseAdminClient()
    const { data } = await sb.from('services').select('*').order('display_order').limit(8)
    return data || []
  } catch { return [] }
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
function photoUrl(path: string) {
  return `${SUPABASE_URL}/storage/v1/object/public/gallery/${path}`
}

export default async function HomePage() {
  const [settings, gallery, policies, services] = await Promise.all([
    getSettings(), getGallery(), getPolicies(), getServices(),
  ])

  const bio = settings.bio || "Bri is a self-taught braider from Texas with a passion for creativity and a dedication to making every client feel confident and regal. Specializing in knotless braids, goddess locs, boho styles, and more — every braid is personal."
  const instagram = settings.instagram || '@braidsbybrizeebri'
  const facebook = settings.facebook || '@braidsbybrizeebri'
  const location = settings.location || 'Pflugerville, TX'
  const heroHeadline = settings.hero_headline || 'Look Luxe.\nFeel Confident.'
  const heroSubtext = settings.hero_subtext || 'Book your next hair appointment with ease. Tell Bri your vision, pick your date, and she handles the rest.'
  const heroTagline = settings.hero_tagline || 'Luxury Hair. Flawless Finish.'

  const visiblePhotos = gallery.slice(0, 6)
  const extraCount = gallery.length > 6 ? gallery.length - 6 : 0

  return (
    <div className="min-h-screen font-sans bg-[#0f0f0f]">

      {/* ── Nav ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0f0f0f]/85 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-9 h-9 bg-white rounded-full overflow-hidden flex items-center justify-center shadow-md">
              <Image src="/logo.png" alt="BB" width={36} height={36} className="object-contain" />
            </div>
            <div className="hidden sm:block">
              <p className="font-cormorant font-semibold text-white text-sm leading-tight">Brizee Bri</p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#ffabdd]/70 leading-tight">Luxe Hair Studio</p>
            </div>
          </Link>

          {/* Center nav links — desktop only */}
          <div className="hidden lg:flex items-center gap-8">
            {[
              { label: 'Services', href: '#services' },
              { label: 'Gallery', href: '#gallery' },
              { label: 'About', href: '#about' },
              { label: 'Policies', href: '#policies' },
            ].map(({ label, href }) => (
              <a key={label} href={href} className="text-sm text-white/60 hover:text-[#ffabdd] transition-colors font-medium">
                {label}
              </a>
            ))}
          </div>

          {/* CTA */}
          <Link
            href="/book"
            className="bg-[#ffabdd] text-[#1a1a1a] font-semibold text-sm px-5 py-2.5 rounded-full hover:bg-[#c4658f] hover:text-white transition-all duration-200 active:scale-95 flex-shrink-0"
          >
            <span className="hidden sm:inline">Request an Appointment</span>
            <span className="sm:hidden">Book</span>
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
        {/* Background glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 -translate-y-1/2 right-0 w-[700px] h-[700px] rounded-full bg-[#ffabdd]/6 blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[#ffabdd]/4 blur-[100px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Left — copy */}
            <div className="flex flex-col gap-7 text-center lg:text-left items-center lg:items-start">
              <div>
                <p className="font-cormorant italic text-[#ffabdd] text-xl tracking-wide mb-3">{heroTagline}</p>
                <h1 className="font-cormorant font-bold text-white leading-none">
                  {heroHeadline.split('\n').map((line, i) => (
                    <span key={i} className="block text-5xl sm:text-6xl lg:text-7xl xl:text-8xl">
                      {i === 0 ? line : (
                        <span className="text-[#ffabdd]">{line}</span>
                      )}
                    </span>
                  ))}
                </h1>
              </div>
              <p className="text-white/55 text-lg leading-relaxed max-w-md">{heroSubtext}</p>
              <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                <Link
                  href="/book"
                  className="bg-[#ffabdd] text-[#1a1a1a] font-semibold px-7 py-3.5 rounded-full hover:bg-[#c4658f] hover:text-white transition-all duration-200 active:scale-95 shadow-lg shadow-[#ffabdd]/20 text-sm"
                >
                  ✦ Request an Appointment
                </Link>
                <a
                  href="#services"
                  className="border border-white/20 text-white font-medium px-7 py-3.5 rounded-full hover:border-[#ffabdd]/50 hover:text-[#ffabdd] transition-all text-sm"
                >
                  View Services
                </a>
              </div>
              <div className="flex items-center gap-1.5 text-white/40 text-sm">
                <MapPin size={13} className="text-[#ffabdd]" />
                <span>{location}</span>
              </div>
            </div>

            {/* Right — BB logo with halo */}
            <div className="hidden lg:flex items-center justify-center">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-[#ffabdd]/12 blur-[80px] scale-125" />
                <div
                  style={{
                    width: 340, height: 340, borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(255,171,221,0.08) 0%, transparent 70%)',
                    boxShadow: '0 0 0 1px rgba(255,171,221,0.15), 0 0 80px 20px rgba(255,171,221,0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <Image src="/logo.png" alt="Brizee Bri Luxe Hair Studio" width={280} height={280} className="object-contain drop-shadow-2xl" priority />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Services ── */}
      {services.length > 0 && (
        <section id="services" className="bg-[#141414] py-20 scroll-mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="font-cormorant text-4xl lg:text-5xl font-semibold text-white mb-3">Signature Services</h2>
              <p className="text-white/40 text-sm">Custom looks for every queen.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {services.map((svc: { id: string; name: string; description: string | null; base_price: number | null; duration_minutes: number; hair_included: boolean }) => (
                <div key={svc.id} className="bg-[#1a1a1a] border border-white/8 rounded-2xl p-5 flex flex-col gap-4 hover:border-[#ffabdd]/30 transition-all group">
                  <div className="w-10 h-10 rounded-xl bg-[#ffabdd]/10 flex items-center justify-center">
                    <Sparkles size={18} className="text-[#ffabdd]" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-white text-sm mb-1">{svc.name}</p>
                    {svc.description && (
                      <p className="text-white/40 text-xs leading-relaxed line-clamp-2">{svc.description}</p>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-0.5">
                      {svc.base_price ? (
                        <span className="text-[#ffabdd] font-bold text-lg">${svc.base_price}</span>
                      ) : (
                        <span className="text-white/40 text-xs">Consultation</span>
                      )}
                      <span className="text-white/30 text-[10px] flex items-center gap-1">
                        <Clock size={9} />
                        {svc.duration_minutes < 60
                          ? `${svc.duration_minutes}m`
                          : `${Math.floor(svc.duration_minutes / 60)}–${Math.floor(svc.duration_minutes / 60) + 1}h`}
                        {svc.hair_included && ' · Hair incl.'}
                      </span>
                    </div>
                    <Link
                      href="/book"
                      className="text-xs font-semibold px-4 py-2 rounded-full bg-[#ffabdd]/10 text-[#ffabdd] border border-[#ffabdd]/20 hover:bg-[#ffabdd] hover:text-[#1a1a1a] transition-all group-hover:border-[#ffabdd]/60"
                    >
                      Book
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link
                href="/book"
                className="inline-block bg-[#ffabdd] text-[#1a1a1a] font-semibold px-8 py-3.5 rounded-full hover:bg-[#c4658f] hover:text-white transition-all duration-200"
              >
                Request an Appointment →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── About / Bio ── */}
      <section id="about" className="bg-[#0f0f0f] py-20 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="font-cormorant italic text-[#ffabdd] text-lg mb-2">Meet Your Stylist</p>
              <h2 className="font-cormorant text-4xl lg:text-5xl font-semibold text-white mb-6">Your Hair, Your Crown</h2>
              <p className="text-white/60 leading-relaxed text-base mb-8">{bio}</p>
              <div className="flex flex-wrap gap-2">
                {['Braids', 'Wigs', 'Quick Weaves', 'Knotless', 'Goddess Locs', 'Boho Braids', '+ more'].map((tag) => (
                  <span key={tag} className="px-3 py-1.5 rounded-full text-sm border border-[#ffabdd]/25 text-[#ffabdd] bg-[#ffabdd]/8">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: <Sparkles size={22} className="text-[#ffabdd]" />, title: 'Custom Creations', body: 'Every style tailored to your vision.' },
                { icon: <Clock size={22} className="text-[#ffabdd]" />, title: 'Time Respected', body: 'Appointment-only — no waiting around.' },
                { icon: <Heart size={22} className="text-[#ffabdd]" />, title: 'Hair Health First', body: 'Protective styles that protect.' },
              ].map(({ icon, title, body }) => (
                <div key={title} className="bg-[#1a1a1a] border border-white/8 rounded-2xl p-4 flex flex-col gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#ffabdd]/10 flex items-center justify-center">{icon}</div>
                  <p className="text-white font-semibold text-xs">{title}</p>
                  <p className="text-white/40 text-xs leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="bg-[#141414] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="font-cormorant text-4xl lg:text-5xl font-semibold text-white mb-3">How It Works</h2>
            <p className="text-white/40 text-sm">Getting booked with Bri is simple</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10">
            {[
              { step: '01', title: 'Request Your Style', body: 'Choose your service, pick a preferred date, and submit your request — takes less than 5 minutes.' },
              { step: '02', title: 'Bri Reviews & Confirms', body: 'Bri personally reviews every request and reaches out within 24 hours to confirm and collect your deposit.' },
              { step: '03', title: 'Get Gorgeous', body: "Show up, relax, and leave with flawless braids. It's that simple." },
            ].map(({ step, title, body }, i) => (
              <div key={step} className="relative flex flex-col items-start gap-4">
                {i < 2 && (
                  <div className="hidden md:block absolute top-6 left-full w-full h-px bg-gradient-to-r from-[#ffabdd]/20 to-transparent -translate-x-8 z-0" />
                )}
                <div className="w-12 h-12 rounded-full border border-[#ffabdd]/30 flex items-center justify-center flex-shrink-0 bg-[#ffabdd]/5">
                  <span className="text-[#ffabdd] font-cormorant font-semibold text-lg">{step}</span>
                </div>
                <div>
                  <p className="text-white font-semibold text-base mb-2">{title}</p>
                  <p className="text-white/50 text-sm leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/book" className="inline-block bg-[#ffabdd] text-[#1a1a1a] font-semibold px-8 py-3.5 rounded-full hover:bg-[#c4658f] hover:text-white transition-all duration-200">
              Request an Appointment →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Gallery "Fresh out the chair" ── */}
      <section id="gallery" className="bg-[#0f0f0f] py-20 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-cormorant text-4xl lg:text-5xl font-semibold text-white mb-10 text-center">
            Fresh out the chair ✦
          </h2>
          {visiblePhotos.length > 0 ? (
            <div className="grid grid-cols-3 lg:grid-cols-6 gap-2 mb-6">
              {visiblePhotos.map((photo: { id: string; storage_path: string; caption: string | null }) => (
                <div key={photo.id} className="relative aspect-square rounded-xl overflow-hidden bg-[#2a2a2a]">
                  <Image src={photoUrl(photo.storage_path)} alt={photo.caption || 'Brizee Bri style'} fill className="object-cover hover:scale-105 transition-transform duration-500" />
                </div>
              ))}
              {extraCount > 0 && (
                <div className="relative aspect-square rounded-xl overflow-hidden bg-[#2a2a2a] flex items-center justify-center">
                  <span className="text-[#ffabdd] font-semibold text-lg">+{extraCount} more</span>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-3 lg:grid-cols-6 gap-2 mb-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-square rounded-xl bg-[#2a2a2a] animate-pulse" />
              ))}
            </div>
          )}
          <a
            href={`https://instagram.com/${instagram.replace('@', '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between bg-[#1a1a1a] border border-white/10 rounded-2xl px-5 py-4 hover:border-[#ffabdd]/40 transition-colors max-w-md mx-auto"
          >
            <div className="flex items-center gap-3">
              <Instagram size={20} className="text-[#ffabdd]" />
              <div>
                <p className="font-semibold text-sm text-white">Follow on Instagram</p>
                <p className="text-white/50 text-xs">{instagram}</p>
              </div>
            </div>
            <span className="text-white/30 text-xs">→</span>
          </a>
        </div>
      </section>

      {/* ── Policies ── */}
      {policies.length > 0 && (
        <section id="policies" className="bg-[#141414] py-20 scroll-mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-cormorant text-4xl lg:text-5xl font-semibold text-white mb-10 text-center">Booking Policies</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
              {policies.map((policy: { id: string; icon: string; title: string; body: string }) => (
                <div key={policy.id} className="bg-[#1a1a1a] border border-white/8 rounded-2xl p-5">
                  <p className="text-2xl mb-3">{policy.icon}</p>
                  <p className="font-semibold text-sm text-white mb-1.5">{policy.title}</p>
                  <p className="text-white/50 text-xs leading-relaxed">{policy.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Footer ── */}
      <footer className="bg-[#0a0a0a] border-t border-white/5 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-10 h-10 bg-white rounded-full overflow-hidden flex items-center justify-center">
                  <Image src="/logo.png" alt="BB" width={40} height={40} className="object-contain" />
                </div>
                <div>
                  <p className="font-cormorant font-semibold text-white text-sm leading-tight">Brizee Bri</p>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-[#ffabdd]/60 leading-tight">Luxe Hair Studio</p>
                </div>
              </div>
              <p className="font-cormorant italic text-[#ffabdd]/80 text-sm mb-4">Luxury Hair. Flawless Finish.</p>
              <div className="flex gap-3">
                <a href={`https://instagram.com/${instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:border-[#ffabdd]/40 transition-colors">
                  <Instagram size={14} className="text-white/60" />
                </a>
                <a href={`https://facebook.com/${facebook.replace('@', '')}`} target="_blank" rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:border-[#ffabdd]/40 transition-colors">
                  <Facebook size={14} className="text-white/60" />
                </a>
              </div>
            </div>

            {/* Quick links */}
            <div>
              <p className="text-xs uppercase tracking-widest text-white/30 mb-4 font-semibold">Quick Links</p>
              <div className="space-y-2.5">
                {[
                  { label: 'Request an Appointment', href: '/book' },
                  { label: 'Services', href: '#services' },
                  { label: 'Gallery', href: '#gallery' },
                  { label: 'About', href: '#about' },
                  { label: 'Policies', href: '#policies' },
                ].map(({ label, href }) => (
                  <div key={label}>
                    <a href={href} className="text-sm text-white/50 hover:text-[#ffabdd] transition-colors">{label}</a>
                  </div>
                ))}
              </div>
            </div>

            {/* Location */}
            <div>
              <p className="text-xs uppercase tracking-widest text-white/30 mb-4 font-semibold">Location</p>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <MapPin size={13} className="text-[#ffabdd] mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-white/50">{location}</p>
                </div>
                <p className="text-xs text-white/30 mt-2">Home-based studio</p>
                <p className="text-xs text-white/30">Appointment only</p>
              </div>
            </div>

            {/* Book CTA */}
            <div>
              <p className="text-xs uppercase tracking-widest text-white/30 mb-4 font-semibold">Ready?</p>
              <p className="text-sm text-white/50 mb-5 leading-relaxed">Book your appointment and get the royal treatment you deserve.</p>
              <Link href="/book" className="inline-block bg-[#ffabdd] text-[#1a1a1a] font-semibold text-sm px-6 py-3 rounded-full hover:bg-[#c4658f] hover:text-white transition-all">
                Request an Appointment
              </Link>
            </div>
          </div>

          <div className="border-t border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-white/20 text-xs">© {new Date().getFullYear()} Brizee Bri Luxe Hair Studio. All rights reserved.</p>
            <div className="flex items-center gap-5 text-xs text-white/30">
              <Link href="/privacy" className="hover:text-white/60 transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-white/60 transition-colors">Terms & Conditions</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Sticky bottom CTA — mobile only */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/90 to-transparent pointer-events-none">
        <div className="pointer-events-auto">
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
