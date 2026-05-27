'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { isPrivileged } from '@/lib/auth'
import {
  LayoutDashboard, Users, CalendarDays, CreditCard, Clock,
  BarChart2, Settings, LogOut, ChevronRight, CheckSquare, ClipboardList, Award
} from 'lucide-react'

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
  badge?: number
  requiredRoles?: string[]
  children?: { href: string; label: string }[]
}

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  {
    href: '/employees',
    label: 'Employees',
    icon: Users,
    requiredRoles: ['SUPER_ADMIN', 'ADMIN', 'HR', 'MANAGER'],
    children: [
      { href: '/employees', label: 'All Employees' },
      { href: '/employees/new', label: 'Add Employee' },
    ],
  },
  {
    href: '/leave',
    label: 'Leave',
    icon: CalendarDays,
    children: [
      { href: '/leave', label: 'Leave Dashboard' },
      { href: '/leave/apply', label: 'Apply for Leave' },
      { href: '/leave/approvals', label: 'Approvals' },
    ],
  },
  {
    href: '/payroll',
    label: 'Payroll',
    icon: CreditCard,
    children: [
      { href: '/payroll', label: 'Payroll Summary' },
      { href: '/payroll/payslips', label: 'Payslips' },
    ],
  },
  { href: '/attendance', label: 'Attendance', icon: Clock },
  {
    href: '/timesheet',
    label: 'Timesheet',
    icon: ClipboardList,
    children: [
      { href: '/timesheet', label: 'My Timesheet' },
      { href: '/timesheet/hr', label: 'HR Review' },
    ],
  },
  {
    href: '/certifications',
    label: 'Certifications',
    icon: Award,
    children: [
      { href: '/certifications', label: 'My Certifications' },
      { href: '/certifications/hr', label: 'HR Review' },
    ],
  },
  {
    href: '/performance',
    label: 'Performance',
    icon: BarChart2,
    requiredRoles: ['SUPER_ADMIN', 'ADMIN', 'HR', 'MANAGER'],
  },
  { href: '/settings', label: 'Settings', icon: Settings },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const role = user?.role ?? 'EMPLOYEE'

  function isActive(href: string): boolean {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.requiredRoles || item.requiredRoles.includes(role)
  )

  return (
    <aside
      className={cn(
        'flex flex-col h-screen transition-all duration-300 ease-in-out flex-shrink-0',
        'border-r',
        collapsed ? 'w-16' : 'w-64'
      )}
      style={{
        backgroundColor: 'hsl(var(--sidebar-bg))',
        borderColor: 'hsl(var(--sidebar-border))',
      }}
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b" style={{ borderColor: 'hsl(var(--sidebar-border))' }}>
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            C
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-bold truncate" style={{ color: 'hsl(var(--sidebar-fg))' }}>Cloudaeon</p>
              <p className="text-xs truncate" style={{ color: 'hsl(var(--sidebar-muted))' }}>Tracker</p>
            </div>
          )}
        </div>
        <button
          onClick={onToggle}
          className="ml-auto p-1 rounded-md transition-colors hover:bg-white/10"
          style={{ color: 'hsl(var(--sidebar-muted))' }}
        >
          <ChevronRight className={cn('h-4 w-4 transition-transform duration-300', collapsed ? '' : 'rotate-180')} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
        {visibleItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.href)

          return (
            <div key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group',
                  active
                    ? 'bg-white/15 shadow-sm'
                    : 'hover:bg-white/8'
                )}
                style={{
                  color: active ? 'hsl(var(--sidebar-fg))' : 'hsl(var(--sidebar-muted))',
                  boxShadow: active ? 'inset 3px 0 0 hsl(var(--sidebar-accent))' : undefined,
                }}
                title={collapsed ? item.label : undefined}
              >
                <Icon className="h-4.5 w-4.5 flex-shrink-0" style={{ width: 18, height: 18 }} />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>

              {/* Sub-items */}
              {!collapsed && active && item.children && (
                <div className="ml-6 mt-0.5 space-y-0.5 border-l pl-3" style={{ borderColor: 'hsl(var(--sidebar-border))' }}>
                  {item.children.map((child) => {
                    if (child.href === '/leave/approvals' && !isPrivileged(role as any) && role !== 'MANAGER') return null
                    if (child.href === '/employees/new' && !isPrivileged(role as any)) return null
                    if (child.href === '/timesheet/hr' && !isPrivileged(role as any)) return null
                    if (child.href === '/certifications/hr' && !isPrivileged(role as any)) return null
                    const childActive = pathname === child.href
                    return (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-colors"
                        style={{ color: childActive ? 'hsl(var(--sidebar-fg))' : 'hsl(var(--sidebar-muted))' }}
                      >
                        <CheckSquare className="h-3 w-3" />
                        {child.label}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* User section */}
      <div className="p-3 border-t" style={{ borderColor: 'hsl(var(--sidebar-border))' }}>
        {!collapsed && user && (
          <div className="flex items-center gap-2.5 px-2 py-2 mb-2 rounded-lg" style={{ backgroundColor: 'hsl(var(--sidebar-border) / 0.5)' }}>
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {user.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold truncate" style={{ color: 'hsl(var(--sidebar-fg))' }}>{user.name}</p>
              <p className="text-[10px] truncate" style={{ color: 'hsl(var(--sidebar-muted))' }}>{user.role.replace('_', ' ')}</p>
            </div>
          </div>
        )}
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm transition-all hover:bg-red-500/10"
          style={{ color: 'hsl(var(--sidebar-muted))' }}
        >
          <LogOut style={{ width: 16, height: 16, flexShrink: 0 }} />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  )
}
