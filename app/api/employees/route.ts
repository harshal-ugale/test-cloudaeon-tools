import { NextRequest, NextResponse } from 'next/server'
import { DEMO_EMPLOYEES } from '@/lib/mock-data'
import { getDeletedIds } from '@/lib/employee-store'

function requireAuth(request: NextRequest): { role: string; empId: string } | null {
  const role  = request.headers.get('x-demo-role')
  const empId = request.headers.get('x-demo-emp-id')
  if (!role || !empId) return null
  return { role, empId }
}

export async function GET(request: NextRequest) {
  const session = requireAuth(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const dept   = searchParams.get('department')
  const role   = searchParams.get('role')
  const status = searchParams.get('status')
  const search = searchParams.get('search')?.toLowerCase()

  // Filter out employees that have been deleted
  const deletedIds = getDeletedIds()
  let employees = DEMO_EMPLOYEES.filter((e) => !deletedIds.has(e.id))

  if (dept)   employees = employees.filter((e) => e.department === dept)
  if (role)   employees = employees.filter((e) => e.role === role)
  if (status) employees = employees.filter((e) => e.status === status)
  if (search) {
    employees = employees.filter(
      (e) =>
        `${e.firstName} ${e.lastName}`.toLowerCase().includes(search) ||
        e.email.toLowerCase().includes(search) ||
        e.employeeCode.toLowerCase().includes(search),
    )
  }

  return NextResponse.json({ employees, total: employees.length })
}

export async function POST(request: NextRequest) {
  const session = requireAuth(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const newEmployee = {
    id: `emp-${Date.now()}`,
    ...body,
    status: 'ACTIVE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  return NextResponse.json({ employee: newEmployee }, { status: 201 })
}
