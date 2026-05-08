'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { isPrivileged } from '@/lib/auth'
import { DEMO_EMPLOYEES, DEMO_LEAVES, DEMO_PAYSLIPS, LEAVE_TREND_DATA } from '@/lib/mock-data'
import { formatCurrency, formatDate, getStatusColor, getRoleColor } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/layout/DashboardShell'
import {
  Users, UserMinus, ClipboardCheck, TrendingUp, ArrowRight,
  CalendarDays, CheckCircle2, Clock, AlertCircle, CreditCard
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend
} from 'recharts'

export default function DashboardPage() {
  const { user } = useAuth()
  const isPriv = isPrivileged(user?.role ?? 'EMPLOYEE')

  const stats = useMemo(() => {
    const totalEmployees = DEMO_EMPLOYEES.filter((e) => e.status !== 'TERMINATED').length
    const onLeaveToday = DEMO_EMPLOYEES.filter((e) => e.status === 'ON_LEAVE').length
    const pendingLeaves = DEMO_LEAVES.filter((l) => l.status === 'PENDING').length
    const thisMonthPayroll = isPriv
      ? DEMO_PAYSLIPS.filter((p) => p.month === 5 && p.year === 2025).reduce((s, p) => s + p.netPay, 0)
      : DEMO_PAYSLIPS.find((p) => p.employeeId === user?.employeeId && p.month === 5 && p.year === 2025)?.netPay ?? 0

    return { totalEmployees, onLeaveToday, pendingLeaves, thisMonthPayroll }
  }, [isPriv, user])

  const recentLeaves = useMemo(() => {
    if (!isPriv) return DEMO_LEAVES.filter((l) => l.employeeId === user?.employeeId).slice(0, 4)
    return DEMO_LEAVES.slice(0, 5)
  }, [isPriv, user])

  const recentEmployees = useMemo(() => {
    return DEMO_EMPLOYEES.filter((e) => e.status === 'ACTIVE').slice(0, 5)
  }, [])

  const statCards = [
    {
      title: isPriv ? 'Total Employees' : 'My Team Size',
      value: isPriv ? stats.totalEmployees : DEMO_EMPLOYEES.filter(e => e.managerId === user?.employeeId || e.id === user?.employeeId).length,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      change: '+2 this month',
      changeType: 'positive' as const,
    },
    {
      title: 'On Leave Today',
      value: stats.onLeaveToday,
      icon: UserMinus,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      change: '1 returning tomorrow',
      changeType: 'neutral' as const,
    },
    {
      title: 'Pending Approvals',
      value: stats.pendingLeaves,
      icon: ClipboardCheck,
      color: 'text-red-600',
      bg: 'bg-red-50',
      change: 'Needs attention',
      changeType: 'negative' as const,
    },
    {
      title: isPriv ? "May '25 Payroll" : "My May '25 Pay",
      value: formatCurrency(stats.thisMonthPayroll),
      icon: CreditCard,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      change: isPriv ? '+3.2% vs last month' : 'Net take-home',
      changeType: 'positive' as const,
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${user?.name?.split(' ')[0]} 👋`}
        description={`${user?.jobTitle} · ${user?.department} · ${new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}`}
      >
        {isPriv && (
          <Link href="/employees/new">
            <Button size="sm" className="gap-2">
              <Users className="h-4 w-4" />
              Add Employee
            </Button>
          </Link>
        )}
      </PageHeader>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.title} className="stat-card group">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{card.title}</p>
                  <p className="text-3xl font-bold text-foreground mt-2">{card.value}</p>
                  <p className={`text-xs mt-2 flex items-center gap-1 ${
                    card.changeType === 'positive' ? 'text-emerald-600' :
                    card.changeType === 'negative' ? 'text-red-600' : 'text-muted-foreground'
                  }`}>
                    {card.changeType === 'positive' && <TrendingUp className="h-3 w-3" />}
                    {card.changeType === 'negative' && <AlertCircle className="h-3 w-3" />}
                    {card.change}
                  </p>
                </div>
                <div className={`${card.bg} ${card.color} p-3 rounded-xl group-hover:scale-110 transition-transform`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leave trend */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Leave Trend 2025</CardTitle>
              <Link href="/leave">
                <Button variant="ghost" size="sm" className="gap-1 text-xs">
                  View all <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={LEAVE_TREND_DATA} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }}
                />
                <Area type="monotone" dataKey="annual" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} name="Annual" />
                <Area type="monotone" dataKey="sick" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} name="Sick" />
                <Area type="monotone" dataKey="emergency" stackId="1" stroke="#f97316" fill="#f97316" fillOpacity={0.2} name="Emergency" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Department headcount */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Headcount by Department</CardTitle>
              <Link href="/employees">
                <Button variant="ghost" size="sm" className="gap-1 text-xs">
                  View all <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={[
                  { dept: 'Eng', count: 4 },
                  { dept: 'Product', count: 2 },
                  { dept: 'Design', count: 1 },
                  { dept: 'HR', count: 1 },
                  { dept: 'Mktg', count: 1 },
                  { dept: 'QA', count: 1 },
                ]}
                margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="dept" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }}
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Headcount" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent leave requests */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-primary" />
                Recent Leave Requests
              </CardTitle>
              <Link href={isPriv ? '/leave/approvals' : '/leave'}>
                <Button variant="ghost" size="sm" className="gap-1 text-xs">All <ArrowRight className="h-3 w-3" /></Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentLeaves.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No leave requests</p>
            ) : recentLeaves.map((leave) => (
              <div key={leave.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/40 transition-colors">
                <Avatar name={leave.employeeName} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{leave.employeeName}</p>
                  <p className="text-xs text-muted-foreground">{leave.type} · {leave.days} day{leave.days > 1 ? 's' : ''}</p>
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getStatusColor(leave.status)}`}>
                  {leave.status}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Team members */}
        {isPriv ? (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  Active Employees
                </CardTitle>
                <Link href="/employees">
                  <Button variant="ghost" size="sm" className="gap-1 text-xs">All <ArrowRight className="h-3 w-3" /></Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentEmployees.map((emp) => (
                <Link key={emp.id} href={`/employees/${emp.id}`}>
                  <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/40 transition-colors cursor-pointer">
                    <Avatar name={`${emp.firstName} ${emp.lastName}`} src={emp.avatar} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{emp.firstName} {emp.lastName}</p>
                      <p className="text-xs text-muted-foreground">{emp.jobTitle} · {emp.department}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getRoleColor(emp.role)}`}>
                      {emp.role}
                    </span>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                My Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              {[
                { label: 'Apply Leave', href: '/leave/apply', icon: CalendarDays, color: 'text-blue-600 bg-blue-50' },
                { label: 'My Payslips', href: '/payroll/payslips', icon: CreditCard, color: 'text-emerald-600 bg-emerald-50' },
                { label: 'Attendance', href: '/attendance', icon: CheckCircle2, color: 'text-purple-600 bg-purple-50' },
                { label: 'My Profile', href: `/employees/${user?.employeeId}`, icon: Users, color: 'text-amber-600 bg-amber-50' },
              ].map((action) => {
                const Icon = action.icon
                return (
                  <Link key={action.href} href={action.href}>
                    <div className={`flex items-center gap-3 p-4 rounded-xl border border-border hover:shadow-md transition-all cursor-pointer group`}>
                      <div className={`${action.color} p-2 rounded-lg group-hover:scale-110 transition-transform`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium">{action.label}</span>
                    </div>
                  </Link>
                )
              })}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
