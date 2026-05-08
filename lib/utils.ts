import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function getMonthName(month: number): string {
  return new Date(2000, month - 1, 1).toLocaleString('en-IN', { month: 'long' })
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function calculateLeaveDays(start: string, end: string): number {
  const s = new Date(start)
  const e = new Date(end)
  let count = 0
  const curr = new Date(s)
  while (curr <= e) {
    const day = curr.getDay()
    if (day !== 0 && day !== 6) count++
    curr.setDate(curr.getDate() + 1)
  }
  return count
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    ACTIVE: 'bg-emerald-100 text-emerald-700',
    INACTIVE: 'bg-gray-100 text-gray-600',
    ON_LEAVE: 'bg-amber-100 text-amber-700',
    TERMINATED: 'bg-red-100 text-red-700',
    PENDING: 'bg-amber-100 text-amber-700',
    APPROVED: 'bg-emerald-100 text-emerald-700',
    REJECTED: 'bg-red-100 text-red-700',
    CANCELLED: 'bg-gray-100 text-gray-600',
    PRESENT: 'bg-emerald-100 text-emerald-700',
    ABSENT: 'bg-red-100 text-red-700',
    HALF_DAY: 'bg-amber-100 text-amber-700',
    HOLIDAY: 'bg-blue-100 text-blue-700',
    WEEKEND: 'bg-purple-100 text-purple-700',
  }
  return map[status] ?? 'bg-gray-100 text-gray-600'
}

export function getRoleColor(role: string): string {
  const map: Record<string, string> = {
    SUPER_ADMIN: 'bg-purple-100 text-purple-700',
    ADMIN: 'bg-indigo-100 text-indigo-700',
    HR: 'bg-pink-100 text-pink-700',
    MANAGER: 'bg-blue-100 text-blue-700',
    EMPLOYEE: 'bg-gray-100 text-gray-600',
  }
  return map[role] ?? 'bg-gray-100 text-gray-600'
}

export function getLeaveTypeColor(type: string): string {
  const map: Record<string, string> = {
    ANNUAL: 'bg-blue-100 text-blue-700',
    SICK: 'bg-red-100 text-red-700',
    EMERGENCY: 'bg-orange-100 text-orange-700',
    MATERNITY: 'bg-pink-100 text-pink-700',
    PATERNITY: 'bg-teal-100 text-teal-700',
    COMPENSATORY: 'bg-indigo-100 text-indigo-700',
    UNPAID: 'bg-gray-100 text-gray-600',
  }
  return map[type] ?? 'bg-gray-100 text-gray-600'
}

export function avatarUrl(seed: string): string {
  return `https://api.dicebear.com/8.x/avataaars/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4,c0aede,d1d4f9`
}

import type { Role } from './types'

export function canManage(role: Role): boolean {
  return role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'HR'
}
