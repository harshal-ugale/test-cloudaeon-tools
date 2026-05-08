'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import type { Payslip } from '@/lib/types'

interface Props {
  payslip: Payslip
  variant?: 'ghost' | 'outline' | 'default'
  size?: 'sm' | 'default'
  showLabel?: boolean
  className?: string
}

export function PayslipDownloadButton({
  payslip,
  variant = 'ghost',
  size = 'sm',
  showLabel = false,
  className = '',
}: Props) {
  const [loading, setLoading] = useState(false)

  async function handleDownload() {
    setLoading(true)
    try {
      const [{ pdf }, React, { PayslipDocument }] = await Promise.all([
        import('@react-pdf/renderer'),
        import('react'),
        import('./PayslipDocument'),
      ])

      const blob = await pdf(
        React.createElement(PayslipDocument, { payslip }),
      ).toBlob()

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `payslip-${payslip.employeeName.replace(/\s+/g, '-')}-${payslip.year}-${String(payslip.month).padStart(2, '0')}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('[CEMT] PDF generation failed:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={`gap-1 text-xs ${className}`}
      onClick={handleDownload}
      disabled={loading}
    >
      <Download className="h-3 w-3" />
      {showLabel ? (loading ? 'Generating…' : 'Download PDF') : (loading ? '…' : '')}
    </Button>
  )
}
