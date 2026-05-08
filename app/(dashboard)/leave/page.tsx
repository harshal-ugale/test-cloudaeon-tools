'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { isPrivileged } from '@/lib/auth'
import { DEMO_LEAVES, LEAVE_TREND_DATA, LEAVE_TYPE_DISTRIBUTION } from '@/lib/mock-data'
import { getStatusColor, getLeaveTypeColor, formatDate } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { PageHeader } from '@/components/layout/DashboardShell'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts'
import { Plus, ClipboardCheck, CalendarDays, CheckCircle2, XCircle, Clock, ArrowRight } from 'lucide-react'

export default function LeavePage() {
  const { user } = useAuth()
  const isPriv = isPrivileged(user?.role ?? 'EMPLOYEE')

  const myLeaves = useMemo(() => {
    if (isPriv) return DEMO_LEAVES
    return DEMO_LEAVES.filter((l) => l.employeeId === user?.employeeId)
  }, [isPriv, user])

  const stats = useMemo(() => ({
    total: myLeaves.length,
    pending: myLeaves.filter((l) => l.status === 'PENDING').length,
    approved: myLeaves.filter((l) => l.status === 'APPROVED').length,
    rejected: myLeaves.filter((l) => l.status === 'REJECTED').length,
    totalDays: myLeaves.filter((l) => l.status === 'APPROVED').reduce((s, l) => s + l.days, 0),
  }), [myLeaves])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leave Management"
        description={isPriv ? 'Track and manage all employee leaves' : 'Your leave balance and history'}
      >
        <div className="flex gap-2">
          <Link href="/leave/apply">
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Apply Leave
            </Button>
          </Link>
          {isPriv && (
            <Link href="/leave/approvals">
              <Button variant="outline" size="sm" className="gap-2">
                <ClipboardCheck className="h-4 w-4" />
                Approvals {stats.pending > 0 && <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">{stats.pending}</span>}
              </Button>
            </Link>
          )}
        </div>
      </PageHeader>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Requests', value: stats.total, icon: CalendarDays, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Approved', value: stats.approved, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Total Days', value: stats.totalDays, icon: CalendarDays, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="stat-card flex items-center gap-3">
              <div className={`${s.bg} ${s.color} p-2.5 rounded-xl`}><Icon className="h-5 w-5" /></div>
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts */}
      {isPriv && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Leave trend bar chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Leave Trends by Month (2025)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={LEAVE_TREND_DATA} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="annual" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} name="Annual" />
                  <Bar dataKey="sick" stackId="a" fill="#ef4444" name="Sick" />
                  <Bar dataKey="emergency" stackId="a" fill="#f97316" name="Emergency" />
                  <Bar dataKey="other" stackId="a" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Other" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Pie chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Leave Type Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={LEAVE_TYPE_DISTRIBUTION}
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    dataKey="value"
                    nameKey="name"
                  >
                    {LEAVE_TYPE_DISTRIBUTION.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-1 mt-2">
                {LEAVE_TYPE_DISTRIBUTION.slice(0, 4).map((item) => (
                  <div key={item.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                    {item.name} ({item.value}%)
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Leave list */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">
              {isPriv ? 'All Leave Requests' : 'My Leave Requests'} ({myLeaves.length})
            </CardTitle>
            {isPriv && (
              <Link href="/leave/approvals">
                <Button variant="ghost" size="sm" className="gap-1 text-xs">
                  Pending ({stats.pending}) <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {myLeaves.length === 0 ? (
            <div className="text-center py-12">
              <CalendarDays className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-muted-foreground font-medium">No leave requests yet</p>
              <Link href="/leave/apply">
                <Button size="sm" className="mt-3 gap-2"><Plus className="h-4 w-4" />Apply Now</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {myLeaves.map((leave) => (
                <div key={leave.id} className="flex items-start gap-4 p-4 rounded-xl border border-border hover:bg-muted/30 transition-colors">
                  {isPriv && <Avatar name={leave.employeeName} size="sm" />}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {isPriv && <span className="text-sm font-semibold">{leave.employeeName}</span>}
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${getLeaveTypeColor(leave.type)}`}>{leave.type}</span>
                      <span className="text-xs text-muted-foreground">{leave.days} day{leave.days > 1 ? 's' : ''}</span>
                      {isPriv && <span className="text-xs text-muted-foreground">· {leave.department}</span>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(leave.startDate)} – {formatDate(leave.endDate)}
                    </p>
                    <p className="text-sm text-foreground/70 mt-1">{leave.reason}</p>
                    {leave.notes && (
                      <p className="text-xs text-blue-600 mt-1 bg-blue-50 rounded px-2 py-0.5 inline-block">
                        {leave.approverName}: {leave.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold flex-shrink-0 ${getStatusColor(leave.status)}`}>
                      {leave.status}
                    </span>
                    <span className="text-xs text-muted-foreground">{formatDate(leave.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
