'use client'

import { useState, type FormEvent } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/layout/DashboardShell'
import { calculateLeaveDays } from '@/lib/utils'
import { ArrowLeft, CalendarDays, CheckCircle2, AlertCircle } from 'lucide-react'
import Link from 'next/link'

// Balances per spec: Annual:18, Sick:10, Emergency:5
const LEAVE_TYPES = [
  { value: 'ANNUAL',       label: 'Annual Leave',       balance: 18 },
  { value: 'SICK',         label: 'Sick Leave',         balance: 10 },
  { value: 'EMERGENCY',    label: 'Emergency Leave',    balance: 5  },
  { value: 'COMPENSATORY', label: 'Compensatory Off',   balance: 2  },
  { value: 'UNPAID',       label: 'Unpaid Leave',       balance: -1 }, // -1 = unlimited
]

export default function ApplyLeavePage() {
  const { user } = useAuth()

  const [type, setType] = useState('ANNUAL')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const days = startDate && endDate ? calculateLeaveDays(startDate, endDate) : 0

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (days <= 0) return
    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/leave', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-demo-role': user?.role ?? '',
          'x-demo-emp-id': user?.employeeId ?? '',
        },
        body: JSON.stringify({
          employeeId: user?.employeeId,
          employeeName: user?.name,
          employeeAvatar: user?.avatar,
          department: user?.department,
          type,
          startDate,
          endDate,
          days,
          reason,
        }),
      })
      if (!res.ok) throw new Error(await res.text())
      setSubmitted(true)
    } catch (err) {
      setError('Failed to submit leave request. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto mt-20 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
          <CheckCircle2 className="h-10 w-10 text-emerald-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Leave Applied!</h2>
          <p className="text-muted-foreground mt-2">
            Your {LEAVE_TYPES.find((t) => t.value === type)?.label} request for{' '}
            <strong>{days} working day{days !== 1 ? 's' : ''}</strong> has been submitted for approval.
          </p>
        </div>
        <div className="bg-muted/50 rounded-xl p-4 text-sm text-muted-foreground">
          You will receive an email notification once your manager approves or rejects the request.
        </div>
        <div className="flex gap-3 justify-center">
          <Link href="/leave">
            <Button variant="outline">View My Leaves</Button>
          </Link>
          <Button onClick={() => { setSubmitted(false); setStartDate(''); setEndDate(''); setReason('') }}>
            Apply Another
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader title="Apply for Leave" description="Submit a new leave request for approval">
        <Link href="/leave">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        </Link>
      </PageHeader>

      {/* Leave balance tiles — Annual:18, Sick:10, Emergency:5 per spec */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
        {LEAVE_TYPES.map((lt) => (
          <button
            key={lt.value}
            type="button"
            onClick={() => setType(lt.value)}
            className={`p-3 rounded-xl border-2 text-left transition-all ${
              type === lt.value
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/40'
            }`}
          >
            <p className="text-2xl font-bold text-foreground">
              {lt.balance === -1 ? '∞' : lt.balance}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5 leading-tight">{lt.label}</p>
          </button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-primary" />
            Leave Request Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Read-only employee field */}
            <div className="space-y-1.5">
              <Label>Employee</Label>
              <div className="h-9 px-3 py-1 text-sm bg-muted rounded-lg flex items-center text-muted-foreground">
                {user?.name} — {user?.department}
              </div>
            </div>

            {/* Leave Type */}
            <div className="space-y-1.5">
              <Label htmlFor="leaveType">Leave Type *</Label>
              <Select id="leaveType" value={type} onChange={(e) => setType(e.target.value)} required>
                {LEAVE_TYPES.map((lt) => (
                  <option key={lt.value} value={lt.value}>
                    {lt.label} ({lt.balance === -1 ? 'Unlimited' : `${lt.balance} days balance`})
                  </option>
                ))}
              </Select>
            </div>

            {/* Date range */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="startDate">From Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value)
                    if (endDate && e.target.value > endDate) setEndDate('')
                  }}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="endDate">To Date *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate || new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
            </div>

            {/* Auto-calculated days */}
            {days > 0 && (
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-primary flex-shrink-0" />
                <p className="text-sm">
                  <span className="font-semibold text-primary">{days} working day{days !== 1 ? 's' : ''}</span>
                  {' '}(weekends automatically excluded)
                </p>
              </div>
            )}

            {/* Reason */}
            <div className="space-y-1.5">
              <Label htmlFor="reason">Reason *</Label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Brief description of your leave reason..."
                required
                rows={3}
                className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                disabled={submitting || days === 0}
                className="gap-2"
              >
                {submitting
                  ? 'Submitting...'
                  : `Submit Request${days > 0 ? ` (${days} day${days !== 1 ? 's' : ''})` : ''}`}
              </Button>
              <Link href="/leave">
                <Button type="button" variant="outline">Cancel</Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Leave policy */}
      <Card className="bg-muted/30">
        <CardContent className="pt-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Leave Policy Reminders</p>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Apply at least 3 working days in advance for planned leaves</li>
            <li>• Emergency leaves can be applied on the same day</li>
            <li>• Weekend days are automatically excluded from the leave count</li>
            <li>• Approval is required from your reporting manager</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
