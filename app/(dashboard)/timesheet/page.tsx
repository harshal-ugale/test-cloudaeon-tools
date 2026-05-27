'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { isPrivileged } from '@/lib/auth'
import { formatPeriodLabel, getDaysLeftToSubmit, canSubmit } from '@/lib/timesheet-utils'
import { TimesheetGrid } from '@/components/timesheet/TimesheetGrid'
import { TimesheetStatusBadge } from '@/components/timesheet/TimesheetStatusBadge'
import { PastTimesheets } from '@/components/timesheet/PastTimesheets'
import { PageHeader } from '@/components/layout/DashboardShell'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Timesheet } from '@/lib/types'
import { Clock, CalendarDays, Send, AlertCircle, ExternalLink } from 'lucide-react'
import Link from 'next/link'

function SkeletonGrid() {
  return (
    <div className="space-y-4 animate-pulse">
      {[0, 1].map((w) => (
        <div key={w}>
          <div className="h-4 w-16 bg-muted rounded mb-2" />
          <div className="rounded-xl border border-border overflow-hidden">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="flex gap-3 px-3 py-2 border-b border-border/50 last:border-0">
                <div className="h-5 w-24 bg-muted rounded" />
                <div className="h-5 flex-1 bg-muted rounded" />
                <div className="h-5 w-16 bg-muted rounded" />
                <div className="h-5 flex-1 bg-muted rounded" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function TimesheetPage() {
  const { user } = useAuth()
  const isPriv = isPrivileged(user?.role ?? 'EMPLOYEE')

  const [timesheet, setTimesheet] = useState<Timesheet | null>(null)
  const [pastTimesheets, setPastTimesheets] = useState<Timesheet[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [activeTab, setActiveTab] = useState<'current' | 'past'>('current')

  const authHeaders = {
    'x-demo-role': user?.role ?? '',
    'x-demo-emp-id': user?.employeeId ?? '',
  }

  const loadCurrent = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const res = await fetch('/api/timesheets/current', { headers: authHeaders })
      if (res.ok) {
        const data = await res.json()
        setTimesheet(data.timesheet)
      }
    } finally {
      setLoading(false)
    }
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadPast = useCallback(async () => {
    if (!user) return
    const res = await fetch('/api/timesheets', { headers: authHeaders })
    if (res.ok) {
      const data = await res.json()
      // Exclude the current period timesheet from past list
      const current = timesheet
      setPastTimesheets(data.timesheets.filter((t: Timesheet) => t.id !== current?.id))
    }
  }, [user, timesheet]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { loadCurrent() }, [loadCurrent])
  useEffect(() => { if (activeTab === 'past' && user) loadPast() }, [activeTab, loadPast, user])

  async function handleSubmit() {
    if (!timesheet) return
    if (!canSubmit(timesheet.periodEnd)) {
      setSubmitError('The submission deadline has passed (period end + 2 days grace).')
      return
    }
    setSubmitting(true)
    setSubmitError('')
    try {
      const res = await fetch(`/api/timesheets/${timesheet.id}/submit`, {
        method: 'PATCH',
        headers: authHeaders,
      })
      if (res.ok) {
        const data = await res.json()
        setTimesheet(data.timesheet)
      } else {
        const err = await res.json()
        setSubmitError(err.error ?? 'Failed to submit timesheet.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const daysLeft = timesheet ? getDaysLeftToSubmit(timesheet.periodEnd) : 0
  const canEdit = timesheet?.status === 'DRAFT'
  const isLocked = timesheet?.status === 'SUBMITTED' || timesheet?.status === 'APPROVED'

  return (
    <div className="space-y-6 max-w-5xl">
      <PageHeader
        title="My Timesheet"
        description="Log your daily hours and submit for approval"
      >
        {isPriv && (
          <Link href="/timesheet/hr">
            <Button variant="outline" size="sm" className="gap-2">
              <ExternalLink className="h-4 w-4" /> HR View
            </Button>
          </Link>
        )}
      </PageHeader>

      {/* Period header card */}
      {timesheet && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <CalendarDays className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Current Period</p>
                  <p className="text-base font-bold text-foreground mt-0.5">
                    {formatPeriodLabel(timesheet.periodStart, timesheet.periodEnd)}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <TimesheetStatusBadge status={timesheet.status} size="md" />

                {timesheet.status === 'DRAFT' && (
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                    daysLeft <= 1
                      ? 'bg-red-100 text-red-700'
                      : daysLeft <= 3
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-blue-100 text-blue-700'
                  }`}>
                    <Clock className="h-3 w-3" />
                    {daysLeft === 0 ? 'Deadline passed' : `${daysLeft} day${daysLeft !== 1 ? 's' : ''} left to submit`}
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground tabular-nums">{timesheet.totalHours.toFixed(1)}</span>
                  <span>hrs logged</span>
                </div>
              </div>
            </div>

            {timesheet.status === 'REJECTED' && timesheet.remarks && (
              <div className="mt-3 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">Rejected: </span>{timesheet.remarks}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tab navigation */}
      <div className="flex gap-1 border-b border-border">
        {(['current', 'past'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition-colors -mb-px ${
              activeTab === tab
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab === 'current' ? 'Current Period' : 'Past Timesheets'}
          </button>
        ))}
      </div>

      {/* Current period tab */}
      {activeTab === 'current' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-primary" />
              {timesheet ? formatPeriodLabel(timesheet.periodStart, timesheet.periodEnd) : 'Loading…'}
              {isLocked && (
                <span className="ml-1 text-xs font-normal text-muted-foreground">(read-only)</span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <SkeletonGrid />
            ) : timesheet ? (
              <TimesheetGrid
                timesheet={timesheet}
                readOnly={isLocked}
                onTimesheetUpdate={setTimesheet}
              />
            ) : (
              <p className="text-sm text-muted-foreground">Could not load timesheet.</p>
            )}

            {/* Submit error */}
            {submitError && (
              <div className="mt-4 flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {submitError}
              </div>
            )}

            {/* Actions */}
            {!loading && timesheet && timesheet.status === 'DRAFT' && (
              <div className="flex gap-3 mt-5 pt-4 border-t border-border">
                <Button
                  onClick={handleSubmit}
                  disabled={submitting || !canSubmit(timesheet.periodEnd) || timesheet.totalHours === 0}
                  className="gap-2"
                >
                  <Send className="h-4 w-4" />
                  {submitting ? 'Submitting…' : 'Submit Timesheet'}
                </Button>
                <p className="self-center text-xs text-muted-foreground">
                  {timesheet.totalHours === 0
                    ? 'Add at least one entry before submitting.'
                    : 'Entries are auto-saved when you tab out.'}
                </p>
              </div>
            )}

            {!loading && timesheet?.status === 'SUBMITTED' && (
              <p className="mt-4 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                Timesheet submitted and awaiting HR review. You cannot make further changes.
              </p>
            )}

            {!loading && timesheet?.status === 'APPROVED' && (
              <p className="mt-4 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                This timesheet has been approved. No further changes allowed.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Past timesheets tab */}
      {activeTab === 'past' && (
        <PastTimesheets timesheets={pastTimesheets} />
      )}
    </div>
  )
}
