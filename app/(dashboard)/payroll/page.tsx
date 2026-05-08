'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { isPrivileged } from '@/lib/auth'
import { DEMO_EMPLOYEES, DEMO_PAYSLIPS } from '@/lib/mock-data'
import { formatCurrency, getMonthName } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Avatar } from '@/components/ui/avatar'
import { PageHeader } from '@/components/layout/DashboardShell'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { CreditCard, TrendingUp, ArrowRight, DollarSign, Zap, CheckCircle2 } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend,
} from 'recharts'

const CURRENT_YEAR = 2025

export default function PayrollPage() {
  const { user } = useAuth()
  const isPriv = isPrivileged(user?.role ?? 'EMPLOYEE')

  const [selectedMonth, setSelectedMonth] = useState(5)
  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR)
  const [generating, setGenerating] = useState(false)
  const [generated, setGenerated] = useState<{ count: number; totalNetPay: number } | null>(null)
  const [generateError, setGenerateError] = useState('')

  const payslipData = useMemo(() => {
    const monthlyPayslips = DEMO_PAYSLIPS.filter(
      (p) => p.month === selectedMonth && p.year === selectedYear,
    )
    if (!isPriv) {
      const mySlip = monthlyPayslips.find((p) => p.employeeId === user?.employeeId)
      return mySlip ? [mySlip] : []
    }
    return monthlyPayslips
  }, [isPriv, user, selectedMonth, selectedYear])

  const totalPayroll = payslipData.reduce((s, p) => s + p.netPay, 0)
  const totalGross = payslipData.reduce((s, p) => s + p.grossPay, 0)
  const totalDeductions = payslipData.reduce((s, p) => s + p.deductions, 0)

  const monthlyTrend = useMemo(() => {
    return [1, 2, 3, 4, 5].map((month) => {
      const slips = DEMO_PAYSLIPS.filter((p) => {
        if (!isPriv && p.employeeId !== user?.employeeId) return false
        return p.month === month && p.year === selectedYear
      })
      return {
        month: getMonthName(month).slice(0, 3),
        netPay: slips.reduce((s, p) => s + p.netPay, 0),
        grossPay: slips.reduce((s, p) => s + p.grossPay, 0),
      }
    })
  }, [isPriv, user, selectedYear])

  const deptBreakdown = useMemo(() => {
    if (!isPriv) return []
    const departments: Record<string, number> = {}
    payslipData.forEach((p) => {
      const emp = DEMO_EMPLOYEES.find((e) => e.id === p.employeeId)
      if (emp) {
        departments[emp.department] = (departments[emp.department] || 0) + p.netPay
      }
    })
    return Object.entries(departments)
      .map(([dept, total]) => ({ dept: dept.slice(0, 6), total }))
      .sort((a, b) => b.total - a.total)
  }, [isPriv, payslipData])

  async function handleGenerate() {
    setGenerating(true)
    setGenerated(null)
    setGenerateError('')
    try {
      const res = await fetch('/api/payroll/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-demo-role': user?.role ?? '',
          'x-demo-emp-id': user?.employeeId ?? '',
        },
        body: JSON.stringify({ month: selectedMonth, year: selectedYear }),
      })
      if (!res.ok) throw new Error(await res.text())
      const data = await res.json()
      setGenerated({ count: data.count, totalNetPay: data.totalNetPay })
    } catch {
      setGenerateError('Failed to generate payslips. Please try again.')
    } finally {
      setGenerating(false)
    }
  }

  const periodLabel = `${getMonthName(selectedMonth)} ${selectedYear}`

  return (
    <div className="space-y-6">
      <PageHeader
        title={isPriv ? `Payroll — ${periodLabel}` : `My Payroll — ${periodLabel}`}
        description={isPriv ? 'Monthly payroll summary across all employees' : 'Your salary breakdown for this month'}
      >
        <Link href="/payroll/payslips">
          <Button variant="outline" size="sm" className="gap-2">
            <CreditCard className="h-4 w-4" />
            {isPriv ? 'All Payslips' : 'My Payslips'}
          </Button>
        </Link>
      </PageHeader>

      {/* Month/Year selector + Generate button */}
      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={String(selectedMonth)}
          onChange={(e) => { setSelectedMonth(Number(e.target.value)); setGenerated(null) }}
          className="w-36"
        >
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
            <option key={m} value={m}>{getMonthName(m)}</option>
          ))}
        </Select>
        <Select
          value={String(selectedYear)}
          onChange={(e) => { setSelectedYear(Number(e.target.value)); setGenerated(null) }}
          className="w-28"
        >
          {[2024, 2025, 2026].map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </Select>

        {isPriv && (
          <Button
            onClick={handleGenerate}
            disabled={generating}
            className="gap-2"
            size="sm"
          >
            <Zap className="h-4 w-4" />
            {generating ? 'Generating…' : 'Generate Payslips'}
          </Button>
        )}
      </div>

      {/* Generate result banner */}
      {generated && (
        <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-800">
          <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-600" />
          <span>
            Generated <strong>{generated.count}</strong> payslips for {periodLabel}.
            Total net payroll: <strong>{formatCurrency(generated.totalNetPay)}</strong>
          </span>
        </div>
      )}
      {generateError && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
          {generateError}
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: isPriv ? 'Total Payroll' : 'My Gross Pay',
            value: isPriv ? totalPayroll : payslipData[0]?.grossPay ?? 0,
            icon: CreditCard,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
          },
          {
            label: isPriv ? 'Total Gross' : 'Total Deductions',
            value: isPriv ? totalGross : payslipData[0]?.deductions ?? 0,
            icon: DollarSign,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
          },
          {
            label: isPriv ? 'Total Deductions' : 'Net Take-Home',
            value: isPriv ? totalDeductions : payslipData[0]?.netPay ?? 0,
            icon: TrendingUp,
            color: 'text-purple-600',
            bg: 'bg-purple-50',
          },
        ].map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="stat-card flex items-center gap-4">
              <div className={`${s.bg} ${s.color} p-3 rounded-xl`}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{s.label}</p>
                <p className="text-2xl font-bold text-foreground mt-1">{formatCurrency(s.value)}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Payroll Trend (Jan–May {selectedYear})</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={monthlyTrend} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(v: number) => formatCurrency(v)}
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="netPay" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} name="Net Pay" />
                <Line type="monotone" dataKey="grossPay" stroke="#3b82f6" strokeWidth={2} strokeDasharray="4 2" dot={{ r: 3 }} name="Gross Pay" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {isPriv ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Payroll by Department</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={deptBreakdown} layout="vertical" margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                  />
                  <YAxis
                    type="category"
                    dataKey="dept"
                    tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                    width={50}
                  />
                  <Tooltip
                    formatter={(v: number) => formatCurrency(v)}
                    contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }}
                  />
                  <Bar dataKey="total" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="Net Payroll" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">My Salary Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {payslipData[0] && (() => {
                const p = payslipData[0]
                const items = [
                  { label: 'Basic Salary', value: p.basicSalary, type: 'earn' as const },
                  { label: 'HRA', value: p.hra, type: 'earn' as const },
                  { label: 'Transport', value: p.transport, type: 'earn' as const },
                  { label: 'Gross Pay', value: p.grossPay, type: 'total' as const },
                  { label: 'PF (12% of Basic)', value: -p.pf, type: 'deduct' as const },
                  { label: 'Income Tax', value: -p.tax, type: 'deduct' as const },
                  { label: 'Net Pay', value: p.netPay, type: 'net' as const },
                ]
                return items.map((item) => (
                  <div
                    key={item.label}
                    className={`flex justify-between items-center ${item.type === 'total' || item.type === 'net' ? 'border-t border-border pt-2' : ''}`}
                  >
                    <span className={`text-sm ${item.type === 'net' ? 'font-bold' : 'text-muted-foreground'}`}>
                      {item.label}
                    </span>
                    <span className={`text-sm font-semibold ${
                      item.type === 'earn' ? 'text-emerald-600' :
                      item.type === 'deduct' ? 'text-red-500' :
                      item.type === 'net' ? 'text-emerald-700 text-base' : 'text-foreground'
                    }`}>
                      {item.value < 0 ? `-${formatCurrency(-item.value)}` : formatCurrency(item.value)}
                    </span>
                  </div>
                ))
              })()}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Employee payroll table (HR/Founder only) */}
      {isPriv && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Employee Payroll — {periodLabel}</CardTitle>
              <Link href="/payroll/payslips">
                <Button variant="ghost" size="sm" className="gap-1 text-xs">
                  All Payslips <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {payslipData.length === 0 ? (
              <div className="text-center py-10 text-sm text-muted-foreground">
                No payslips for {periodLabel}. Click "Generate Payslips" to create them.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Gross Pay</TableHead>
                    <TableHead>Deductions</TableHead>
                    <TableHead>Net Pay</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payslipData.map((p) => {
                    const emp = DEMO_EMPLOYEES.find((e) => e.id === p.employeeId)
                    return (
                      <TableRow key={p.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar
                              name={emp ? `${emp.firstName} ${emp.lastName}` : p.employeeName}
                              src={emp?.avatar}
                              size="xs"
                            />
                            <span className="text-sm font-medium">{p.employeeName}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{formatCurrency(p.grossPay)}</TableCell>
                        <TableCell className="text-sm text-red-600">-{formatCurrency(p.deductions)}</TableCell>
                        <TableCell className="text-sm font-semibold text-emerald-600">{formatCurrency(p.netPay)}</TableCell>
                        <TableCell>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${p.paidOn ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                            {p.paidOn ? 'PAID' : 'PENDING'}
                          </span>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
