import { NextRequest, NextResponse } from 'next/server'
import { DEMO_TIMESHEETS } from '@/lib/mock-data'

function requireAuth(req: NextRequest) {
  const role = req.headers.get('x-demo-role')
  const empId = req.headers.get('x-demo-emp-id')
  if (!role || !empId) return null
  return { role, empId }
}

/** POST /api/timesheets/:id/entries — upsert a daily entry in a DRAFT timesheet. */
export async function POST(
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
    return NextResponse.json({ error: 'Cannot edit a timesheet that is not in DRAFT status' }, { status: 409 })
  }

  const body = await req.json() as {
    date: string
    hoursWorked: number
    projectName: string
    description?: string
  }

  if (!body.date || body.hoursWorked === undefined || !body.projectName) {
    return NextResponse.json({ error: 'date, hoursWorked, and projectName are required' }, { status: 400 })
  }
  if (body.hoursWorked < 0 || body.hoursWorked > 24) {
    return NextResponse.json({ error: 'hoursWorked must be between 0 and 24' }, { status: 400 })
  }

  const entryId = `te-${id}-${body.date}`
  const existingIdx = ts.entries.findIndex((e) => e.date === body.date)

  const entry = {
    id: existingIdx >= 0 ? ts.entries[existingIdx].id : entryId,
    timesheetId: id,
    date: body.date,
    hoursWorked: body.hoursWorked,
    projectName: body.projectName,
    description: body.description,
  }

  if (existingIdx >= 0) {
    ts.entries[existingIdx] = entry
  } else {
    ts.entries.push(entry)
  }

  ts.totalHours = ts.entries.reduce((s, e) => s + e.hoursWorked, 0)
  ts.updatedAt = new Date().toISOString()

  return NextResponse.json({ entry, timesheet: ts })
}
