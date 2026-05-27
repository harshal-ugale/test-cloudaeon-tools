import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { DEMO_CERTIFICATIONS, DEMO_EMPLOYEES } from '@/lib/mock-data'

function requireAuth(req: NextRequest) {
  const role = req.headers.get('x-demo-role')
  const empId = req.headers.get('x-demo-emp-id')
  if (!role || !empId) return null
  return { role, empId }
}

const ALLOWED_TYPES = new Set(['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'])
const MAX_SIZE = 5 * 1024 * 1024 // 5 MB

/** POST /api/certifications/upload — multipart upload, stores file on local disk. */
export async function POST(req: NextRequest) {
  const session = requireAuth(req)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid multipart form data' }, { status: 400 })
  }

  const certificateName    = (formData.get('certificateName') as string | null)?.trim()
  const issuingOrganization = (formData.get('issuingOrganization') as string | null)?.trim()
  const issueDate          = (formData.get('issueDate') as string | null)?.trim()
  const expiryDate         = (formData.get('expiryDate') as string | null)?.trim() || undefined
  const credentialId       = (formData.get('credentialId') as string | null)?.trim() || undefined
  const file               = formData.get('file') as File | null

  if (!certificateName || !issuingOrganization || !issueDate || !file) {
    return NextResponse.json({ error: 'certificateName, issuingOrganization, issueDate, and file are required' }, { status: 400 })
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: 'Only PDF, JPG, JPEG, and PNG files are allowed' }, { status: 400 })
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'File size must not exceed 5 MB' }, { status: 400 })
  }

  // Save to disk: uploads/certificates/{employeeId}/{timestamp}-{sanitized-name}
  const uploadDir = path.join(process.cwd(), 'uploads', 'certificates', session.empId)
  await mkdir(uploadDir, { recursive: true })

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const diskName = `${Date.now()}-${safeName}`
  const filePath = path.join(uploadDir, diskName)

  await writeFile(filePath, Buffer.from(await file.arrayBuffer()))

  const emp = DEMO_EMPLOYEES.find((e) => e.id === session.empId)
  const now = new Date().toISOString()
  const certId = `cert-${Date.now()}`

  const certification = {
    id: certId,
    employeeId: session.empId,
    employeeName:   emp ? `${emp.firstName} ${emp.lastName}` : undefined,
    employeeAvatar: emp?.avatar,
    department:     emp?.department,
    certificateName,
    issuingOrganization,
    issueDate,
    expiryDate,
    credentialId,
    fileUrl:   filePath,
    fileName:  file.name,
    fileSize:  file.size,
    mimeType:  file.type,
    status:    'PENDING_REVIEW' as const,
    uploadedAt: now,
    createdAt:  now,
    updatedAt:  now,
  }

  // Production: await prisma.certification.create({ data: { ... } })
  DEMO_CERTIFICATIONS.push(certification)

  return NextResponse.json({ certification }, { status: 201 })
}
