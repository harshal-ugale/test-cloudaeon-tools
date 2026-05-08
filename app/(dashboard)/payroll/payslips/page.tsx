'use client'

import { useMemo, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { isPrivileged } from '@/lib/auth'
import { DEMO_EMPLOYEES, DEMO_PAYSLIPS } from '@/lib/mock-data'
import { formatCurrency, formatDate, getMonthName } from '@/lib/utils'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Select } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { PageHeader } from '@/components/layout/DashboardShell'
import type { Payslip } from '@/lib/types'
import { CreditCard, Eye } from 'lucide-react'
import { PayslipDownloadButton } from '@/components/payroll/PayslipDownloadButton'

export default function PayslipsPage() {
  const { user } = useAuth()
  const isPriv = isPrivileged(user?.role ?? 'EMPLOYEE')

  const [monthFilter, setMonthFilter] = useState('5')
  const [yearFilter, setYearFilter] = useState('2025')
  const [selectedSlip, setSelectedSlip] = useState<Payslip | null>(null)

  const payslips = useMemo(() => {
    let list = DEMO_PAYSLIPS
    if (!isPriv) list = list.filter((p) => p.employeeId === user?.employeeId)
    if (monthFilter) list = list.filter((p) => p.month === parseInt(monthFilter))
    if (yearFilter) list = list.filter((p) => p.year === parseInt(yearFilter))
    return list.sort((a, b) => b.month - a.month)
  }, [isPriv, user, monthFilter, yearFilter])

  return (
    <div className="space-y-6">
      <PageHeader
        title={isPriv ? 'All Payslips' : 'My Payslips'}
        description="Monthly salary statements"
      />

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <Select value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)} className="w-36">
          <option value="">All Months</option>
          {[1, 2, 3, 4, 5].map((m) => (
            <option key={m} value={String(m)}>{getMonthName(m)}</option>
          ))}
        </Select>
        <Select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)} className="w-28">
          <option value="2025">2025</option>
          <option value="2024">2024</option>
        </Select>
        <span className="self-center text-sm text-muted-foreground">{payslips.length} payslips found</span>
      </div>

      {/* Payslip grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {payslips.map((p) => {
          const emp = DEMO_EMPLOYEES.find((e) => e.id === p.employeeId)
          const period = `${getMonthName(p.month)} ${p.year}`
          return (
            <Card key={p.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedSlip(p)}>
              <CardContent className="pt-4">
                {isPriv && emp && (
                  <div className="flex items-center gap-2 mb-3 pb-3 border-b border-border">
                    <Avatar name={`${emp.firstName} ${emp.lastName}`} src={emp.avatar} size="sm" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{emp.firstName} {emp.lastName}</p>
                      <p className="text-xs text-muted-foreground truncate">{emp.department}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{period}</p>
                    <p className="text-2xl font-bold text-emerald-600 mt-1">{formatCurrency(p.netPay)}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Net Pay</p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-semibold ${p.paidOn ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {p.paidOn ? 'PAID' : 'PENDING'}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Gross</span>
                    <span className="font-medium">{formatCurrency(p.grossPay)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">PF</span>
                    <span className="font-medium text-red-500">-{formatCurrency(p.pf)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax</span>
                    <span className="font-medium text-red-500">-{formatCurrency(p.tax)}</span>
                  </div>
                  {p.paidOn && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Paid on</span>
                      <span className="font-medium">{formatDate(p.paidOn)}</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 mt-3">
                  <Button variant="outline" size="sm" className="flex-1 gap-1 text-xs" onClick={(e) => { e.stopPropagation(); setSelectedSlip(p) }}>
                    <Eye className="h-3 w-3" /> View
                  </Button>
                  <div onClick={(e) => e.stopPropagation()}>
                    <PayslipDownloadButton payslip={p} variant="ghost" size="sm" />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {payslips.length === 0 && (
        <div className="text-center py-16">
          <CreditCard className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="font-medium text-foreground">No payslips found</p>
          <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
        </div>
      )}

      {/* Payslip detail dialog */}
      <Dialog open={!!selectedSlip} onClose={() => setSelectedSlip(null)} className="max-w-md">
        {selectedSlip && (() => {
          const emp = DEMO_EMPLOYEES.find((e) => e.id === selectedSlip.employeeId)
          const period = `${getMonthName(selectedSlip.month)} ${selectedSlip.year}`
          return (
            <>
              <DialogHeader onClose={() => setSelectedSlip(null)}>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <div>
                    <DialogTitle>Payslip — {period}</DialogTitle>
                    <p className="text-sm text-muted-foreground mt-0.5">{selectedSlip.employeeName}</p>
                  </div>
                </div>
              </DialogHeader>
              <DialogContent className="space-y-4">
                {emp && (
                  <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <Avatar name={`${emp.firstName} ${emp.lastName}`} src={emp.avatar} size="md" />
                    <div>
                      <p className="font-semibold">{emp.firstName} {emp.lastName}</p>
                      <p className="text-sm text-muted-foreground">{emp.jobTitle} · {emp.department}</p>
                      <p className="text-xs text-muted-foreground">{emp.employeeCode}</p>
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Earnings</p>
                  {[
                    { label: 'Basic Salary', value: selectedSlip.basicSalary },
                    { label: 'HRA', value: selectedSlip.hra },
                    { label: 'Transport Allowance', value: selectedSlip.transport },
                  ].map((item) => (
                    <div key={item.label} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className="font-medium text-emerald-600">{formatCurrency(item.value)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-sm font-semibold border-t border-border pt-2">
                    <span>Gross Pay</span>
                    <span>{formatCurrency(selectedSlip.grossPay)}</span>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Deductions</p>
                  {[
                    { label: 'Provident Fund (PF)', value: selectedSlip.pf },
                    { label: 'Income Tax', value: selectedSlip.tax },
                  ].map((item) => (
                    <div key={item.label} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className="font-medium text-red-500">-{formatCurrency(item.value)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-sm font-semibold border-t border-border pt-2">
                    <span>Total Deductions</span>
                    <span className="text-red-500">-{formatCurrency(selectedSlip.deductions)}</span>
                  </div>
                </div>
                <Separator />
                <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg">
                  <span className="font-bold text-foreground">Net Take-Home</span>
                  <span className="text-xl font-bold text-emerald-600">{formatCurrency(selectedSlip.netPay)}</span>
                </div>
                {selectedSlip.paidOn && (
                  <p className="text-xs text-center text-muted-foreground">
                    Paid on {formatDate(selectedSlip.paidOn)}
                  </p>
                )}
              </DialogContent>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedSlip(null)}>Close</Button>
                <PayslipDownloadButton payslip={selectedSlip} variant="default" size="default" showLabel />
              </DialogFooter>
            </>
          )
        })()}
      </Dialog>
    </div>
  )
}
