'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Employee } from '@/lib/types'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogHeader, DialogTitle,
  DialogContent, DialogFooter,
} from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { getStatusColor, formatDate } from '@/lib/utils'
import { Eye, Pencil, Trash2, AlertTriangle } from 'lucide-react'

// ─── Skeleton helpers ─────────────────────────────────────────────────────────

function SkeletonCell({ width = 'w-24' }: { width?: string }) {
  return <div className={`h-3.5 ${width} bg-muted rounded-full animate-pulse`} />
}

function SkeletonRow() {
  return (
    <TableRow className="pointer-events-none">
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-muted animate-pulse flex-shrink-0" />
          <div className="space-y-1.5">
            <SkeletonCell width="w-28" />
            <SkeletonCell width="w-36" />
          </div>
        </div>
      </TableCell>
      <TableCell><SkeletonCell width="w-16" /></TableCell>
      <TableCell><SkeletonCell width="w-24" /></TableCell>
      <TableCell><SkeletonCell width="w-32" /></TableCell>
      <TableCell><div className="h-5 w-16 bg-muted rounded-full animate-pulse" /></TableCell>
      <TableCell><SkeletonCell width="w-20" /></TableCell>
      <TableCell><div className="h-7 w-16 bg-muted rounded-md animate-pulse" /></TableCell>
    </TableRow>
  )
}

// ─── Delete confirmation dialog ───────────────────────────────────────────────

interface DeleteDialogProps {
  employee: Employee | null
  onConfirm: () => void
  onCancel:  () => void
  isDeleting: boolean
}

function DeleteConfirmDialog({ employee, onConfirm, onCancel, isDeleting }: DeleteDialogProps) {
  if (!employee) return null
  return (
    <Dialog open={!!employee} onClose={onCancel} className="max-w-md">
      <DialogHeader onClose={onCancel}>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-100 shrink-0">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <DialogTitle>Delete Employee Profile</DialogTitle>
        </div>
      </DialogHeader>

      <DialogContent>
        <p className="text-sm text-muted-foreground leading-relaxed">
          You are about to permanently delete the profile of{' '}
          <span className="font-semibold text-foreground">
            {employee.firstName} {employee.lastName}
          </span>{' '}
          ({employee.employeeCode}).
        </p>

        <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4 space-y-1.5">
          <p className="text-xs font-semibold text-red-700 uppercase tracking-wide">
            This will permanently remove:
          </p>
          <ul className="text-xs text-red-600 space-y-1 list-disc list-inside">
            <li>Employee record &amp; personal details</li>
            <li>Employment history &amp; documents</li>
            <li>Leave and attendance records</li>
            <li>Payroll and payslip data</li>
          </ul>
        </div>

        <p className="mt-4 text-xs text-muted-foreground">
          This action <strong className="text-foreground">cannot be undone</strong>.
          Make sure you have exported any required records before proceeding.
        </p>
      </DialogContent>

      <DialogFooter>
        <Button variant="outline" onClick={onCancel} disabled={isDeleting}>
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          disabled={isDeleting}
          className="bg-red-600 hover:bg-red-700 text-white border-0 gap-2"
        >
          <Trash2 className="h-4 w-4" />
          {isDeleting ? 'Deleting…' : 'Yes, Delete Profile'}
        </Button>
      </DialogFooter>
    </Dialog>
  )
}

// ─── Main table component ─────────────────────────────────────────────────────

interface EmployeeTableProps {
  employees:  Employee[]
  isLoading?: boolean
  canManage?: boolean   // edit access — HR, Founder, Manager
  canDelete?: boolean   // delete access — HR and Founder only
  onDelete?:  (id: string) => Promise<void>
}

export function EmployeeTable({
  employees,
  isLoading  = false,
  canManage  = false,
  canDelete  = false,
  onDelete,
}: EmployeeTableProps) {
  const [toDelete,   setToDelete]   = useState<Employee | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  async function handleDeleteConfirm() {
    if (!toDelete || !onDelete) return
    setIsDeleting(true)
    setDeleteError('')
    try {
      await onDelete(toDelete.id)
      setToDelete(null)
    } catch (err: unknown) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete employee.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[200px]">Employee</TableHead>
            <TableHead className="min-w-[100px]">Emp Code</TableHead>
            <TableHead className="min-w-[130px]">Department</TableHead>
            <TableHead className="min-w-[160px]">Job Title</TableHead>
            <TableHead className="min-w-[100px]">Status</TableHead>
            <TableHead className="min-w-[110px]">Start Date</TableHead>
            <TableHead className="w-24">Actions</TableHead>
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
                      <p className="font-medium text-sm truncate">
                        {emp.firstName} {emp.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{emp.email}</p>
                    </div>
                  </div>
                </TableCell>

                {/* Employee Code */}
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
                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(emp.startDate)}
                </TableCell>

                {/* Actions */}
                <TableCell>
                  <div className="flex items-center gap-1">
                    {/* View */}
                    <Link href={`/employees/${emp.id}`}>
                      <Button variant="ghost" size="icon-sm" title="View profile">
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    </Link>

                    {/* Edit — HR, Founder, Manager */}
                    {canManage && (
                      <Link href={`/employees/${emp.id}?edit=true`}>
                        <Button variant="ghost" size="icon-sm" title="Edit employee">
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    )}

                    {/* Delete — HR and Founder only */}
                    {canDelete && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        title="Delete employee profile"
                        onClick={() => { setDeleteError(''); setToDelete(emp) }}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Inline error (shown below table if delete fails) */}
      {deleteError && (
        <div className="px-6 py-3 text-sm text-red-600 bg-red-50 border-t border-red-100 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {deleteError}
        </div>
      )}

      {/* Confirmation dialog */}
      <DeleteConfirmDialog
        employee={toDelete}
        onConfirm={handleDeleteConfirm}
        onCancel={() => { setToDelete(null); setDeleteError('') }}
        isDeleting={isDeleting}
      />
    </>
  )
}
