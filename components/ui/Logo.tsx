import Image from 'next/image'

interface LogoProps { size?: 'sm' | 'md' | 'lg'; showName?: boolean }
const sizes = { sm: { container: 32, wrapper: 40 }, md: { container: 48, wrapper: 60 }, lg: { container: 80, wrapper: 96 } }

export default function Logo({ size = 'md', showName = false }: LogoProps) {
  const { container, wrapper } = sizes[size]
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center justify-center bg-white rounded-full flex-shrink-0" style={{ width: wrapper, height: wrapper }}>
        <div className="relative" style={{ width: container, height: container }}>
          <Image src="/logo.png" alt="Brizee Bri Luxe Hair Studio" fill className="object-contain" />
        </div>
      </div>
      {showName && (
        <div>
          <p className="font-cormorant italic text-[#ffabdd] text-xl leading-tight">Brizee Bri</p>
          <p className="text-white/60 text-xs font-light tracking-widest uppercase">Luxe Hair Studio</p>
        </div>
      )}
    </div>
  )
}
