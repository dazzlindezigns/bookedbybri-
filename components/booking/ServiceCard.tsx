'use client'

interface Service {
  id: string
  name: string
  description: string | null
  base_price: number | null
  duration_minutes: number
  requires_consultation: boolean
  hair_included: boolean
}

interface ServiceCardProps {
  service: Service
  selected: boolean
  onSelect: (service: Service) => void
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

export default function ServiceCard({ service, selected, onSelect }: ServiceCardProps) {
  return (
    <button
      onClick={() => onSelect(service)}
      className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 active:scale-[0.98] ${
        selected
          ? 'border-[#ffabdd] bg-[#ffabdd]/10 shadow-lg shadow-[#ffabdd]/10'
          : 'border-[#3a3a3a] bg-[#222] hover:border-[#ffabdd]/50'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-semibold text-white text-sm leading-tight">{service.name}</h3>
        {selected && (
          <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#ffabdd] flex items-center justify-center mt-0.5">
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
              <path d="M1 4L3.5 6.5L9 1" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}
      </div>

      {service.description && (
        <p className="text-white/50 text-xs leading-relaxed mb-3 line-clamp-2">
          {service.description}
        </p>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-white/40">⏱ {formatDuration(service.duration_minutes)}</span>

        {service.base_price !== null ? (
          <span className="text-sm font-semibold text-[#ffabdd]">
            from ${service.base_price.toFixed(0)}
          </span>
        ) : (
          <span className="text-xs text-[#ffabdd] italic">Consultation</span>
        )}

        {service.hair_included && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-[#ffabdd]/10 text-[#ffabdd] border border-[#ffabdd]/20">
            Hair incl.
          </span>
        )}

        {service.requires_consultation && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
            Consult req.
          </span>
        )}
      </div>
    </button>
  )
}
