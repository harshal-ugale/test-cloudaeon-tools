'use client'

import { useMemo, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { isPrivileged } from '@/lib/auth'
import { DEMO_EMPLOYEES, generateAttendance } from '@/lib/mock-data'
import { getStatusColor } from '@/lib/utils'
import { Avatar } from '@/components/ui/avatar'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { PageHeader } from '@/components/layout/DashboardShell'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts'
import { CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react'

const MONTH_DAYS_2025 = { 4: 30, 5: 8 }

export default function AttendancePage() {
  const { user } = useAuth()
  const isPriv = isPrivileged(user?.role ?? 'EMPLOYEE')
  const [selectedEmpId, setSelectedEmpId] = useState(user?.employeeId ?? 'emp-003')

  const viewEmpId = isPriv ? selectedEmpId : (user?.employeeId ?? 'emp-003')
  const selectedEmp = DEMO_EMPLOYEES.find((e) => e.id === viewEmpId)
  const attendance = useMemo(() => generateAttendance(viewEmpId), [viewEmpId])

  const aprAttendance = attendance.filter((a) => a.date.startsWith('2025-04'))
  const mayAttendance = attendance.filter((a) => a.date.startsWith('2025-05'))

  const presentCount = (list: typeof attendance) => list.filter((a) => a.status === 'PRESENT').length
  const absentCount = (list: typeof attendance) => list.filter((a) => a.status === 'ABSENT').length
  const weekendCount = (list: typeof attendance) => list.filter((a) => a.status === 'WEEKEND').length
  const workingDays = (list: typeof attendance) => list.filter((a) => a.status !== 'WEEKEND' && a.status !== 'HOLIDAY').length

  const overallAttendance = attendance.filter((a) => a.status !== 'WEEKEND' && a.status !== 'HOLIDAY')
  const overallPct = overallAttendance.length > 0
    ? Math.round((presentCount(attendance) / overallAttendance.length) * 100)
    : 0

  const weeklyData = [
    { week: 'Apr W1', present: 5, absent: 0 },
    { week: 'Apr W2', present: 4, absent: 1 },
    { week: 'Apr W3', present: 5, absent: 0 },
    { week: 'Apr W4', present: 5, absent: 0 },
    { week: 'May W1', present: 5, absent: 0 },
    { week: 'May W2', present: 3, absent: 0 },
  ]

  function CalendarGrid({ records }: { records: typeof attendance }) {
    if (records.length === 0) return <p className="text-center text-muted-foreground py-4">No data</p>
    const firstDay = new Date(records[0].date).getDay()
    const blanks = Array(firstDay).fill(null)

    return (
      <div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground mb-2">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => <div key={d}>{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {blanks.map((_, i) => <div key={`b${i}`} />)}
          {records.map((a) => {
            const day = new Date(a.date).getDate()
            const isFuture = new Date(a.date) > new Date()
            return (
              <div
                key={a.id}
                title={`${a.date}: ${a.status}${a.checkIn ? ` (${a.checkIn} – ${a.checkOut})` : ''}`}
                className={`h-9 rounded-lg flex flex-col items-center justify-center text-xs cursor-default select-none ${
                  isFuture ? 'bg-muted/30 text-muted-foreground' :
                  a.status === 'PRESENT' ? 'bg-emerald-100 text-emerald-700 font-medium' :
                  a.status === 'ABSENT' ? 'bg-red-100 text-red-700 font-medium' :
                  a.status === 'WEEKEND' ? 'bg-muted/50 text-muted-foreground' :
                  a.status === 'HALF_DAY' ? 'bg-amber-100 text-amber-700 font-medium' :
                  'bg-blue-100 text-blue-700 font-medium'
                }`}
              >
                <span>{day}</span>
                {a.status === 'PRESENT' && <div className="w-1 h-1 rounded-full bg-emerald-500 mt-0.5" />}
                {a.status === 'ABSENT' && <div className="w-1 h-1 rounded-full bg-red-500 mt-0.5" />}
              </div>
            )
          })}
        </div>
        <div className="flex gap-4 mt-3 flex-wrap text-xs">
          {[
            { color: 'bg-emerald-100 border-emerald-300', label: 'Present' },
            { color: 'bg-red-100 border-red-300', label: 'Absent' },
            { color: 'bg-muted', label: 'Weekend' },
            { color: 'bg-amber-100', label: 'Half Day' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <div className={`w-3 h-3 rounded ${item.color}`} />
              <span className="text-muted-foreground">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attendance"
        description={isPriv ? 'Track employee attendance records' : 'Your attendance for April–May 2025'}
      >
        {isPriv && (
          <Select value={selectedEmpId} onChange={(e) => setSelectedEmpId(e.target.value)} className="w-52">
            {DEMO_EMPLOYEES.map((e) => (
              <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>
            ))}
          </Select>
        )}
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Present Days', value: presentCount(attendance), icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Absent Days', value: absentCount(attendance), icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Working Days', value: workingDays(attendance), icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Attendance %', value: `${overallPct}%`, icon: AlertCircle, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="stat-card flex items-center gap-3">
              <div className={`${s.bg} ${s.color} p-2.5 rounded-xl`}><Icon className="h-5 w-5" /></div>
              <div>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Attendance rate bar */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Avatar name={selectedEmp ? `${selectedEmp.firstName} ${selectedEmp.lastName}` : ''} src={selectedEmp?.avatar} size="sm" />
              <div>
                <p className="text-sm font-semibold">{selectedEmp ? `${selectedEmp.firstName} ${selectedEmp.lastName}` : 'Employee'}</p>
                <p className="text-xs text-muted-foreground">{selectedEmp?.department}</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-2xl font-bold ${overallPct >= 90 ? 'text-emerald-600' : overallPct >= 75 ? 'text-amber-600' : 'text-red-600'}`}>
                {overallPct}%
              </p>
              <p className="text-xs text-muted-foreground">Overall Rate</p>
            </div>
          </div>
          <Progress
            value={overallPct}
            color={overallPct >= 90 ? '#10b981' : overallPct >= 75 ? '#f59e0b' : '#ef4444'}
            className="h-3"
          />
        </CardContent>
      </Card>

      {/* Charts + Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Weekly Attendance Trend</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklyData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="week" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="present" fill="#10b981" radius={[4, 4, 0, 0]} name="Present" />
                <Bar dataKey="absent" fill="#ef4444" radius={[4, 4, 0, 0]} name="Absent" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Today's Team Overview</CardTitle></CardHeader>
          <CardContent>
            {DEMO_EMPLOYEES.slice(0, 6).map((emp) => {
              const pct = Math.floor(80 + Math.random() * 20)
              return (
                <div key={emp.id} className="flex items-center gap-3 py-2">
                  <Avatar name={`${emp.firstName} ${emp.lastName}`} src={emp.avatar} size="xs" />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="truncate font-medium">{emp.firstName} {emp.lastName}</span>
                      <span className="text-muted-foreground ml-2">{pct}%</span>
                    </div>
                    <Progress value={pct} color={pct >= 90 ? '#10b981' : pct >= 75 ? '#f59e0b' : '#ef4444'} />
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>

      {/* Calendar tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Attendance Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="may">
            <TabsList>
              <TabsTrigger value="may">May 2025</TabsTrigger>
              <TabsTrigger value="apr">April 2025</TabsTrigger>
            </TabsList>
            <TabsContent value="may">
              <CalendarGrid records={mayAttendance} />
            </TabsContent>
            <TabsContent value="apr">
              <CalendarGrid records={aprAttendance} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
