import { NextRequest, NextResponse } from 'next/server'
import { verifyLogin } from '@/lib/user-registry'
import { DEMO_ACCOUNTS } from '@/lib/auth'
import { DEMO_EMPLOYEES } from '@/lib/mock-data'
import type { AuthUser } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body as { email?: string; password?: string }

    // ── Guard: both fields required ────────────────────────────────────────
    if (!email || !email.trim() || !password || !password.trim()) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.trim().toLowerCase()

    // ── 1. Try registered user accounts (file registry) ───────────────────
    const registryResult = verifyLogin(normalizedEmail, password)
    if (registryResult.success) {
      // Look up employee profile by email
      const emp = DEMO_EMPLOYEES.find((e) => e.email.toLowerCase() === normalizedEmail)
      if (!emp) {
        // Account is activated but no employee profile found yet
        return NextResponse.json(
          { error: 'Your account is activated but no employee profile was found. Please contact HR.' },
          { status: 403 }
        )
      }
      const authUser: AuthUser = {
        id:         emp.id,
        name:       `${emp.firstName} ${emp.lastName}`,
        email:      emp.email,
        role:       emp.role,
        employeeId: emp.id,
        avatar:     emp.avatar,
        department: emp.department,
        jobTitle:   emp.jobTitle,
      }
      return NextResponse.json({ user: authUser }, { status: 200 })
    }

    // ── 2. Fall back to demo accounts (DEMO_MODE only) ────────────────────
    const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'
    if (isDemoMode) {
      const demoAccount = DEMO_ACCOUNTS[normalizedEmail]
      if (demoAccount && demoAccount.password === password) {
        const emp = DEMO_EMPLOYEES.find((e) => e.id === demoAccount.employeeId)
        if (emp) {
          const authUser: AuthUser = {
            id:         emp.id,
            name:       `${emp.firstName} ${emp.lastName}`,
            email:      emp.email,
            role:       emp.role,
            employeeId: emp.id,
            avatar:     emp.avatar,
            department: emp.department,
            jobTitle:   emp.jobTitle,
          }
          return NextResponse.json({ user: authUser }, { status: 200 })
        }
      }
    }

    // ── 3. Surface the registry error or a generic message ────────────────
    // Don't expose whether the email exists (security best practice).
    const safeError =
      registryResult.error === 'Account not yet activated. Please check your email for the activation link.'
        ? registryResult.error
        : 'Invalid email or password.'

    return NextResponse.json({ error: safeError }, { status: 401 })
  } catch (err) {
    console.error('[CEMT] /api/auth/login error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}