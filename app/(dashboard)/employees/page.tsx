'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { isPrivileged } from '@/lib/auth'
import { DEPARTMENTS } from '@/lib/mock-data'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/layout/DashboardShell'
import { EmployeeTable } from '@/components/employees/EmployeeTable'
import { Search, Plus, Users, Building2 } from 'lucide-react'
import type { Employee } from '@/lib/types'

export default function EmployeesPage() {
  const { user } = useAuth()
  const isPriv = isPrivileged(user?.role ?? 'EMPLOYEE')

  const [employees, setEmployees] = useState<Employee[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  // Fetch from /api/employees — mirrors how a server component would call Prisma.
  // In production swap the fetch for a direct Prisma call inside a server component
  // and pass the result as a prop to a client EmployeeTable for interactivity.
  useEffect(() => {
    if (!user) return
    setIsLoading(true)
    fetch('/api/employees', {
      headers: {
        'x-demo-role': user.role,
        'x-demo-emp-id': user.employeeId,
      },
    })
      .then((r) => r.json())
      .then((data) => setEmployees(data.employees ?? []))
      .catch(() => setEmployees([]))
      .finally(() => setIsLoading(false))
  }, [user])

  // Client-side filtering applied after the API response
  const visibleEmployees = useMemo(() => {
    let list = employees

    // Employees can only see themselves; managers see their reports + themselves
    if (!isPriv && user?.role !== 'MANAGER') {
      list = list.filter((e) => e.id === user?.employeeId)
    }

    if (search) {
      const q = search.toLowerCase()
      list = list.filter(
        (e) =>
          `${e.firstName} ${e.lastName}`.toLowerCase().includes(q) ||
          e.email.toLowerCase().includes(q) ||
          e.employeeCode.toLowerCase().includes(q),
      )
    }
    if (deptFilter) list = list.filter((e) => e.department === deptFilter)
    if (statusFilter) list = list.filter((e) => e.status === statusFilter)
    return list
  }, [employees, search, deptFilter, statusFilter, isPriv, user])

  const stats = useMemo(
    () => ({
      total: employees.filter((e) => e.status !== 'TERMINATED').length,
      active: employees.filter((e) => e.status === 'ACTIVE').length,
      onLeave: employees.filter((e) => e.status === 'ON_LEAVE').length,
      departments: new Set(employees.map((e) => e.department)).size,
    }),
    [employees],
  )

  return (
    <div className="space-y-6">
      <PageHeader
        title="Employees"
        description={
          isPriv
            ? 'Manage all employee records across your organization'
            : 'Your profile and team'
        }
      >
        {isPriv && (
          <Link href="/employees/new">
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add Employee
            </Button>
          </Link>
        )}
      </PageHeader>

      {/* Summary stats — HR / Founder only */}
      {isPriv && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total', value: isLoading ? '—' : stats.total, color: 'text-blue-600', bg: 'bg-blue-50', icon: Users },
            { label: 'Active', value: isLoading ? '—' : stats.active, color: 'text-emerald-600', bg: 'bg-emerald-50', icon: Users },
            { label: 'On Leave', value: isLoading ? '—' : stats.onLeave, color: 'text-amber-600', bg: 'bg-amber-50', icon: Users },
            { label: 'Departments', value: isLoading ? '—' : stats.departments, color: 'text-purple-600', bg: 'bg-purple-50', icon: Building2 },
          ].map((s) => {
            const Icon = s.icon
            return (
              <div key={s.label} className="stat-card flex items-center gap-3">
                <div className={`${s.bg} ${s.color} p-2.5 rounded-xl`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or employee code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="w-44"
            >
              <option value="">All Departments</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </Select>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-36"
            >
              <option value="">All Statuses</option>
              {['ACTIVE', 'INACTIVE', 'ON_LEAVE', 'TERMINATED'].map((s) => (
                <option key={s} value={s}>{s.replace('_', ' ')}</option>
              ))}
            </Select>
            {(search || deptFilter || statusFilter) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setSearch(''); setDeptFilter(''); setStatusFilter('') }}
              >
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Employee table — delegates rendering + skeleton to EmployeeTable component */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            {isLoading
              ? 'Loading employees...'
              : `${visibleEmployees.length} Employee${visibleEmployees.length !== 1 ? 's' : ''}`}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <EmployeeTable
            employees={visibleEmployees}
            isLoading={isLoading}
            canManage={isPriv}
          />
        </CardContent>
      </Card>
    </div>
  )
}
