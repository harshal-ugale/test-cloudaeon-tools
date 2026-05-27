'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CertificationStatusBadge } from './CertificationStatusBadge'
import { Download, Eye, Trash2, Building2, CalendarDays, Hash } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import type { Certification } from '@/lib/types'

interface Props {
  cert: Certification
  authHeaders: Record<string, string>
  onDeleted: () => void
  onError: (msg: string) => void
}

function formatDate(d?: string) {
  if (!d) return null
  return new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function CertificationCard({ cert, authHeaders, onDeleted, onError }: Props) {
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  async function handleDelete() {
    if (!confirmDelete) { setConfirmDelete(true); return }
    setDeleting(true)
    try {
      const res = await fetch(`/api/certifications/${cert.id}`, { method: 'DELETE', headers: authHeaders })
      if (!res.ok) {
        const d = await res.json()
        onError(d.error ?? 'Delete failed')
        return
      }
      onDeleted()
    } catch {
      onError('Network error')
    } finally {
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  const hasFile = Boolean(cert.fileUrl)

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-4 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-foreground truncate">{cert.certificateName}</h3>
              <CertificationStatusBadge status={cert.status} />
            </div>

            <div className="mt-2 space-y-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 flex-shrink-0" />
                <span>{cert.issuingOrganization}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5 flex-shrink-0" />
                <span>
                  Issued {formatDate(cert.issueDate)}
                  {cert.expiryDate && ` · Expires ${formatDate(cert.expiryDate)}`}
                </span>
              </div>
              {cert.credentialId && (
                <div className="flex items-center gap-1.5">
                  <Hash className="h-3.5 w-3.5 flex-shrink-0" />
                  <span className="font-mono text-xs">{cert.credentialId}</span>
                </div>
              )}
            </div>

            {cert.remarks && cert.status === 'REJECTED' && (
              <div className="mt-2 text-xs bg-red-50 text-red-700 border border-red-200 rounded-md px-3 py-1.5">
                <span className="font-medium">Remarks: </span>{cert.remarks}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-1.5 flex-shrink-0">
            {/* View — opens in new tab */}
            {hasFile && (
              <a
                href={`/api/certifications/file/${cert.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonVariants({ variant: 'outline', size: 'sm', className: 'h-7 text-xs gap-1' })}
              >
                <Eye className="h-3 w-3" />
                View
              </a>
            )}

            {/* Download — forces file save */}
            {hasFile && (
              <a
                href={`/api/certifications/file/${cert.id}?mode=download`}
                download={cert.fileName}
                className={buttonVariants({ variant: 'outline', size: 'sm', className: 'h-7 text-xs gap-1 text-primary border-primary/40 hover:bg-primary/5' })}
              >
                <Download className="h-3 w-3" />
                Download
              </a>
            )}

            {/* Delete — only for pending certs */}
            {cert.status === 'PENDING_REVIEW' && (
              <Button
                variant={confirmDelete ? 'destructive' : 'ghost'}
                size="sm"
                className="h-7 text-xs gap-1"
                onClick={handleDelete}
                disabled={deleting}
              >
                <Trash2 className="h-3 w-3" />
                {confirmDelete ? 'Confirm?' : deleting ? 'Deleting…' : 'Delete'}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
