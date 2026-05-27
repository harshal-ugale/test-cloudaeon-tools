'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { isPrivileged } from '@/lib/auth'
import { HRTimesheetTable } from '@/components/timesheet/HRTimesheetTable'
import { PageHeader } from '@/components/layout/DashboardShell'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import type { Timesheet } from '@/lib/types'
import { ArrowLeft, Clock, CheckCircle2, XCircle, Send } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type StatusFilter = 'ALL' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'DRAFT'

export default function HRTimesheetPage() {
  const { user } = useAuth()
  const router = useRouter()
  const isPriv = isPrivileged(user?.role ?? 'EMPLOYEE')

  const [timesheets, setTimesheets] = useState<Timesheet[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (user && !isPriv) router.replace('/timesheet')
  }, [user, isPriv, router])

  const loadAll = useCallback(async () => {
    if (!user || !isPriv) return
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'ALL') params.set('status', statusFilter)
      const res = await fetch(`/api/timesheets/hr/all?${params}`, {
        headers: {
          'x-demo-role': user.role,
          'x-demo-emp-id': user.employeeId,
        },
      })
      if (res.ok) {
        const data = await res.json()
        setTimesheets(data.timesheets)
      }
    } finally {
      setLoading(false)
    }
  }, [user, isPriv, statusFilter])

  useEffect(() => { loadAll() }, [loadAll])

  const filtered = timesheets.filter((t) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      t.employeeName?.toLowerCase().includes(q) ||
      t.department?.toLowerCase().includes(q)
    )
  })

  // Summary counts
  const counts = {
    submitted: timesheets.filter((t) => t.status === 'SUBMITTED').length,
    approved: timesheets.filter((t) => t.status === 'APPROVED').length,
    rejected: timesheets.filter((t) => t.status === 'REJECTED').length,
    draft: timesheets.filter((t) => t.status === 'DRAFT').length,
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Timesheet Review"
        description="Review and approve employee timesheets"
      >
        <Link href="/timesheet">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> My Timesheet
          </Button>
        </Link>
      </PageHeader>

      {/* Summary stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Awaiting Review', count: counts.submitted, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', filter: 'SUBMITTED' as StatusFilter },
          { label: 'Approved',       count: counts.approved,  icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', filter: 'APPROVED' as StatusFilter },
          { label: 'Rejected',       count: counts.rejected,  icon: XCircle,      color: 'text-red-600',     bg: 'bg-red-50',     filter: 'REJECTED' as StatusFilter },
          { label: 'Draft',          count: counts.draft,     icon: Send,         color: 'text-blue-600',    bg: 'bg-blue-50',    filter: 'DRAFT' as StatusFilter },
        ].map(({ label, count, icon: Icon, color, bg, filter }) => (
          <button
            key={label}
            type="button"
            onClick={() => setStatusFilter(statusFilter === filter ? 'ALL' : filter)}
            className={`stat-card flex items-center gap-3 text-left transition-all ${statusFilter === filter ? 'ring-2 ring-primary' : ''}`}
          >
            <div className={`${bg} ${color} p-2.5 rounded-lg`}><Icon className="h-5 w-5" /></div>
            <div>
              <p className="text-2xl font-bold text-foreground tabular-nums">{count}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="w-44"
        >
          <option value="ALL">All Statuses</option>
          <option value="SUBMITTED">Awaiting Review</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="DRAFT">Draft</option>
        </Select>
        <Input
          placeholder="Search employee or department…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64"
        />
        <span className="self-center text-sm text-muted-foreground">
          {filtered.length} timesheet{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table */}
      {loading ? (
        <Card>
          <CardContent className="py-16 text-center text-sm text-muted-foreground animate-pulse">
            Loading timesheets…
          </CardContent>
        </Card>
      ) : (
        <HRTimesheetTable timesheets={filtered} onRefresh={loadAll} />
      )}
    </div>
  )
}
