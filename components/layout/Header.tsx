'use client'

import { usePathname, useRouter } from 'next/navigation'
import { Bell, Search, Menu } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Avatar } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { useState } from 'react'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/employees': 'Employees',
  '/employees/new': 'Add Employee',
  '/leave': 'Leave Management',
  '/leave/apply': 'Apply for Leave',
  '/leave/approvals': 'Leave Approvals',
  '/payroll': 'Payroll',
  '/payroll/payslips': 'Payslips',
  '/attendance': 'Attendance',
  '/performance': 'Performance',
  '/settings': 'Settings',
}

interface HeaderProps {
  onMenuToggle: () => void
}

export function Header({ onMenuToggle }: HeaderProps) {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const router = useRouter()
  const [showSearch, setShowSearch] = useState(false)

  const title = Object.entries(PAGE_TITLES).find(([k]) => pathname.startsWith(k) && k !== '/dashboard'
    ? pathname.startsWith(k)
    : pathname === k
  )?.[1] ?? 'Dashboard'

  const breadcrumb = pathname.split('/').filter(Boolean).map((seg, i, arr) => {
    const href = '/' + arr.slice(0, i + 1).join('/')
    return { label: seg.charAt(0).toUpperCase() + seg.slice(1), href }
  })

  return (
    <header className="h-16 border-b border-border bg-card/80 backdrop-blur-sm flex items-center px-4 gap-4 sticky top-0 z-30">
      {/* Mobile menu */}
      <button
        onClick={onMenuToggle}
        className="lg:hidden p-2 rounded-md hover:bg-muted transition-colors text-muted-foreground"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Page title + breadcrumb */}
      <div className="flex flex-col min-w-0">
        <h1 className="text-base font-semibold text-foreground leading-none">{title}</h1>
        {breadcrumb.length > 1 && (
          <nav className="flex items-center gap-1 mt-0.5">
            {breadcrumb.map((crumb, i) => (
              <span key={crumb.href} className="flex items-center gap-1 text-xs text-muted-foreground">
                {i > 0 && <span>/</span>}
                <span className={i === breadcrumb.length - 1 ? 'text-foreground font-medium' : 'hover:text-foreground cursor-pointer'}>
                  {crumb.label}
                </span>
              </span>
            ))}
          </nav>
        )}
      </div>

      <div className="flex-1" />

      {/* Search */}
      <div className="hidden md:flex items-center">
        {showSearch ? (
          <Input
            autoFocus
            placeholder="Search employees, leaves..."
            className="w-64"
            onBlur={() => setShowSearch(false)}
          />
        ) : (
          <button
            onClick={() => setShowSearch(true)}
            className="p-2 rounded-md hover:bg-muted transition-colors text-muted-foreground"
          >
            <Search className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Notifications */}
      <button className="relative p-2 rounded-md hover:bg-muted transition-colors text-muted-foreground">
        <Bell className="h-4 w-4" />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
      </button>

      {/* User menu */}
      {user && (
        <DropdownMenu
          trigger={
            <button className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-muted transition-colors">
              <Avatar name={user.name} src={user.avatar} size="sm" />
              <div className="hidden md:block text-left">
                <p className="text-xs font-semibold text-foreground leading-none">{user.name}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{user.role.replace('_', ' ')}</p>
              </div>
            </button>
          }
        >
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => router.push(`/employees/${user.employeeId}`)}>
            My Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push('/settings')}>
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem danger onClick={() => { logout(); router.push('/login') }}>
            Sign Out
          </DropdownMenuItem>
        </DropdownMenu>
      )}
    </header>
  )
}
