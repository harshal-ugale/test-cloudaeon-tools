'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { isPrivileged } from '@/lib/auth'
import { DEPARTMENTS } from '@/lib/mock-data'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/layout/DashboardShell'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Save, User, Briefcase, DollarSign } from 'lucide-react'
import Link from 'next/link'

export default function NewEmployeePage() {
  const { user } = useAuth()
  const router = useRouter()

  if (!isPrivileged(user?.role ?? 'EMPLOYEE')) {
    router.replace('/employees')
    return null
  }

  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    await new Promise((r) => setTimeout(r, 1200))
    setSaving(false)
    setSaved(true)
    setTimeout(() => router.push('/employees'), 1500)
  }

  if (saved) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
            <Save className="h-8 w-8 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold">Employee Added!</h2>
          <p className="text-muted-foreground text-sm">Redirecting to employee list...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader title="Add New Employee" description="Fill in the details to onboard a new team member">
        <Link href="/employees">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        </Link>
      </PageHeader>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4 text-primary" /> Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="firstName">First Name *</Label>
              <Input id="firstName" placeholder="Rohan" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input id="lastName" placeholder="Verma" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Work Email *</Label>
              <Input id="email" type="email" placeholder="rohan@cloudaeon.com" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" type="tel" placeholder="+91 98765 43210" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input id="startDate" type="date" required defaultValue={new Date().toISOString().split('T')[0]} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="empCode">Employee Code *</Label>
              <Input id="empCode" placeholder="EMP-011" required />
            </div>
          </CardContent>
        </Card>

        {/* Job Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-primary" /> Job Details
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="jobTitle">Job Title *</Label>
              <Input id="jobTitle" placeholder="Software Engineer" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="department">Department *</Label>
              <Select id="department" required>
                <option value="">Select department</option>
                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="role">Role *</Label>
              <Select id="role" required>
                <option value="">Select role</option>
                <option value="EMPLOYEE">Employee</option>
                <option value="MANAGER">Manager</option>
                <option value="HR">HR</option>
                <option value="ADMIN">Admin</option>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="manager">Reporting Manager</Label>
              <Select id="manager">
                <option value="">Select manager</option>
                <option value="emp-001">Harshal Ugale (CEO)</option>
                <option value="emp-004">Neha Gupta (Product)</option>
                <option value="emp-007">Vikram Joshi (Marketing)</option>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Salary Config */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" /> Salary Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="basicSalary">Basic Salary (₹/mo) *</Label>
              <Input id="basicSalary" type="number" placeholder="50000" min="0" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="hra">HRA (₹/mo)</Label>
              <Input id="hra" type="number" placeholder="20000" min="0" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="transport">Transport Allow. (₹/mo)</Label>
              <Input id="transport" type="number" placeholder="5000" min="0" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pf">PF Deduction (₹/mo)</Label>
              <Input id="pf" type="number" placeholder="6000" min="0" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="taxSlab">Tax Slab (%)</Label>
              <Select id="taxSlab">
                <option value="0">0%</option>
                <option value="10">10%</option>
                <option value="20">20%</option>
                <option value="30">30%</option>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={saving} className="gap-2">
            {saving ? 'Saving...' : <><Save className="h-4 w-4" /> Save Employee</>}
          </Button>
          <Link href="/employees">
            <Button type="button" variant="outline">Cancel</Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
