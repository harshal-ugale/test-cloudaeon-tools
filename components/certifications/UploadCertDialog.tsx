'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Upload, FileText, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  open: boolean
  onClose: () => void
  authHeaders: Record<string, string>
  onUploaded: () => void
  onError: (msg: string) => void
}

const ACCEPT = '.pdf,.jpg,.jpeg,.png'
const MAX_MB = 5

function formatBytes(b: number) {
  if (b < 1024) return `${b} B`
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`
  return `${(b / (1024 * 1024)).toFixed(2)} MB`
}

const ORG_SUGGESTIONS = ['AWS', 'Azure', 'Google Cloud', 'Databricks', 'CompTIA', 'Oracle', 'Salesforce', 'PMI', 'Coursera', 'Udemy']

export function UploadCertDialog({ open, onClose, authHeaders, onUploaded, onError }: Props) {
  const [org, setOrg] = useState('')
  const [certName, setCertName] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const fileRef = useRef<HTMLInputElement>(null)

  function reset() {
    setOrg('')
    setCertName('')
    setFile(null)
    setFieldErrors({})
  }

  function handleClose() {
    reset()
    onClose()
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null
    if (!f) return
    if (f.size > MAX_MB * 1024 * 1024) {
      setFieldErrors((prev) => ({ ...prev, file: `File must be under ${MAX_MB} MB` }))
      return
    }
    setFieldErrors((prev) => { const n = { ...prev }; delete n.file; return n })
    setFile(f)
  }

  function validate() {
    const errs: Record<string, string> = {}
    if (!org.trim()) errs.org = 'Company / issuing organization is required'
    if (!certName.trim()) errs.certName = 'Certificate name is required'
    if (!file) errs.file = 'Please select a file'
    return errs
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setFieldErrors(errs); return }

    setSubmitting(true)
    try {
      // Auto-set issue date to today
      const today = new Date().toISOString().split('T')[0]

      const fd = new FormData()
      fd.append('issuingOrganization', org.trim())
      fd.append('certificateName', certName.trim())
      fd.append('issueDate', today)
      fd.append('file', file!)

      const res = await fetch('/api/certifications/upload', { method: 'POST', headers: authHeaders, body: fd })
      const data = await res.json()

      if (!res.ok) {
        onError(data.error ?? 'Upload failed')
        return
      }

      onUploaded()
      handleClose()
    } catch {
      onError('Network error — please try again')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} className="max-w-md">
      <DialogHeader onClose={handleClose}>
        <DialogTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5 text-primary" />
          Upload Certificate
        </DialogTitle>
      </DialogHeader>

      <DialogContent>
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* 1. Company of Certification */}
          <div>
            <label className="text-sm font-medium text-foreground">
              Company of Certification <span className="text-red-500">*</span>
            </label>
            <Input
              value={org}
              onChange={(e) => setOrg(e.target.value)}
              placeholder="e.g. AWS, Azure, Databricks"
              className="mt-1.5"
            />
            {/* Quick-select chips */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {ORG_SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setOrg(s)}
                  className={cn(
                    'px-2.5 py-0.5 rounded-full text-xs border transition-colors cursor-pointer',
                    org === s
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-muted/50 text-muted-foreground border-border hover:bg-muted hover:text-foreground'
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
            {fieldErrors.org && <p className="text-xs text-red-600 mt-1">{fieldErrors.org}</p>}
          </div>

          {/* 2. Certificate Name */}
          <div>
            <label className="text-sm font-medium text-foreground">
              Certificate Name <span className="text-red-500">*</span>
            </label>
            <Input
              value={certName}
              onChange={(e) => setCertName(e.target.value)}
              placeholder="e.g. AWS Solutions Architect Associate"
              className="mt-1.5"
            />
            {fieldErrors.certName && <p className="text-xs text-red-600 mt-1">{fieldErrors.certName}</p>}
          </div>

          {/* 3. Upload File */}
          <div>
            <label className="text-sm font-medium text-foreground">
              Upload Certificate File <span className="text-red-500">*</span>
            </label>
            <div
              className={cn(
                'mt-1.5 border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition-colors',
                file
                  ? 'border-primary/40 bg-primary/5'
                  : 'border-border hover:border-primary/40 hover:bg-muted/30'
              )}
              onClick={() => fileRef.current?.click()}
            >
              {file ? (
                <div className="flex items-center justify-between gap-2 text-left">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="h-5 w-5 text-primary flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setFile(null)
                      if (fileRef.current) fileRef.current.value = ''
                    }}
                    className="flex-shrink-0 p-1 rounded-md hover:bg-muted"
                  >
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="h-9 w-9 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-sm font-medium text-muted-foreground">Click to select your certificate</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">PDF, JPG, JPEG, PNG — max 5 MB</p>
                </>
              )}
            </div>
            <input ref={fileRef} type="file" accept={ACCEPT} className="hidden" onChange={handleFileChange} />
            {fieldErrors.file && <p className="text-xs text-red-600 mt-1">{fieldErrors.file}</p>}
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="gap-2">
              <Upload className="h-4 w-4" />
              {submitting ? 'Uploading…' : 'Upload'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

