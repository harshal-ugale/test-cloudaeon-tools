import type { TimesheetStatus } from '@/lib/types'

const CONFIG: Record<TimesheetStatus, { label: string; classes: string }> = {
  DRAFT:     { label: 'Draft',     classes: 'bg-gray-100 text-gray-600' },
  SUBMITTED: { label: 'Submitted', classes: 'bg-amber-100 text-amber-700' },
  APPROVED:  { label: 'Approved',  classes: 'bg-emerald-100 text-emerald-700' },
  REJECTED:  { label: 'Rejected',  classes: 'bg-red-100 text-red-700' },
}

export function TimesheetStatusBadge({
  status,
  size = 'sm',
}: {
  status: TimesheetStatus
  size?: 'sm' | 'md'
}) {
  const { label, classes } = CONFIG[status]
  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold ${classes} ${
        size === 'md' ? 'px-3 py-1 text-sm' : 'px-2 py-0.5 text-xs'
      }`}
    >
      {label}
    </span>
  )
}
