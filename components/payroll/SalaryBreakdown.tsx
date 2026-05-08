'use client'

import type { Payslip } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'

export function SalaryBreakdown({ payslip }: { payslip: Payslip }) {
  const items = [
    { label: 'Basic Salary', value: payslip.basicSalary, type: 'earn' as const },
    { label: 'HRA', value: payslip.hra, type: 'earn' as const },
    { label: 'Transport', value: payslip.transport, type: 'earn' as const },
    { label: 'Gross Pay', value: payslip.grossPay, type: 'total' as const },
    { label: 'PF', value: -payslip.pf, type: 'deduct' as const },
    { label: 'Income Tax', value: -payslip.tax, type: 'deduct' as const },
    { label: 'Net Pay', value: payslip.netPay, type: 'net' as const },
  ]

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className={`flex justify-between text-sm ${item.type === 'total' || item.type === 'net' ? 'font-semibold pt-2 border-t border-border' : ''}`}>
          <span className={item.type === 'net' ? 'font-bold' : 'text-muted-foreground'}>{item.label}</span>
          <span className={`font-medium ${
            item.type === 'earn' ? 'text-emerald-600' :
            item.type === 'deduct' ? 'text-red-500' :
            item.type === 'net' ? 'text-emerald-700 text-base font-bold' : 'text-foreground'
          }`}>
            {item.value < 0 ? `-${formatCurrency(-item.value)}` : formatCurrency(item.value)}
          </span>
        </div>
      ))}
    </div>
  )
}
