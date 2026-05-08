'use client'

import Link from 'next/link'
import type { Employee } from '@/lib/types'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { getStatusColor, formatDate } from '@/lib/utils'
import { Eye, Pencil } from 'lucide-react'

function SkeletonCell({ width = 'w-24' }: { width?: string }) {
  return (
    <div className={`h-3.5 ${width} bg-muted rounded-full animate-pulse`} />
  )
}

function SkeletonRow() {
  return (
    <TableRow className="pointer-events-none">
      {/* Avatar + Name */}
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-muted animate-pulse flex-shrink-0" />
          <div className="space-y-1.5">
            <SkeletonCell width="w-28" />
            <SkeletonCell width="w-36" />
          </div>
        </div>
      </TableCell>
      {/* Emp Code */}
      <TableCell><SkeletonCell width="w-16" /></TableCell>
      {/* Department */}
      <TableCell><SkeletonCell width="w-24" /></TableCell>
      {/* Job Title */}
      <TableCell><SkeletonCell width="w-32" /></TableCell>
      {/* Status */}
      <TableCell><div className="h-5 w-16 bg-muted rounded-full animate-pulse" /></TableCell>
      {/* Start Date */}
      <TableCell><SkeletonCell width="w-20" /></TableCell>
      {/* Actions */}
      <TableCell><div className="h-7 w-7 bg-muted rounded-md animate-pulse" /></TableCell>
    </TableRow>
  )
}

interface EmployeeTableProps {
  employees: Employee[]
  isLoading?: boolean
  canManage?: boolean
}

export function EmployeeTable({ employees, isLoading = false, canManage = false }: EmployeeTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="min-w-[200px]">Employee</TableHead>
          <TableHead className="min-w-[100px]">Emp Code</TableHead>
          <TableHead className="min-w-[130px]">Department</TableHead>
          <TableHead className="min-w-[160px]">Job Title</TableHead>
          <TableHead className="min-w-[100px]">Status</TableHead>
          <TableHead className="min-w-[110px]">Start Date</TableHead>
          <TableHead className="w-20">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
        ) : employees.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center py-14 text-muted-foreground">
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <Eye className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="font-medium">No employees found</p>
                <p className="text-xs">Try adjusting your search or filters</p>
              </div>
            </TableCell>
          </TableRow>
        ) : (
          employees.map((emp) => (
            <TableRow key={emp.id}>
              {/* Avatar + Name + Email */}
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar name={`${emp.firstName} ${emp.lastName}`} src={emp.avatar} size="sm" />
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{emp.firstName} {emp.lastName}</p>
                    <p className="text-xs text-muted-foreground truncate">{emp.email}</p>
                  </div>
                </div>
              </TableCell>

              {/* Employee Code — distinct column */}
              <TableCell>
                <span className="font-mono text-xs bg-muted px-2 py-1 rounded text-foreground">
                  {emp.employeeCode}
                </span>
              </TableCell>

              {/* Department */}
              <TableCell className="text-sm">{emp.department}</TableCell>

              {/* Job Title */}
              <TableCell className="text-sm text-muted-foreground">{emp.jobTitle}</TableCell>

              {/* Status badge */}
              <TableCell>
                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${getStatusColor(emp.status)}`}>
                  {emp.status.replace('_', ' ')}
                </span>
              </TableCell>

              {/* Start Date */}
              <TableCell className="text-sm text-muted-foreground">{formatDate(emp.startDate)}</TableCell>

              {/* Actions */}
              <TableCell>
                <div className="flex items-center gap-1">
                  <Link href={`/employees/${emp.id}`}>
                    <Button variant="ghost" size="icon-sm" title="View profile">
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                  {canManage && (
                    <Link href={`/employees/${emp.id}?edit=true`}>
                      <Button variant="ghost" size="icon-sm" title="Edit employee">
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}
