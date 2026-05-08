'use client'

import type { Payslip } from '@/lib/types'
import { formatCurrency, formatDate, getMonthName } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

export function PayslipCard({ payslip, onClick }: { payslip: Payslip; onClick?: () => void }) {
  const period = `${getMonthName(payslip.month)} ${payslip.year}`

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={onClick}>
      <CardContent className="pt-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{period}</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{formatCurrency(payslip.netPay)}</p>
            <p className="text-xs text-muted-foreground">Net Pay</p>
          </div>
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${payslip.paidOn ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
            {payslip.paidOn ? 'PAID' : 'PENDING'}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
          <div className="flex justify-between"><span className="text-muted-foreground">Gross</span><span>{formatCurrency(payslip.grossPay)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Deductions</span><span className="text-red-500">-{formatCurrency(payslip.deductions)}</span></div>
        </div>
        {payslip.paidOn && (
          <p className="text-xs text-muted-foreground mt-2">Paid: {formatDate(payslip.paidOn)}</p>
        )}
      </CardContent>
    </Card>
  )
}
