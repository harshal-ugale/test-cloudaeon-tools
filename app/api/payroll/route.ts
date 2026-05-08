import { NextRequest, NextResponse } from 'next/server'
import { DEMO_PAYSLIPS, DEMO_EMPLOYEES } from '@/lib/mock-data'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const month = searchParams.get('month')
  const year = searchParams.get('year')
  const employeeId = searchParams.get('employeeId')

  let payslips = [...DEMO_PAYSLIPS]

  if (month) payslips = payslips.filter((p) => p.month === parseInt(month))
  if (year) payslips = payslips.filter((p) => p.year === parseInt(year))
  if (employeeId) payslips = payslips.filter((p) => p.employeeId === employeeId)

  const total = payslips.reduce((s, p) => s + p.netPay, 0)
  const totalGross = payslips.reduce((s, p) => s + p.grossPay, 0)
  const totalDeductions = payslips.reduce((s, p) => s + p.deductions, 0)

  return NextResponse.json({ payslips, total, totalGross, totalDeductions, count: payslips.length })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { employeeId, month, year } = body

  const emp = DEMO_EMPLOYEES.find((e) => e.id === employeeId)
  if (!emp) {
    return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
  }

  const grossPay = emp.basicSalary + emp.hra + emp.transport
  const pf = Math.round(emp.basicSalary * 0.12)
  const tax = Math.round(((grossPay - pf) * emp.taxSlab) / 100)
  const deductions = pf + tax
  const netPay = grossPay - deductions

  const payslip = {
    id: `ps-${employeeId}-${year}-${month}`,
    employeeId,
    employeeName: `${emp.firstName} ${emp.lastName}`,
    month,
    year,
    basicSalary: emp.basicSalary,
    hra: emp.hra,
    transport: emp.transport,
    grossPay,
    pf,
    tax,
    deductions,
    netPay,
    createdAt: new Date().toISOString(),
  }

  return NextResponse.json({ payslip }, { status: 201 })
}
