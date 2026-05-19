interface StatCardProps { label: string; value: number | string; icon: string; highlight?: boolean; sub?: string }

export default function StatCard({ label, value, icon, highlight, sub }: StatCardProps) {
  return (
    <div className={`rounded-2xl p-4 border ${highlight ? 'bg-[#ffabdd]/10 border-[#ffabdd]/30' : 'bg-[#222] border-[#3a3a3a]'}`}>
      <div className="flex items-start justify-between mb-3"><span className="text-2xl">{icon}</span></div>
      <p className={`text-3xl font-bold mb-1 ${highlight ? 'text-[#ffabdd]' : 'text-white'}`}>{value}</p>
      <p className="text-white/50 text-xs font-medium">{label}</p>
      {sub && <p className="text-white/30 text-xs mt-0.5">{sub}</p>}
    </div>
  )
}
