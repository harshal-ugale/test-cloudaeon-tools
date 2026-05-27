'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { isPrivileged } from '@/lib/auth'
import { PageHeader } from '@/components/layout/DashboardShell'
import { Input } from '@/components/ui/input'
import { HRCertTable } from '@/components/certifications/HRCertTable'
import { Card, CardContent } from '@/components/ui/card'
import { Award, Clock, CheckCircle, XCircle, Search } from 'lucide-react'
import type { Certification, CertificationStatus } from '@/lib/types'

type FilterStatus = CertificationStatus | 'ALL'

export default function HRCertificationsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const isPriv = isPrivileged(user?.role ?? 'EMPLOYEE')

  const [certs, setCerts] = useState<Certification[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('ALL')
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  const authHeaders = {
    'x-demo-role': user?.role ?? '',
    'x-demo-emp-id': user?.employeeId ?? '',
  }

  function showToast(type: 'success' | 'error', msg: string) {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 4000)
  }

  useEffect(() => {
    if (user && !isPriv) router.replace('/certifications')
  }, [user, isPriv, router])

  const load = useCallback(async () => {
    if (!user || !isPriv) return
    setLoading(true)
    try {
      const res = await fetch('/api/certifications/hr/all', { headers: authHeaders })
      const data = await res.json()
      setCerts(data.certifications ?? [])
    } catch {
      showToast('error', 'Failed to load certifications')
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isPriv])

  useEffect(() => { load() }, [load])

  const total    = certs.length
  const pending  = certs.filter((c) => c.status === 'PENDING_REVIEW').length
  const verified = certs.filter((c) => c.status === 'VERIFIED').length
  const rejected = certs.filter((c) => c.status === 'REJECTED').length

  const filtered = certs.filter((c) => {
    if (statusFilter !== 'ALL' && c.status !== statusFilter) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        (c.employeeName ?? '').toLowerCase().includes(q) ||
        c.certificateName.toLowerCase().includes(q) ||
        c.issuingOrganization.toLowerCase().includes(q)
      )
    }
    return true
  })

  const statCards = [
    { label: 'All',            value: total,    status: 'ALL' as FilterStatus,         icon: Award,        color: 'text-blue-600',    bg: 'bg-blue-50' },
    { label: 'Pending Review', value: pending,  status: 'PENDING_REVIEW' as FilterStatus, icon: Clock,     color: 'text-amber-600',   bg: 'bg-amber-50' },
    { label: 'Verified',       value: verified, status: 'VERIFIED' as FilterStatus,    icon: CheckCircle,  color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Rejected',       value: rejected, status: 'REJECTED' as FilterStatus,    icon: XCircle,      color: 'text-red-600',     bg: 'bg-red-50' },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="HR — Certifications"
        description="Review and verify employee certifications"
      />

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium text-white ${
          toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {statCards.map((s) => {
          const Icon = s.icon
          const active = statusFilter === s.status
          return (
            <button
              key={s.label}
              onClick={() => setStatusFilter(s.status)}
              className={`stat-card flex items-center gap-3 text-left transition-all ${active ? 'ring-2 ring-primary' : 'hover:shadow-md'}`}
            >
              <div className={`${s.bg} ${s.color} p-2.5 rounded-xl`}><Icon className="h-5 w-5" /></div>
              <div>
                <p className="text-xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </button>
          )
        })}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search employee, certificate, org…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      {loading ? (
        <Card><CardContent className="py-12"><div className="h-40 animate-pulse bg-muted rounded-lg" /></CardContent></Card>
      ) : (
        <HRCertTable
          certifications={filtered}
          authHeaders={authHeaders}
          onRefresh={() => { load(); showToast('success', 'Certification updated') }}
          onError={(msg) => showToast('error', msg)}
        />
      )}
    </div>
  )
}
