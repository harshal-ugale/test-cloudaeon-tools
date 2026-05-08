import { NextRequest, NextResponse } from 'next/server'
import { DEMO_LEAVES } from '@/lib/mock-data'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')
  const employeeId = searchParams.get('employeeId')
  const type = searchParams.get('type')

  let leaves = [...DEMO_LEAVES]

  if (status) leaves = leaves.filter((l) => l.status === status)
  if (employeeId) leaves = leaves.filter((l) => l.employeeId === employeeId)
  if (type) leaves = leaves.filter((l) => l.type === type)

  return NextResponse.json({ leaves, total: leaves.length })
}

export async function POST(request: NextRequest) {
  const body = await request.json()

  const newLeave = {
    id: `lv-${Date.now()}`,
    ...body,
    status: 'PENDING',
    createdAt: new Date().toISOString(),
  }

  return NextResponse.json({ leave: newLeave }, { status: 201 })
}

export async function PATCH(request: NextRequest) {
  const body = await request.json()
  const { leaveId, status, notes, approverId } = body

  const leave = DEMO_LEAVES.find((l) => l.id === leaveId)
  if (!leave) {
    return NextResponse.json({ error: 'Leave not found' }, { status: 404 })
  }

  const updated = {
    ...leave,
    status,
    notes,
    approverId,
    approvedAt: new Date().toISOString(),
  }

  return NextResponse.json({ leave: updated })
}
