import { cn } from '@/lib/utils'
import type { CertificationStatus } from '@/lib/types'

const CONFIG: Record<CertificationStatus, { label: string; classes: string }> = {
  PENDING_REVIEW: { label: 'Pending Review', classes: 'bg-amber-100 text-amber-700 border-amber-200' },
  VERIFIED:       { label: 'Verified',        classes: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  REJECTED:       { label: 'Rejected',         classes: 'bg-red-100 text-red-700 border-red-200' },
}

export function CertificationStatusBadge({ status }: { status: CertificationStatus }) {
  const { label, classes } = CONFIG[status] ?? CONFIG.PENDING_REVIEW
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border', classes)}>
      {label}
    </span>
  )
}
