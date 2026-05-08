/**
 * Auth helpers — demo version uses localStorage-backed context.
 * Replace with real Clerk helpers when integrating Clerk.
 *
 * Example Clerk replacement:
 *   import { currentUser } from '@clerk/nextjs'
 *   export async function getServerUser() { return await currentUser() }
 */

import { DEMO_EMPLOYEES } from './mock-data'
import type { AuthUser, Role } from './types'

export const DEMO_ACCOUNTS: Record<string, { password: string; employeeId: string }> = {
  'founder@cloudaeon.com': { password: 'demo123', employeeId: 'emp-001' },
  'hr@cloudaeon.com': { password: 'demo123', employeeId: 'emp-002' },
  'rahul@cloudaeon.com': { password: 'demo123', employeeId: 'emp-003' },
}

export function authenticateDemo(email: string, password: string): AuthUser | null {
  const account = DEMO_ACCOUNTS[email.toLowerCase()]
  if (!account || account.password !== password) return null

  const emp = DEMO_EMPLOYEES.find((e) => e.id === account.employeeId)
  if (!emp) return null

  return {
    id: emp.id,
    name: `${emp.firstName} ${emp.lastName}`,
    email: emp.email,
    role: emp.role,
    employeeId: emp.id,
    avatar: emp.avatar,
    department: emp.department,
    jobTitle: emp.jobTitle,
  }
}

export function isPrivileged(role: Role): boolean {
  return role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'HR'
}

export function canViewEmployee(viewerRole: Role, viewerEmpId: string, targetEmpId: string): boolean {
  if (isPrivileged(viewerRole) || viewerRole === 'MANAGER') return true
  return viewerEmpId === targetEmpId
}

export function canApproveLeave(role: Role): boolean {
  return isPrivileged(role) || role === 'MANAGER'
}
