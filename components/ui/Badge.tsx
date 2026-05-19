interface BadgeProps {
  status: 'pending' | 'confirmed' | 'declined' | 'completed' | 'cancelled' | string
  size?: 'sm' | 'md'
}

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: {
    label: 'Pending',
    className: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
  },
  confirmed: {
    label: 'Confirmed',
    className: 'bg-[#ffabdd]/15 text-[#ffabdd] border border-[#ffabdd]/30',
  },
  declined: {
    label: 'Declined',
    className: 'bg-red-500/15 text-red-400 border border-red-500/30',
  },
  completed: {
    label: 'Completed',
    className: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-[#3a3a3a] text-[#8a8a8a] border border-[#3a3a3a]',
  },
  deposit_paid: {
    label: 'Deposit Paid',
    className: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',
  },
  paid: {
    label: 'Paid',
    className: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
  },
  unpaid: {
    label: 'Unpaid',
    className: 'bg-[#3a3a3a] text-[#8a8a8a] border border-[#3a3a3a]',
  },
}

export default function Badge({ status, size = 'sm' }: BadgeProps) {
  const config = statusConfig[status] || {
    label: status,
    className: 'bg-[#3a3a3a] text-[#8a8a8a] border border-[#3a3a3a]',
  }

  const sizeClass = size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm'

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${sizeClass} ${config.className}`}>
      {config.label}
    </span>
  )
}
