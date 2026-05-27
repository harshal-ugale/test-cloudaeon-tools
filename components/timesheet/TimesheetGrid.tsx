'use client'

import { useState, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getPeriodDays, isWeekend, DAY_SHORT, toISODate } from '@/lib/timesheet-utils'
import type { Timesheet, TimesheetEntry } from '@/lib/types'
import { Check, Loader2 } from 'lucide-react'

interface Props {
  timesheet: Timesheet
  readOnly?: boolean
  onTimesheetUpdate?: (updated: Timesheet) => void
}

type EntryMap = Record<string, Omit<TimesheetEntry, 'id' | 'timesheetId'>>

function buildEntryMap(entries: TimesheetEntry[]): EntryMap {
  const map: EntryMap = {}
  entries.forEach((e) => {
    map[e.date] = { date: e.date, hoursWorked: e.hoursWorked, projectName: e.projectName, description: e.description }
  })
  return map
}

export function TimesheetGrid({ timesheet, readOnly = false, onTimesheetUpdate }: Props) {
  const { user } = useAuth()
  const [entryMap, setEntryMap] = useState<EntryMap>(() => buildEntryMap(timesheet.entries))
  const [savingDates, setSavingDates] = useState<Set<string>>(new Set())
  const [savedDates, setSavedDates] = useState<Set<string>>(new Set())
  const dirtyDates = useRef<Set<string>>(new Set())

  const days = getPeriodDays(
    new Date(timesheet.periodStart + 'T00:00:00'),
    new Date(timesheet.periodEnd + 'T00:00:00'),
  )
  const week1 = days.slice(0, 7)
  const week2 = days.slice(7)

  const totalHours = Object.values(entryMap).reduce((s, e) => s + (e.hoursWorked || 0), 0)

  function handleChange(date: string, field: keyof Omit<TimesheetEntry, 'id' | 'timesheetId'>, value: string | number) {
    setEntryMap((prev) => ({
      ...prev,
      [date]: { date, hoursWorked: 0, projectName: '', ...prev[date], [field]: value },
    }))
    dirtyDates.current.add(date)
    setSavedDates((prev) => { const s = new Set(prev); s.delete(date); return s })
  }

  async function saveEntry(date: string) {
    if (!dirtyDates.current.has(date)) return
    const entry = entryMap[date]
    if (!entry || (!entry.projectName.trim() && !entry.hoursWorked)) {
      dirtyDates.current.delete(date)
      return
    }

    dirtyDates.current.delete(date)
    setSavingDates((prev) => new Set([...prev, date]))

    try {
      const res = await fetch(`/api/timesheets/${timesheet.id}/entries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-demo-role': user?.role ?? '',
          'x-demo-emp-id': user?.employeeId ?? '',
        },
        body: JSON.stringify(entry),
      })
      if (res.ok) {
        const data = await res.json()
        setSavedDates((prev) => new Set([...prev, date]))
        onTimesheetUpdate?.(data.timesheet)
        setTimeout(() => {
          setSavedDates((prev) => { const s = new Set(prev); s.delete(date); return s })
        }, 2000)
      }
    } catch {
      // silent — user can retry by tabbing out again
    } finally {
      setSavingDates((prev) => { const s = new Set(prev); s.delete(date); return s })
    }
  }

  function renderWeek(weekDays: Date[], weekLabel: string) {
    const weekTotal = weekDays.reduce((s, d) => s + (entryMap[toISODate(d)]?.hoursWorked || 0), 0)
    return (
      <div key={weekLabel}>
        <div className="flex items-center justify-between px-1 py-1.5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{weekLabel}</p>
          <p className="text-xs text-muted-foreground">{weekTotal > 0 ? `${weekTotal} hrs` : ''}</p>
        </div>
        <div className="rounded-xl border border-border overflow-hidden">
          {/* Header row */}
          <div className="grid grid-cols-[140px_1fr_80px_1fr_32px] bg-muted/40 border-b border-border px-3 py-2 gap-2">
            <span className="text-xs font-semibold text-muted-foreground">Day & Date</span>
            <span className="text-xs font-semibold text-muted-foreground">Project Name</span>
            <span className="text-xs font-semibold text-muted-foreground text-center">Hours</span>
            <span className="text-xs font-semibold text-muted-foreground">Description</span>
            <span />
          </div>

          {weekDays.map((day, idx) => {
            const iso = toISODate(day)
            const weekend = isWeekend(day)
            const entry = entryMap[iso]
            const saving = savingDates.has(iso)
            const saved = savedDates.has(iso)
            const disabled = readOnly || weekend

            return (
              <div
                key={iso}
                className={`grid grid-cols-[140px_1fr_80px_1fr_32px] px-3 py-1.5 gap-2 items-center border-b border-border/50 last:border-0 ${
                  weekend ? 'bg-muted/20' : idx % 2 === 0 ? 'bg-background' : 'bg-muted/5'
                }`}
              >
                {/* Day */}
                <div className="flex flex-col">
                  <span className={`text-sm font-medium ${weekend ? 'text-muted-foreground/60' : 'text-foreground'}`}>
                    {DAY_SHORT[day.getDay()]}, {day.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                  </span>
                  {weekend && <span className="text-[10px] text-muted-foreground/50">Weekend</span>}
                </div>

                {/* Project */}
                <input
                  type="text"
                  value={entry?.projectName ?? ''}
                  placeholder={weekend ? '—' : 'Project name'}
                  disabled={disabled}
                  onChange={(e) => handleChange(iso, 'projectName', e.target.value)}
                  onBlur={() => saveEntry(iso)}
                  className="h-7 w-full rounded-md border border-input bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-40 disabled:bg-transparent disabled:border-transparent"
                />

                {/* Hours */}
                <input
                  type="number"
                  min={0}
                  max={24}
                  step={0.5}
                  value={entry?.hoursWorked ?? ''}
                  placeholder={weekend ? '—' : '0'}
                  disabled={disabled}
                  onChange={(e) => handleChange(iso, 'hoursWorked', parseFloat(e.target.value) || 0)}
                  onBlur={() => saveEntry(iso)}
                  className="h-7 w-full rounded-md border border-input bg-background px-2 text-xs text-center focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-40 disabled:bg-transparent disabled:border-transparent"
                />

                {/* Description */}
                <input
                  type="text"
                  value={entry?.description ?? ''}
                  placeholder={weekend ? '—' : 'Brief description (optional)'}
                  disabled={disabled}
                  onChange={(e) => handleChange(iso, 'description', e.target.value)}
                  onBlur={() => saveEntry(iso)}
                  className="h-7 w-full rounded-md border border-input bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-40 disabled:bg-transparent disabled:border-transparent"
                />

                {/* Save indicator */}
                <div className="flex items-center justify-center">
                  {saving && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
                  {saved && <Check className="h-3 w-3 text-emerald-500" />}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {renderWeek(week1, 'Week 1')}
      {week2.length > 0 && renderWeek(week2, 'Week 2')}

      {/* Total row */}
      <div className="flex items-center justify-end gap-3 pt-1 pr-1">
        <span className="text-sm text-muted-foreground">Total hours this period</span>
        <span className="text-lg font-bold text-foreground tabular-nums">{totalHours.toFixed(1)}</span>
      </div>
    </div>
  )
}
