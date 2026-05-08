import { NextRequest, NextResponse } from 'next/server'
import { DEMO_EMPLOYEES } from '@/lib/mock-data'

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
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
  const employee = DEMO_EMPLOYEES.find((e) => e.id === id)
  if (!employee) {
    return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
  }
  const body = await request.json()
  const updated = { ...employee, ...body, updatedAt: new Date().toISOString() }
  return NextResponse.json({ employee: updated })
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const employee = DEMO_EMPLOYEES.find((e) => e.id === id)
  if (!employee) {
    return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
  }
  return NextResponse.json({ message: 'Employee terminated', id })
}
