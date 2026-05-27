'use client'

import { useState } from 'react'
import { TimesheetStatusBadge } from './TimesheetStatusBadge'
import { formatPeriodLabel, DAY_SHORT } from '@/lib/timesheet-utils'
import type { Timesheet } from '@/lib/types'
import { ChevronDown, ChevronRight, Clock } from 'lucide-react'

interface Props {
  timesheets: Timesheet[]
}

export function PastTimesheets({ timesheets }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null)

  if (timesheets.length === 0) {
    return (
      <div className="text-center py-10 text-sm text-muted-foreground">
        <Clock className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
        No past timesheets found.
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {timesheets.map((ts) => {
        const isOpen = expanded === ts.id
        return (
          <div key={ts.id} className="rounded-xl border border-border overflow-hidden">
            {/* Header row */}
            <button
              type="button"
              onClick={() => setExpanded(isOpen ? null : ts.id)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors text-left"
            >
              {isOpen
                ? <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                : <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              }
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-foreground">
                    {formatPeriodLabel(ts.periodStart, ts.periodEnd)}
                  </span>
                  <TimesheetStatusBadge status={ts.status} />
                </div>
                <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground flex-wrap">
                  <span>{ts.totalHours} hrs logged</span>
                  {ts.submittedAt && (
                    <span>Submitted {new Date(ts.submittedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
                  )}
                  {ts.reviewedBy && <span>Reviewed by {ts.reviewedBy}</span>}
                </div>
              </div>
            </button>

            {/* Expanded entries */}
            {isOpen && (
              <div className="border-t border-border bg-muted/10">
                {ts.remarks && (
                  <div className={`mx-4 mt-3 px-3 py-2 rounded-lg text-sm ${
                    ts.status === 'REJECTED'
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}>
                    <span className="font-semibold">Reviewer note: </span>{ts.remarks}
                  </div>
                )}

                {ts.entries.length === 0 ? (
                  <p className="px-4 py-3 text-sm text-muted-foreground">No entries recorded.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border/50">
                          <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-2 w-32">Day & Date</th>
                          <th className="text-left text-xs font-semibold text-muted-foreground px-2 py-2">Project</th>
                          <th className="text-center text-xs font-semibold text-muted-foreground px-2 py-2 w-16">Hours</th>
                          <th className="text-left text-xs font-semibold text-muted-foreground px-2 py-2">Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ts.entries
                          .slice()
                          .sort((a, b) => a.date.localeCompare(b.date))
                          .map((entry, i) => {
                            const d = new Date(entry.date + 'T00:00:00')
                            return (
                              <tr key={entry.id} className={i % 2 === 0 ? '' : 'bg-muted/10'}>
                                <td className="px-4 py-1.5 text-xs text-muted-foreground whitespace-nowrap">
                                  {DAY_SHORT[d.getDay()]}, {d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                                </td>
                                <td className="px-2 py-1.5 text-xs font-medium">{entry.projectName}</td>
                                <td className="px-2 py-1.5 text-xs text-center font-semibold text-primary">{entry.hoursWorked}</td>
                                <td className="px-2 py-1.5 text-xs text-muted-foreground">{entry.description ?? '—'}</td>
                              </tr>
                            )
                          })}
                      </tbody>
                      <tfoot>
                        <tr className="border-t border-border">
                          <td colSpan={2} className="px-4 py-1.5 text-xs font-semibold text-muted-foreground">Total</td>
                          <td className="px-2 py-1.5 text-xs text-center font-bold text-foreground">{ts.totalHours}</td>
                          <td />
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
