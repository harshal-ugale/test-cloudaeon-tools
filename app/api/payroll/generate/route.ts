import { NextRequest, NextResponse } from 'next/server'
import { DEMO_EMPLOYEES, DEMO_PAYSLIPS } from '@/lib/mock-data'

function requireAuth(request: NextRequest): { role: string; empId: string } | null {
  const role = request.headers.get('x-demo-role')
  const empId = request.headers.get('x-demo-emp-id')
  if (!role || !empId) return null
  return { role, empId }
}

const PRIVILEGED = new Set(['SUPER_ADMIN', 'ADMIN', 'HR'])

export async function POST(request: NextRequest) {
  const session = requireAuth(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!PRIVILEGED.has(session.role)) {
    return NextResponse.json({ error: 'Forbidden — HR or higher role required' }, { status: 403 })
  }

  const body = await request.json() as { month: number; year: number }
  const { month, year } = body

  if (!month || !year || month < 1 || month > 12) {
    return NextResponse.json({ error: 'Valid month (1-12) and year are required' }, { status: 400 })
  }

  const payslips = DEMO_EMPLOYEES.map((emp) => {
    const grossPay = emp.basicSalary + emp.hra + emp.transport
    const pf = Math.round(emp.basicSalary * 0.12)
    const tax = Math.round(((grossPay - pf) * emp.taxSlab) / 100)
    const deductions = pf + tax
    const netPay = grossPay - deductions

    return {
      id: `ps-${emp.id}-${year}-${month}`,
      employeeId: emp.id,
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
  })

  // Demo: upsert into in-memory store (production: prisma.payslip.createMany)
  payslips.forEach((ps) => {
    const idx = DEMO_PAYSLIPS.findIndex((p) => p.id === ps.id)
    if (idx >= 0) {
      DEMO_PAYSLIPS[idx] = ps
    } else {
      DEMO_PAYSLIPS.push(ps)
    }
  })

  const totalNetPay = payslips.reduce((s, p) => s + p.netPay, 0)
  const totalGross = payslips.reduce((s, p) => s + p.grossPay, 0)

  return NextResponse.json({ payslips, count: payslips.length, month, year, totalNetPay, totalGross })
}
