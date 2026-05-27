import { NextRequest, NextResponse } from 'next/server'
import { DEMO_TIMESHEETS } from '@/lib/mock-data'

function requireAuth(req: NextRequest) {
  const role = req.headers.get('x-demo-role')
  const empId = req.headers.get('x-demo-emp-id')
  if (!role || !empId) return null
  return { role, empId }
}

const PRIVILEGED = new Set(['SUPER_ADMIN', 'ADMIN', 'HR'])

/** PATCH /api/timesheets/:id/review — HR: approve or reject a SUBMITTED timesheet. */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = requireAuth(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!PRIVILEGED.has(session.role)) {
    return NextResponse.json({ error: 'Forbidden — HR or higher role required' }, { status: 403 })
  }

  const { id } = await params
  const ts = DEMO_TIMESHEETS.find((t) => t.id === id)
  if (!ts) return NextResponse.json({ error: 'Timesheet not found' }, { status: 404 })
  if (ts.status !== 'SUBMITTED') {
    return NextResponse.json({ error: 'Only SUBMITTED timesheets can be reviewed' }, { status: 409 })
  }

  const body = await req.json() as {
    status: 'APPROVED' | 'REJECTED'
    reviewedBy: string
    remarks?: string
  }

  if (body.status !== 'APPROVED' && body.status !== 'REJECTED') {
    return NextResponse.json({ error: 'status must be APPROVED or REJECTED' }, { status: 400 })
  }

  const now = new Date().toISOString()
  ts.status = body.status
  ts.reviewedAt = now
  ts.reviewedBy = body.reviewedBy
  ts.remarks = body.remarks ?? undefined
  ts.updatedAt = now

  return NextResponse.json({ timesheet: ts })
}
