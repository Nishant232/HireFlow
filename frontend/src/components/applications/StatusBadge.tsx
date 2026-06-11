import type { ApplicationStatus } from '@/types'
import { clsx } from 'clsx'

const STATUS_CONFIG: Record<ApplicationStatus, { label: string; classes: string }> = {
  wishlist: { label: 'Wishlist', classes: 'bg-gray-100 text-gray-700' },
  applied: { label: 'Applied', classes: 'bg-blue-100 text-blue-700' },
  screening: { label: 'Screening', classes: 'bg-yellow-100 text-yellow-700' },
  interview: { label: 'Interview', classes: 'bg-purple-100 text-purple-700' },
  offer: { label: 'Offer 🎉', classes: 'bg-green-100 text-green-700' },
  rejected: { label: 'Rejected', classes: 'bg-red-100 text-red-700' },
  withdrawn: { label: 'Withdrawn', classes: 'bg-gray-100 text-gray-500' },
}

interface Props {
  status: ApplicationStatus
  className?: string
}

export default function StatusBadge({ status, className }: Props) {
  const config = STATUS_CONFIG[status]
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        config.classes,
        className
      )}
    >
      {config.label}
    </span>
  )
}
