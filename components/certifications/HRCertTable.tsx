'use client'

import { useState } from 'react'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { CertificationStatusBadge } from './CertificationStatusBadge'
import { ExternalLink, CheckCircle, XCircle } from 'lucide-react'
import type { Certification } from '@/lib/types'

interface Props {
  certifications: Certification[]
  authHeaders: Record<string, string>
  onRefresh: () => void
  onError: (msg: string) => void
}

type ReviewTarget = { cert: Certification; action: 'VERIFIED' | 'REJECTED' }

function formatDate(d?: string) {
  if (!d) return '—'
  return new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatBytes(b: number) {
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`
  return `${(b / (1024 * 1024)).toFixed(1)} MB`
}

export function HRCertTable({ certifications, authHeaders, onRefresh, onError }: Props) {
  const [reviewTarget, setReviewTarget] = useState<ReviewTarget | null>(null)
  const [remarks, setRemarks] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleReview() {
    if (!reviewTarget) return
    setSubmitting(true)
    try {
      const res = await fetch(`/api/certifications/${reviewTarget.cert.id}/verify`, {
        method: 'PATCH',
        headers: { ...authHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: reviewTarget.action, remarks: remarks.trim() || undefined }),
      })
      if (!res.ok) {
        const d = await res.json()
        onError(d.error ?? 'Review failed')
        return
      }
      onRefresh()
      setReviewTarget(null)
      setRemarks('')
    } catch {
      onError('Network error')
    } finally {
      setSubmitting(false)
    }
  }

  if (certifications.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="font-medium">No certifications found</p>
        <p className="text-sm">Try adjusting your filters.</p>
      </div>
    )
  }

  return (
    <>
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Employee</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Certificate</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Organization</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Issued</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">File</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
              <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {certifications.map((cert) => (
              <tr key={cert.id} className="hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Avatar name={cert.employeeName ?? cert.employeeId} src={cert.employeeAvatar} size="sm" />
                    <div>
                      <p className="font-medium text-foreground leading-tight">{cert.employeeName ?? cert.employeeId}</p>
                      <p className="text-xs text-muted-foreground">{cert.department}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 font-medium text-foreground max-w-[180px]">
                  <p className="truncate">{cert.certificateName}</p>
                  {cert.credentialId && <p className="text-xs text-muted-foreground font-mono">#{cert.credentialId}</p>}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{cert.issuingOrganization}</td>
                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{formatDate(cert.issueDate)}</td>
                <td className="px-4 py-3">
                  {cert.fileUrl ? (
                    <a
                      href={`/api/certifications/file/${cert.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary hover:underline text-xs"
                    >
                      <ExternalLink className="h-3 w-3" />
                      {formatBytes(cert.fileSize)}
                    </a>
                  ) : (
                    <span className="text-xs text-muted-foreground">Demo only</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div>
                    <CertificationStatusBadge status={cert.status} />
                    {cert.remarks && (
                      <p className="text-xs text-muted-foreground mt-1 max-w-[140px] truncate" title={cert.remarks}>
                        {cert.remarks}
                      </p>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  {cert.status === 'PENDING_REVIEW' && (
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs gap-1 text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                        onClick={() => { setReviewTarget({ cert, action: 'VERIFIED' }); setRemarks('') }}
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        Verify
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs gap-1 text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => { setReviewTarget({ cert, action: 'REJECTED' }); setRemarks('') }}
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        Reject
                      </Button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Review Dialog */}
      <Dialog open={!!reviewTarget} onOpenChange={(o) => !o && setReviewTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {reviewTarget?.action === 'VERIFIED' ? 'Verify Certificate' : 'Reject Certificate'}
            </DialogTitle>
          </DialogHeader>
          {reviewTarget && (
            <div className="space-y-4 mt-2">
              <div className="bg-muted/40 rounded-lg px-4 py-3 text-sm space-y-1">
                <p className="font-medium">{reviewTarget.cert.certificateName}</p>
                <p className="text-muted-foreground">{reviewTarget.cert.employeeName} · {reviewTarget.cert.issuingOrganization}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">
                  Remarks {reviewTarget.action === 'REJECTED' && <span className="text-muted-foreground font-normal">(recommended)</span>}
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder={reviewTarget.action === 'VERIFIED' ? 'Optional remarks…' : 'Reason for rejection…'}
                  rows={3}
                  className="mt-1 w-full rounded-md border px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 bg-background"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewTarget(null)} disabled={submitting}>Cancel</Button>
            <Button
              onClick={handleReview}
              disabled={submitting}
              className={reviewTarget?.action === 'REJECTED' ? 'bg-red-600 hover:bg-red-700' : ''}
            >
              {submitting
                ? 'Saving…'
                : reviewTarget?.action === 'VERIFIED'
                ? 'Mark as Verified'
                : 'Reject Certificate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
