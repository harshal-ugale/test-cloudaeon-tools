import { NextRequest, NextResponse } from 'next/server'
import { DEMO_EMPLOYEES, DEMO_LEAVES } from '@/lib/mock-data'
import { sendLeaveStatusEmail } from '@/lib/email'

/**
 * Auth guard — demo version.
 *
 * Production replacement (Clerk):
 *   import { auth } from '@clerk/nextjs/server'
 *   const { userId } = await auth()
 *   if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
 */
function requireAuth(request: NextRequest): { role: string; empId: string } | null {
  const role = request.headers.get('x-demo-role')
  const empId = request.headers.get('x-demo-emp-id')
  if (!role || !empId) return null
  return { role, empId }
}

const APPROVER_ROLES = new Set(['SUPER_ADMIN', 'ADMIN', 'HR', 'MANAGER'])

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = requireAuth(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!APPROVER_ROLES.has(session.role)) {
    return NextResponse.json({ error: 'Forbidden — insufficient role' }, { status: 403 })
  }

  const { id } = await params
  const leave = DEMO_LEAVES.find((l) => l.id === id)
  if (!leave) {
    return NextResponse.json({ error: 'Leave request not found' }, { status: 404 })
  }

  if (leave.status !== 'PENDING') {
    return NextResponse.json({ error: 'Leave is already actioned' }, { status: 409 })
  }

  const body = await request.json() as {
    status: 'APPROVED' | 'REJECTED'
    notes?: string
    approverName: string
  }

  if (body.status !== 'APPROVED' && body.status !== 'REJECTED') {
    return NextResponse.json({ error: 'status must be APPROVED or REJECTED' }, { status: 400 })
  }

  // Build the updated leave record (in production this would be prisma.leave.update)
  const updated = {
    ...leave,
    status: body.status,
    notes: body.notes ?? null,
    approverId: session.empId,
    approverName: body.approverName,
    approvedAt: new Date().toISOString().split('T')[0],
  }

  // Look up the employee's email to send the notification
  const employee = DEMO_EMPLOYEES.find((e) => e.id === leave.employeeId)

  // Fire-and-forget email — we don't block the response on this
  if (employee) {
    sendLeaveStatusEmail({
      to: employee.email,
      employeeName: leave.employeeName,
      leaveType: leave.type,
      startDate: leave.startDate,
      endDate: leave.endDate,
      days: leave.days,
      status: body.status,
      approverName: body.approverName,
      note: body.notes,
    }).catch((err) => console.error('[CEMT Email] Failed to send:', err))
  }

  return NextResponse.json({ leave: updated })
}
