import { NextRequest, NextResponse } from 'next/server'
import { DEMO_TIMESHEETS } from '@/lib/mock-data'
import { canSubmit } from '@/lib/timesheet-utils'

function requireAuth(req: NextRequest) {
  const role = req.headers.get('x-demo-role')
  const empId = req.headers.get('x-demo-emp-id')
  if (!role || !empId) return null
  return { role, empId }
}

/** PATCH /api/timesheets/:id/submit — move DRAFT → SUBMITTED within grace period. */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = requireAuth(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const ts = DEMO_TIMESHEETS.find((t) => t.id === id)
  if (!ts) return NextResponse.json({ error: 'Timesheet not found' }, { status: 404 })
  if (ts.employeeId !== session.empId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  if (ts.status !== 'DRAFT') {
    return NextResponse.json({ error: 'Only DRAFT timesheets can be submitted' }, { status: 409 })
  }
  if (!canSubmit(ts.periodEnd)) {
    return NextResponse.json({ error: 'Submission deadline has passed (period end + 2 days)' }, { status: 422 })
  }

  const now = new Date().toISOString()
  ts.status = 'SUBMITTED'
  ts.submittedAt = now
  ts.updatedAt = now

  return NextResponse.json({ timesheet: ts })
}
