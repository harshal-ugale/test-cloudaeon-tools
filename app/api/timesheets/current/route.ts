import { NextRequest, NextResponse } from 'next/server'
import { DEMO_TIMESHEETS, DEMO_EMPLOYEES } from '@/lib/mock-data'
import { getCurrentPeriod, toISODate, timesheetId } from '@/lib/timesheet-utils'

function requireAuth(req: NextRequest) {
  const role = req.headers.get('x-demo-role')
  const empId = req.headers.get('x-demo-emp-id')
  if (!role || !empId) return null
  return { role, empId }
}

/** GET /api/timesheets/current — current biweekly timesheet; auto-creates DRAFT if none. */
export async function GET(req: NextRequest) {
  const session = requireAuth(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { start, end } = getCurrentPeriod()
  const periodStart = toISODate(start)
  const periodEnd = toISODate(end)

  let timesheet = DEMO_TIMESHEETS.find(
    (t) => t.employeeId === session.empId && t.periodStart === periodStart,
  )

  if (!timesheet) {
    const emp = DEMO_EMPLOYEES.find((e) => e.id === session.empId)
    const now = new Date().toISOString()
    timesheet = {
      id: timesheetId(session.empId, start),
      employeeId: session.empId,
      employeeName: emp ? `${emp.firstName} ${emp.lastName}` : undefined,
      employeeAvatar: emp?.avatar,
      department: emp?.department,
      periodStart,
      periodEnd,
      status: 'DRAFT',
      entries: [],
      totalHours: 0,
      createdAt: now,
      updatedAt: now,
    }
    // Production: await prisma.timesheet.create(...)
    DEMO_TIMESHEETS.push(timesheet)
  }

  return NextResponse.json({ timesheet })
}
