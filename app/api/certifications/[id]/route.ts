import { NextRequest, NextResponse } from 'next/server'
import { DEMO_CERTIFICATIONS } from '@/lib/mock-data'

function requireAuth(req: NextRequest) {
  const role = req.headers.get('x-demo-role')
  const empId = req.headers.get('x-demo-emp-id')
  if (!role || !empId) return null
  return { role, empId }
}

const PRIVILEGED = new Set(['SUPER_ADMIN', 'ADMIN', 'HR'])

/** DELETE /api/certifications/[id] — employee deletes own PENDING_REVIEW cert; HR+ can delete any. */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = requireAuth(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const idx = DEMO_CERTIFICATIONS.findIndex((c) => c.id === id)
  if (idx === -1) return NextResponse.json({ error: 'Certification not found' }, { status: 404 })

  const cert = DEMO_CERTIFICATIONS[idx]

  if (!PRIVILEGED.has(session.role)) {
    if (cert.employeeId !== session.empId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    if (cert.status !== 'PENDING_REVIEW') return NextResponse.json({ error: 'Only pending certifications can be deleted' }, { status: 422 })
  }

  DEMO_CERTIFICATIONS.splice(idx, 1)

  return NextResponse.json({ success: true })
}
