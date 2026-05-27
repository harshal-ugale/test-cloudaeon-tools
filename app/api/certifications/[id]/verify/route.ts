import { NextRequest, NextResponse } from 'next/server'
import { DEMO_CERTIFICATIONS } from '@/lib/mock-data'

function requireAuth(req: NextRequest) {
  const role = req.headers.get('x-demo-role')
  const empId = req.headers.get('x-demo-emp-id')
  if (!role || !empId) return null
  return { role, empId }
}

const PRIVILEGED = new Set(['SUPER_ADMIN', 'ADMIN', 'HR'])

/** PATCH /api/certifications/[id]/verify — HR+ marks cert VERIFIED or REJECTED with optional remarks. */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = requireAuth(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!PRIVILEGED.has(session.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const cert = DEMO_CERTIFICATIONS.find((c) => c.id === id)
  if (!cert) return NextResponse.json({ error: 'Certification not found' }, { status: 404 })

  let body: { status: string; remarks?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { status, remarks } = body
  if (status !== 'VERIFIED' && status !== 'REJECTED') {
    return NextResponse.json({ error: 'status must be VERIFIED or REJECTED' }, { status: 400 })
  }

  const now = new Date().toISOString()
  cert.status = status as 'VERIFIED' | 'REJECTED'
  cert.verifiedAt = now
  cert.verifiedBy = session.empId
  cert.remarks = remarks || undefined
  cert.updatedAt = now

  return NextResponse.json({ certification: cert })
}
