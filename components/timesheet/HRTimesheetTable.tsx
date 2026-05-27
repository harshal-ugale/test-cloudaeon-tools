'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { TimesheetStatusBadge } from './TimesheetStatusBadge'
import { formatPeriodLabel } from '@/lib/timesheet-utils'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { Timesheet } from '@/lib/types'
import { CheckCircle2, XCircle, Eye, Clock } from 'lucide-react'

interface Props {
  timesheets: Timesheet[]
  onRefresh: () => void
}

export function HRTimesheetTable({ timesheets, onRefresh }: Props) {
  const { user } = useAuth()
  const [reviewTarget, setReviewTarget] = useState<{ ts: Timesheet; action: 'APPROVED' | 'REJECTED' } | null>(null)
  const [remarks, setRemarks] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [viewTarget, setViewTarget] = useState<Timesheet | null>(null)

  async function handleReview() {
    if (!reviewTarget) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/timesheets/${reviewTarget.ts.id}/review`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-demo-role': user?.role ?? '',
          'x-demo-emp-id': user?.employeeId ?? '',
        },
        body: JSON.stringify({
          status: reviewTarget.action,
          reviewedBy: user?.name ?? 'HR',
          remarks: remarks.trim() || undefined,
        }),
      })
      if (res.ok) {
        setReviewTarget(null)
        setRemarks('')
        onRefresh()
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (timesheets.length === 0) {
    return (
      <div className="text-center py-16 text-sm text-muted-foreground">
        <Clock className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
        No timesheets match the current filters.
      </div>
    )
  }

  return (
    <>
      <div className="rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Period</TableHead>
              <TableHead className="text-center">Total Hours</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {timesheets.map((ts) => (
              <TableRow key={ts.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar name={ts.employeeName ?? ts.employeeId} src={ts.employeeAvatar} size="xs" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{ts.employeeName}</p>
                      <p className="text-xs text-muted-foreground truncate">{ts.department}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm whitespace-nowrap">
                  {formatPeriodLabel(ts.periodStart, ts.periodEnd)}
                </TableCell>
                <TableCell className="text-center text-sm font-semibold tabular-nums">
                  {ts.totalHours}
                </TableCell>
                <TableCell>
                  <TimesheetStatusBadge status={ts.status} />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {ts.submittedAt
                    ? new Date(ts.submittedAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })
                    : '—'}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs gap-1"
                      onClick={() => setViewTarget(ts)}
                    >
                      <Eye className="h-3 w-3" /> View
                    </Button>
                    {ts.status === 'SUBMITTED' && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs gap-1 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                          onClick={() => { setReviewTarget({ ts, action: 'APPROVED' }); setRemarks('') }}
                        >
                          <CheckCircle2 className="h-3 w-3" /> Approve
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => { setReviewTarget({ ts, action: 'REJECTED' }); setRemarks('') }}
                        >
                          <XCircle className="h-3 w-3" /> Reject
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Approve / Reject dialog */}
      <Dialog open={!!reviewTarget} onClose={() => setReviewTarget(null)} className="max-w-md">
        {reviewTarget && (
          <>
            <DialogHeader onClose={() => setReviewTarget(null)}>
              <DialogTitle>
                {reviewTarget.action === 'APPROVED' ? 'Approve Timesheet' : 'Reject Timesheet'}
              </DialogTitle>
            </DialogHeader>
            <DialogContent>
              <p className="text-sm text-muted-foreground mb-3">
                {reviewTarget.action === 'APPROVED' ? 'Approving' : 'Rejecting'} timesheet for{' '}
                <strong>{reviewTarget.ts.employeeName}</strong> —{' '}
                {formatPeriodLabel(reviewTarget.ts.periodStart, reviewTarget.ts.periodEnd)}
              </p>
              <label className="block text-sm font-medium text-foreground mb-1">
                Remarks {reviewTarget.action === 'REJECTED' ? '*' : '(optional)'}
              </label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder={
                  reviewTarget.action === 'REJECTED'
                    ? 'Explain why this timesheet is being rejected…'
                    : 'Add a note for the employee (optional)…'
                }
                rows={3}
                className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
              />
              {reviewTarget.action === 'REJECTED' && !remarks.trim() && (
                <p className="text-xs text-muted-foreground mt-1">A reason is recommended when rejecting.</p>
              )}
            </DialogContent>
            <DialogFooter>
              <Button variant="outline" onClick={() => setReviewTarget(null)} disabled={submitting}>
                Cancel
              </Button>
              <Button
                onClick={handleReview}
                disabled={submitting}
                className={reviewTarget.action === 'REJECTED' ? 'bg-red-600 hover:bg-red-700 text-white' : ''}
              >
                {submitting
                  ? 'Saving…'
                  : reviewTarget.action === 'APPROVED'
                    ? 'Confirm Approval'
                    : 'Confirm Rejection'}
              </Button>
            </DialogFooter>
          </>
        )}
      </Dialog>

      {/* View-entries dialog */}
      <Dialog open={!!viewTarget} onClose={() => setViewTarget(null)} className="max-w-2xl">
        {viewTarget && (
          <>
            <DialogHeader onClose={() => setViewTarget(null)}>
              <div>
                <DialogTitle>{viewTarget.employeeName} — Timesheet</DialogTitle>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {formatPeriodLabel(viewTarget.periodStart, viewTarget.periodEnd)} · {viewTarget.totalHours} hrs
                </p>
              </div>
            </DialogHeader>
            <DialogContent>
              {viewTarget.remarks && (
                <div className={`mb-3 px-3 py-2 rounded-lg text-sm ${
                  viewTarget.status === 'REJECTED'
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}>
                  <span className="font-semibold">Reviewer note: </span>{viewTarget.remarks}
                </div>
              )}
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-xs font-semibold text-muted-foreground py-2 pr-4">Date</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground py-2 pr-4">Project</th>
                    <th className="text-center text-xs font-semibold text-muted-foreground py-2 pr-4 w-16">Hrs</th>
                    <th className="text-left text-xs font-semibold text-muted-foreground py-2">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {viewTarget.entries
                    .slice()
                    .sort((a, b) => a.date.localeCompare(b.date))
                    .map((e, i) => {
                      const d = new Date(e.date + 'T00:00:00')
                      return (
                        <tr key={e.id} className={i % 2 === 0 ? '' : 'bg-muted/10'}>
                          <td className="py-1.5 pr-4 text-xs text-muted-foreground whitespace-nowrap">
                            {d.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
                          </td>
                          <td className="py-1.5 pr-4 text-xs font-medium">{e.projectName}</td>
                          <td className="py-1.5 pr-4 text-xs text-center font-semibold text-primary">{e.hoursWorked}</td>
                          <td className="py-1.5 text-xs text-muted-foreground">{e.description ?? '—'}</td>
                        </tr>
                      )
                    })}
                </tbody>
              </table>
            </DialogContent>
            <DialogFooter>
              <Button variant="outline" onClick={() => setViewTarget(null)}>Close</Button>
            </DialogFooter>
          </>
        )}
      </Dialog>
    </>
  )
}
