'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { AuthUser } from '@/lib/types'

interface AuthContextType {
  user:      AuthUser | null
  login:     (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout:    () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

const STORAGE_KEY = 'cemt_auth_user'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,      setUser]      = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Rehydrate from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setUser(JSON.parse(stored) as AuthUser)
    } catch {
      localStorage.removeItem(STORAGE_KEY)
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Login via the new /api/auth/login endpoint.
   *
   * Rules enforced here (and also server-side):
   *  • Empty email or password → rejected
   *  • Email not ending with @cloudaeon.com → rejected
   *  • Unregistered / non-activated account → rejected with a clear message
   *  • Wrong password → rejected
   *
   * Demo quick-login buttons still work because the server falls back to
   * DEMO_ACCOUNTS when NEXT_PUBLIC_DEMO_MODE=true.
   */
  async function login(
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> {
    // ── Client-side guard: block empty fields before hitting the network ──
    if (!email || !email.trim()) {
      return { success: false, error: 'Email address is required.' }
    }
    if (!password || !password.trim()) {
      return { success: false, error: 'Password is required.' }
    }

    try {
      const res = await fetch('/api/auth/login', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: email.trim(), password }),
      })

      const data = await res.json() as { user?: AuthUser; error?: string }

      if (!res.ok || !data.user) {
        return { success: false, error: data.error ?? 'Invalid email or password.' }
      }

      setUser(data.user)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data.user))
      return { success: true }
    } catch {
      return { success: false, error: 'Network error. Please check your connection and try again.' }
    }
  }

  function logout() {
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
