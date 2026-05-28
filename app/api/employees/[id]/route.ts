import { NextRequest, NextResponse } from 'next/server'
import { DEMO_EMPLOYEES } from '@/lib/mock-data'
import { markDeleted, isDeleted } from '@/lib/employee-store'

function requireAuth(request: NextRequest): { role: string; empId: string } | null {
  const role  = request.headers.get('x-demo-role')
  const empId = request.headers.get('x-demo-emp-id')
  if (!role || !empId) return null
  return { role, empId }
}

/** Only HR and Founder (SUPER_ADMIN) can delete employees */
const DELETE_ROLES = new Set(['SUPER_ADMIN', 'HR'])

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  if (isDeleted(id)) {
    return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
  }
  const employee = DEMO_EMPLOYEES.find((e) => e.id === id)
  if (!employee) {
    return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
  }
  return NextResponse.json({ employee })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  if (isDeleted(id)) {
    return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
  }
  const employee = DEMO_EMPLOYEES.find((e) => e.id === id)
  if (!employee) {
    return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
  }
  const body = await request.json()
  const updated = { ...employee, ...body, updatedAt: new Date().toISOString() }
  return NextResponse.json({ employee: updated })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // ── Auth check ────────────────────────────────────────────────────────────
  const session = requireAuth(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // ── Role check: only HR or Founder can delete ─────────────────────────────
  if (!DELETE_ROLES.has(session.role)) {
    return NextResponse.json(
      { error: 'Forbidden — only HR or Founder can delete employee profiles.' },
      { status: 403 }
    )
  }

  const { id } = await params

  // ── Find employee ─────────────────────────────────────────────────────────
  if (isDeleted(id)) {
    return NextResponse.json({ error: 'Employee already deleted.' }, { status: 404 })
  }
  const employee = DEMO_EMPLOYEES.find((e) => e.id === id)
  if (!employee) {
    return NextResponse.json({ error: 'Employee not found.' }, { status: 404 })
  }

  // ── Prevent self-deletion ─────────────────────────────────────────────────
  if (id === session.empId) {
    return NextResponse.json(
      { error: 'You cannot delete your own profile.' },
      { status: 400 }
    )
  }

  // ── Persist deletion ──────────────────────────────────────────────────────
  markDeleted(id)

  return NextResponse.json(
    {
      message: `Employee "${employee.firstName} ${employee.lastName}" has been permanently removed.`,
      id,
    },
    { status: 200 }
  )
}
