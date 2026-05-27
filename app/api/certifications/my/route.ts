import { NextRequest, NextResponse } from 'next/server'
import { DEMO_CERTIFICATIONS } from '@/lib/mock-data'

function requireAuth(req: NextRequest) {
  const role = req.headers.get('x-demo-role')
  const empId = req.headers.get('x-demo-emp-id')
  if (!role || !empId) return null
  return { role, empId }
}

/** GET /api/certifications/my — all certifications for the logged-in employee. */
export async function GET(req: NextRequest) {
  const session = requireAuth(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const certifications = DEMO_CERTIFICATIONS
    .filter((c) => c.employeeId === session.empId)
    .sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt))

  return NextResponse.json({ certifications, total: certifications.length })
}
