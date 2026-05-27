import { NextRequest, NextResponse } from 'next/server'
import { DEMO_TIMESHEETS } from '@/lib/mock-data'

function requireAuth(req: NextRequest) {
  const role = req.headers.get('x-demo-role')
  const empId = req.headers.get('x-demo-emp-id')
  if (!role || !empId) return null
  return { role, empId }
}

const PRIVILEGED = new Set(['SUPER_ADMIN', 'ADMIN', 'HR'])

/** GET /api/timesheets/hr/all — all employee timesheets with optional filters. */
export async function GET(req: NextRequest) {
  const session = requireAuth(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!PRIVILEGED.has(session.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const employeeId = searchParams.get('employeeId')
  const fromDate = searchParams.get('from')
  const toDate = searchParams.get('to')

  let timesheets = [...DEMO_TIMESHEETS]

  if (status && status !== 'ALL') timesheets = timesheets.filter((t) => t.status === status)
  if (employeeId) timesheets = timesheets.filter((t) => t.employeeId === employeeId)
  if (fromDate) timesheets = timesheets.filter((t) => t.periodStart >= fromDate)
  if (toDate) timesheets = timesheets.filter((t) => t.periodEnd <= toDate)

  timesheets = timesheets.sort((a, b) => b.periodStart.localeCompare(a.periodStart))

  return NextResponse.json({ timesheets, total: timesheets.length })
}
