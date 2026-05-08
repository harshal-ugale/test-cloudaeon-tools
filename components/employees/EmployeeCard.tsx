'use client'

import Link from 'next/link'
import type { Employee } from '@/lib/types'
import { Avatar } from '@/components/ui/avatar'
import { getRoleColor, getStatusColor } from '@/lib/utils'
import { Building2, Mail, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function EmployeeCard({ emp }: { emp: Employee }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <Avatar name={`${emp.firstName} ${emp.lastName}`} src={emp.avatar} size="md" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground truncate">{emp.firstName} {emp.lastName}</p>
          <p className="text-xs text-muted-foreground">{emp.jobTitle}</p>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
            <Building2 className="h-3 w-3" />
            {emp.department}
          </div>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${getStatusColor(emp.status)}`}>{emp.status}</span>
      </div>
      <div className="flex items-center justify-between mt-3">
        <span className={`text-xs px-2 py-0.5 rounded-full ${getRoleColor(emp.role)}`}>{emp.role}</span>
        <Link href={`/employees/${emp.id}`}>
          <Button variant="ghost" size="sm" className="gap-1 text-xs">View <ArrowRight className="h-3 w-3" /></Button>
        </Link>
      </div>
    </div>
  )
}
