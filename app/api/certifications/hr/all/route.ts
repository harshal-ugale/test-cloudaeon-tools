import { NextRequest, NextResponse } from 'next/server'
import { DEMO_CERTIFICATIONS } from '@/lib/mock-data'

function requireAuth(req: NextRequest) {
  const role = req.headers.get('x-demo-role')
  const empId = req.headers.get('x-demo-emp-id')
  if (!role || !empId) return null
  return { role, empId }
}

const PRIVILEGED = new Set(['SUPER_ADMIN', 'ADMIN', 'HR'])

/** GET /api/certifications/hr/all — all certifications across all employees. */
export async function GET(req: NextRequest) {
  const session = requireAuth(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!PRIVILEGED.has(session.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { searchParams } = new URL(req.url)
  const status     = searchParams.get('status')
  const employeeId = searchParams.get('employeeId')

  let certifications = [...DEMO_CERTIFICATIONS]
  if (status && status !== 'ALL') certifications = certifications.filter((c) => c.status === status)
  if (employeeId) certifications = certifications.filter((c) => c.employeeId === employeeId)

  certifications = certifications.sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt))

  return NextResponse.json({ certifications, total: certifications.length })
}
