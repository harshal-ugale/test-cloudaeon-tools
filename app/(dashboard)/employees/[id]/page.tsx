'use client'

import { useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { canViewEmployee } from '@/lib/auth'
import { DEMO_EMPLOYEES, DEMO_LEAVES, DEMO_PAYSLIPS, DEMO_PERFORMANCE, generateAttendance } from '@/lib/mock-data'
import { formatCurrency, formatDate, getStatusColor, getLeaveTypeColor } from '@/lib/utils'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { PageHeader } from '@/components/layout/DashboardShell'
import {
  ArrowLeft, Mail, Phone, Building2, Calendar, DollarSign,
  CalendarDays, TrendingUp, ClipboardCheck, FileText
} from 'lucide-react'
import Link from 'next/link'
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts'

export default function EmployeeProfilePage() {
  const { id } = useParams()
  const { user } = useAuth()
  const router = useRouter()

  const emp = DEMO_EMPLOYEES.find((e) => e.id === id)

  if (!emp) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-xl font-bold">Employee Not Found</p>
        <Link href="/employees"><Button variant="outline">Back to Employees</Button></Link>
      </div>
    )
  }

  if (!canViewEmployee(user?.role ?? 'EMPLOYEE', user?.employeeId ?? '', emp.id)) {
    router.replace('/dashboard')
    return null
  }

  const leaves = DEMO_LEAVES.filter((l) => l.employeeId === emp.id)
  const payslips = DEMO_PAYSLIPS.filter((p) => p.employeeId === emp.id).slice(0, 5)
  const attendance = useMemo(() => generateAttendance(emp.id), [emp.id])
  const performance = DEMO_PERFORMANCE.filter((p) => p.employeeId === emp.id)
  const latestPerf = performance[0]

  const grossPay = emp.basicSalary + emp.hra + emp.transport
  const deductions = emp.pf + Math.round((grossPay * emp.taxSlab) / 100)
  const netPay = grossPay - deductions

  const presentDays = attendance.filter((a) => a.status === 'PRESENT').length
  const totalWorkdays = attendance.filter((a) => a.status !== 'WEEKEND' && a.status !== 'HOLIDAY').length
  const attendancePct = totalWorkdays > 0 ? Math.round((presentDays / totalWorkdays) * 100) : 0

  const radarData = latestPerf
    ? [
        { skill: 'Technical', score: latestPerf.technicalSkills },
        { skill: 'Communication', score: latestPerf.communication },
        { skill: 'Teamwork', score: latestPerf.teamwork },
        { skill: 'Leadership', score: latestPerf.leadership },
        { skill: 'Delivery', score: latestPerf.delivery },
        { skill: 'Innovation', score: latestPerf.innovation },
      ]
    : []

  return (
    <div className="space-y-6">
      <PageHeader title="Employee Profile" description={`${emp.employeeCode} · ${emp.department}`}>
        <Link href="/employees">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        </Link>
      </PageHeader>

      {/* Profile header card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <Avatar name={`${emp.firstName} ${emp.lastName}`} src={emp.avatar} size="xl" />
            <div className="flex-1">
              <div className="flex flex-wrap items-start gap-3">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">{emp.firstName} {emp.lastName}</h2>
                  <p className="text-muted-foreground">{emp.jobTitle}</p>
                </div>
                <div className="flex gap-2 mt-1">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${getStatusColor(emp.status)}`}>{emp.status}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                {[
                  { icon: Building2, label: emp.department },
                  { icon: Mail, label: emp.email },
                  { icon: Phone, label: emp.phone ?? 'N/A' },
                  { icon: Calendar, label: `Since ${formatDate(emp.startDate)}` },
                ].map((item, i) => {
                  const Icon = item.icon
                  return (
                    <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Icon className="h-3.5 w-3.5 flex-shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Net Monthly Pay</p>
              <p className="text-2xl font-bold text-emerald-600">{formatCurrency(netPay)}</p>
              <p className="text-xs text-muted-foreground">Gross: {formatCurrency(grossPay)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="leaves">Leave History</TabsTrigger>
          <TabsTrigger value="payroll">Payroll</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          {latestPerf && <TabsTrigger value="performance">Performance</TabsTrigger>}
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <Card>
                <CardHeader><CardTitle className="text-sm">Salary Breakdown</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { label: 'Basic Salary', value: emp.basicSalary, type: 'earn' },
                    { label: 'HRA', value: emp.hra, type: 'earn' },
                    { label: 'Transport Allowance', value: emp.transport, type: 'earn' },
                    { label: 'Gross Pay', value: grossPay, type: 'total' },
                    { label: 'PF Deduction', value: -emp.pf, type: 'deduct' },
                    { label: `Income Tax (${emp.taxSlab}%)`, value: -Math.round((grossPay * emp.taxSlab) / 100), type: 'deduct' },
                    { label: 'Net Take-Home', value: netPay, type: 'net' },
                  ].map((row) => (
                    <div key={row.label} className={`flex justify-between items-center py-1.5 ${row.type === 'total' || row.type === 'net' ? 'border-t border-border font-semibold' : ''}`}>
                      <span className={`text-sm ${row.type === 'net' ? 'text-foreground font-bold' : 'text-muted-foreground'}`}>{row.label}</span>
                      <span className={`text-sm font-medium ${
                        row.type === 'earn' ? 'text-emerald-600' :
                        row.type === 'deduct' ? 'text-red-500' :
                        row.type === 'net' ? 'text-emerald-700 text-base font-bold' : 'text-foreground'
                      }`}>
                        {row.value < 0 ? `-${formatCurrency(-row.value)}` : formatCurrency(row.value)}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card>
                <CardContent className="pt-4 space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Attendance Rate</span>
                      <span className="font-semibold text-foreground">{attendancePct}%</span>
                    </div>
                    <Progress value={attendancePct} color={attendancePct > 90 ? '#10b981' : attendancePct > 75 ? '#f59e0b' : '#ef4444'} />
                  </div>
                  {latestPerf && (
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Performance Score</span>
                        <span className="font-semibold text-foreground">{latestPerf.overallScore}/100</span>
                      </div>
                      <Progress value={latestPerf.overallScore} color="#3b82f6" />
                    </div>
                  )}
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Leaves Taken (2025)</span>
                      <span className="font-semibold">{leaves.filter((l) => l.status === 'APPROVED').reduce((s, l) => s + l.days, 0)} days</span>
                    </div>
                    <Progress value={leaves.filter((l) => l.status === 'APPROVED').reduce((s, l) => s + l.days, 0)} max={24} />
                  </div>
                </CardContent>
              </Card>

              {emp.managerName && (
                <Card>
                  <CardContent className="pt-4">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold mb-2">Reporting To</p>
                    <div className="flex items-center gap-2">
                      <Avatar name={emp.managerName} size="sm" />
                      <span className="text-sm font-medium">{emp.managerName}</span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Leave History */}
        <TabsContent value="leaves">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Leave History ({leaves.length} requests)</CardTitle>
            </CardHeader>
            <CardContent>
              {leaves.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No leave records found.</p>
              ) : (
                <div className="space-y-3">
                  {leaves.map((l) => (
                    <div key={l.id} className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                      <CalendarDays className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${getLeaveTypeColor(l.type)}`}>{l.type}</span>
                          <span className="text-sm font-medium">{l.days} day{l.days > 1 ? 's' : ''}</span>
                          <span className="text-xs text-muted-foreground">{formatDate(l.startDate)} – {formatDate(l.endDate)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{l.reason}</p>
                        {l.notes && <p className="text-xs text-blue-600 mt-1">Note: {l.notes}</p>}
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${getStatusColor(l.status)}`}>{l.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payroll */}
        <TabsContent value="payroll">
          <div className="space-y-4">
            {payslips.map((ps) => (
              <Card key={ps.id}>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-semibold">{new Date(ps.year, ps.month - 1).toLocaleString('en-IN', { month: 'long', year: 'numeric' })}</p>
                      {ps.paidOn && <p className="text-xs text-muted-foreground">Paid on {formatDate(ps.paidOn)}</p>}
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-emerald-600">{formatCurrency(ps.netPay)}</p>
                      <p className="text-xs text-muted-foreground">Net Pay</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div><p className="text-muted-foreground text-xs">Gross</p><p className="font-medium">{formatCurrency(ps.grossPay)}</p></div>
                    <div><p className="text-muted-foreground text-xs">Deductions</p><p className="font-medium text-red-500">{formatCurrency(ps.deductions)}</p></div>
                    <div><p className="text-muted-foreground text-xs">PF</p><p className="font-medium">{formatCurrency(ps.pf)}</p></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Attendance */}
        <TabsContent value="attendance">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-6 mb-4 flex-wrap">
                {[
                  { label: 'Present', count: attendance.filter((a) => a.status === 'PRESENT').length, color: 'text-emerald-600' },
                  { label: 'Absent', count: attendance.filter((a) => a.status === 'ABSENT').length, color: 'text-red-600' },
                  { label: 'Weekends', count: attendance.filter((a) => a.status === 'WEEKEND').length, color: 'text-purple-600' },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                ))}
                <div className="flex-1">
                  <Progress value={attendancePct} color="#10b981" className="h-3" />
                  <p className="text-xs text-muted-foreground mt-1">{attendancePct}% attendance rate (Apr-May)</p>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground mb-2">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => <div key={d}>{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {attendance.slice(0, 35).map((a) => (
                  <div
                    key={a.id}
                    title={`${a.date}: ${a.status}`}
                    className={`h-8 rounded-md flex items-center justify-center text-xs font-medium ${
                      a.status === 'PRESENT' ? 'bg-emerald-100 text-emerald-700' :
                      a.status === 'ABSENT' ? 'bg-red-100 text-red-700' :
                      a.status === 'WEEKEND' ? 'bg-muted text-muted-foreground' :
                      'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {new Date(a.date).getDate()}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance */}
        {latestPerf && (
          <TabsContent value="performance">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle className="text-sm">Skills Radar — {latestPerf.quarter} {latestPerf.year}</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="hsl(var(--border))" />
                      <PolarAngleAxis dataKey="skill" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                      <Radar name="Score" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.25} />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Score Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 flex items-center gap-3">
                    <div className="text-4xl font-bold text-primary">{latestPerf.overallScore}</div>
                    <div>
                      <p className="text-sm font-semibold">Overall Score</p>
                      <p className="text-xs text-muted-foreground">Reviewed by {latestPerf.reviewedBy}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {radarData.map((item) => (
                      <div key={item.skill}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground">{item.skill}</span>
                          <span className="font-semibold">{item.score}/100</span>
                        </div>
                        <Progress value={item.score} />
                      </div>
                    ))}
                  </div>
                  {latestPerf.comments && (
                    <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground font-semibold uppercase mb-1">Manager Comments</p>
                      <p className="text-sm">{latestPerf.comments}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
