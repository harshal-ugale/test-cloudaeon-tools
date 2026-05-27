import { NextRequest, NextResponse } from 'next/server'
import { DEMO_CERTIFICATIONS, DEMO_EMPLOYEES } from '@/lib/mock-data'

function requireAuth(req: NextRequest) {
  const role = req.headers.get('x-demo-role')
  const empId = req.headers.get('x-demo-emp-id')
  if (!role || !empId) return null
  return { role, empId }
}

const PRIVILEGED = new Set(['SUPER_ADMIN', 'ADMIN', 'HR'])

/** GET /api/certifications/hr/summary — per-employee cert counts by status. */
export async function GET(req: NextRequest) {
  const session = requireAuth(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!PRIVILEGED.has(session.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const byEmployee: Record<string, { total: number; verified: number; pending: number; rejected: number }> = {}

  DEMO_CERTIFICATIONS.forEach((c) => {
    if (!byEmployee[c.employeeId]) {
      byEmployee[c.employeeId] = { total: 0, verified: 0, pending: 0, rejected: 0 }
    }
    byEmployee[c.employeeId].total++
    if (c.status === 'VERIFIED')      byEmployee[c.employeeId].verified++
    if (c.status === 'PENDING_REVIEW') byEmployee[c.employeeId].pending++
    if (c.status === 'REJECTED')      byEmployee[c.employeeId].rejected++
  })

  const summary = Object.entries(byEmployee).map(([employeeId, counts]) => {
    const emp = DEMO_EMPLOYEES.find((e) => e.id === employeeId)
    return {
      employeeId,
      employeeName:   emp ? `${emp.firstName} ${emp.lastName}` : employeeId,
      employeeAvatar: emp?.avatar,
      department:     emp?.department,
      ...counts,
    }
  })

  return NextResponse.json({ summary })
}
