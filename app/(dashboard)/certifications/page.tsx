'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { PageHeader } from '@/components/layout/DashboardShell'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from '@/components/ui/dialog'
import { CertificationCard } from '@/components/certifications/CertificationCard'
import { UploadCertDialog } from '@/components/certifications/UploadCertDialog'
import { CertificationStatusBadge } from '@/components/certifications/CertificationStatusBadge'
import { buttonVariants } from '@/components/ui/button'
import { Upload, Download, Award, FileText } from 'lucide-react'
import type { Certification } from '@/lib/types'

export default function CertificationsPage() {
  const { user } = useAuth()
  const [certs, setCerts] = useState<Certification[]>([])
  const [loading, setLoading] = useState(true)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [downloadOpen, setDownloadOpen] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  const authHeaders = {
    'x-demo-role': user?.role ?? '',
    'x-demo-emp-id': user?.employeeId ?? '',
  }

  function showToast(type: 'success' | 'error', msg: string) {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 4000)
  }

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const res = await fetch('/api/certifications/my', { headers: authHeaders })
      const data = await res.json()
      setCerts(data.certifications ?? [])
    } catch {
      showToast('error', 'Failed to load certifications')
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  useEffect(() => { load() }, [load])

  const pending  = certs.filter((c) => c.status === 'PENDING_REVIEW').length
  const verified = certs.filter((c) => c.status === 'VERIFIED').length
  const rejected = certs.filter((c) => c.status === 'REJECTED').length

  // Only certs that have actual uploaded files can be downloaded
  const downloadableCerts = certs.filter((c) => Boolean(c.fileUrl))

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Certifications"
        description="Upload and track your professional certifications"
      >
        {/* Download button */}
        <Button
          variant="outline"
          onClick={() => setDownloadOpen(true)}
          disabled={downloadableCerts.length === 0}
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          Download
        </Button>

        {/* Upload button */}
        <Button onClick={() => setUploadOpen(true)} className="gap-2">
          <Upload className="h-4 w-4" />
          Upload Certificate
        </Button>
      </PageHeader>

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium text-white transition-all ${
          toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Summary stats */}
      {certs.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Pending Review', value: pending,  color: 'text-amber-600',   bg: 'bg-amber-50' },
            { label: 'Verified',       value: verified, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Rejected',       value: rejected, color: 'text-red-600',     bg: 'bg-red-50' },
          ].map((s) => (
            <div key={s.label} className="stat-card text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Certifications grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}><CardContent className="pt-4 pb-4"><div className="h-20 animate-pulse bg-muted rounded-lg" /></CardContent></Card>
          ))}
        </div>
      ) : certs.length === 0 ? (
        <Card>
          <CardContent className="py-16 flex flex-col items-center text-center gap-3">
            <Award className="h-14 w-14 text-muted-foreground/30" />
            <div>
              <p className="font-semibold text-foreground">No certifications yet</p>
              <p className="text-sm text-muted-foreground mt-1">Upload your first certificate to get started.</p>
            </div>
            <Button onClick={() => setUploadOpen(true)} className="gap-2 mt-2">
              <Upload className="h-4 w-4" />
              Upload Certificate
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {certs.map((cert) => (
            <CertificationCard
              key={cert.id}
              cert={cert}
              authHeaders={authHeaders}
              onDeleted={() => { showToast('success', 'Certificate deleted'); load() }}
              onError={(msg) => showToast('error', msg)}
            />
          ))}
        </div>
      )}

      {/* Upload Dialog */}
      <UploadCertDialog
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        authHeaders={authHeaders}
        onUploaded={() => { showToast('success', 'Certificate uploaded — pending review'); load() }}
        onError={(msg) => showToast('error', msg)}
      />

      {/* Download Dialog */}
      <Dialog open={downloadOpen} onClose={() => setDownloadOpen(false)} className="max-w-md">
        <DialogHeader onClose={() => setDownloadOpen(false)}>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            Download Certificate
          </DialogTitle>
        </DialogHeader>

        <DialogContent>
          {downloadableCerts.length === 0 ? (
            <div className="py-6 text-center">
              <FileText className="h-10 w-10 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No downloadable certificates available.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Select a certificate to download:</p>
              {downloadableCerts.map((cert) => (
                <div
                  key={cert.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{cert.certificateName}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs text-muted-foreground truncate">{cert.issuingOrganization}</p>
                      <CertificationStatusBadge status={cert.status} />
                    </div>
                  </div>
                  <a
                    href={`/api/certifications/file/${cert.id}?mode=download`}
                    download={cert.fileName}
                    className={buttonVariants({ variant: 'outline', size: 'sm', className: 'gap-1.5 flex-shrink-0' })}
                    onClick={() => setDownloadOpen(false)}
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </a>
                </div>
              ))}
            </div>
          )}
        </DialogContent>

        <DialogFooter>
          <Button variant="outline" onClick={() => setDownloadOpen(false)}>Close</Button>
        </DialogFooter>
      </Dialog>
    </div>
  )
}
