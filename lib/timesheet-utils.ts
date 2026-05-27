// PERIOD_TYPE: 'semi-monthly' = first half (1–14) and second half (15–end of month)
export const PERIOD_TYPE = 'semi-monthly' as const
export const GRACE_PERIOD_DAYS = 2  // days after period end to still allow submission

export function toISODate(date: Date): string {
  return date.toISOString().split('T')[0]
}

/** Returns the semi-monthly period containing `date`. */
export function getPeriodForDate(date: Date): { start: Date; end: Date } {
  const year = date.getFullYear()
  const month = date.getMonth()
  const day = date.getDate()
  if (day <= 14) {
    return { start: new Date(year, month, 1), end: new Date(year, month, 14) }
  }
  // Last day of month
  return { start: new Date(year, month, 15), end: new Date(year, month + 1, 0) }
}

export function getCurrentPeriod(): { start: Date; end: Date } {
  return getPeriodForDate(new Date())
}

/** All calendar dates from start to end inclusive. */
export function getPeriodDays(start: Date, end: Date): Date[] {
  const days: Date[] = []
  const curr = new Date(start)
  while (curr <= end) {
    days.push(new Date(curr))
    curr.setDate(curr.getDate() + 1)
  }
  return days
}

export function isWeekend(date: Date): boolean {
  const d = date.getDay()
  return d === 0 || d === 6
}

/** Days remaining to submit (includes grace period). Returns 0 when past deadline. */
export function getDaysLeftToSubmit(periodEnd: string | Date): number {
  const end = typeof periodEnd === 'string' ? new Date(periodEnd + 'T00:00:00') : new Date(periodEnd)
  const deadline = new Date(end)
  deadline.setDate(deadline.getDate() + GRACE_PERIOD_DAYS)
  deadline.setHours(23, 59, 59, 999)
  const diff = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  return Math.max(0, diff)
}

export function canSubmit(periodEnd: string | Date): boolean {
  return getDaysLeftToSubmit(periodEnd) > 0
}

/** Human-readable period label, e.g. "May 1 – May 14, 2026" */
export function formatPeriodLabel(start: string | Date, end: string | Date): string {
  const s = new Date(typeof start === 'string' ? start + 'T00:00:00' : start)
  const e = new Date(typeof end === 'string' ? end + 'T00:00:00' : end)

  const fmtShort = (d: Date) => d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
  const fmtYear = (d: Date) =>
    d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })

  if (s.getFullYear() !== e.getFullYear()) return `${fmtYear(s)} – ${fmtYear(e)}`
  return `${fmtShort(s)} – ${fmtYear(e)}`
}

/** Deterministic ID for a timesheet given employee + period start. */
export function timesheetId(employeeId: string, periodStart: Date): string {
  return `ts-${employeeId}-${toISODate(periodStart)}`
}

export const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
