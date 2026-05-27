import { NextRequest, NextResponse } from 'next/server'
import { DEMO_TIMESHEETS } from '@/lib/mock-data'

function requireAuth(req: NextRequest) {
  const role = req.headers.get('x-demo-role')
  const empId = req.headers.get('x-demo-emp-id')
  if (!role || !empId) return null
  return { role, empId }
}

/** GET /api/timesheets — all timesheets for the logged-in employee, newest first. */
export async function GET(req: NextRequest) {
  const session = requireAuth(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const limit = Math.min(50, parseInt(searchParams.get('limit') ?? '20'))

  const all = DEMO_TIMESHEETS
    .filter((t) => t.employeeId === session.empId)
    .sort((a, b) => b.periodStart.localeCompare(a.periodStart))

  const total = all.length
  const timesheets = all.slice((page - 1) * limit, page * limit)

  return NextResponse.json({ timesheets, total, page, limit })
}
