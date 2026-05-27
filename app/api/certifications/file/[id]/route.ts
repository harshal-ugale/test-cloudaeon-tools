import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'
import { DEMO_CERTIFICATIONS } from '@/lib/mock-data'

function requireAuth(req: NextRequest) {
  const role = req.headers.get('x-demo-role')
  const empId = req.headers.get('x-demo-emp-id')
  if (!role || !empId) return null
  return { role, empId }
}

const PRIVILEGED = new Set(['SUPER_ADMIN', 'ADMIN', 'HR'])

/** GET /api/certifications/file/[id] — serve uploaded file; accessible to owner or HR+. */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = requireAuth(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const cert = DEMO_CERTIFICATIONS.find((c) => c.id === id)
  if (!cert) return NextResponse.json({ error: 'Certification not found' }, { status: 404 })

  if (!PRIVILEGED.has(session.role) && cert.employeeId !== session.empId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (!cert.fileUrl) {
    return NextResponse.json({ error: 'File not available for demo data' }, { status: 404 })
  }

  // Path-traversal guard: ensure file is within the uploads directory
  const uploadsRoot = path.join(process.cwd(), 'uploads')
  const resolved = path.resolve(cert.fileUrl)
  if (!resolved.startsWith(uploadsRoot)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let buffer: Buffer
  try {
    buffer = await readFile(resolved)
  } catch {
    return NextResponse.json({ error: 'File not found on disk' }, { status: 404 })
  }

  // ?mode=download forces browser save-as dialog; default is inline (view in tab)
  const mode = req.nextUrl.searchParams.get('mode')
  const disposition = mode === 'download' ? 'attachment' : 'inline'

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': cert.mimeType,
      'Content-Disposition': `${disposition}; filename="${cert.fileName}"`,
    },
  })
}
