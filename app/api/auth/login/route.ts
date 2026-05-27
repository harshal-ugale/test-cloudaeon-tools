import { NextRequest, NextResponse } from 'next/server'
import { verifyLogin } from '@/lib/user-registry'
import { DEMO_ACCOUNTS } from '@/lib/auth'
import { DEMO_EMPLOYEES } from '@/lib/mock-data'
import type { AuthUser, Role } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body as { email?: string; password?: string }

    // ── Both fields required ───────────────────────────────────────────────
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
      const registeredUser = registryResult.user

      // a) Check if a pre-existing demo/mock employee record exists for this email
      const demoEmp = DEMO_EMPLOYEES.find(
        (e) => e.email.toLowerCase() === normalizedEmail
      )

      let authUser: AuthUser

      if (demoEmp) {
        // Use the rich demo employee profile
        authUser = {
          id:         demoEmp.id,
          name:       `${demoEmp.firstName} ${demoEmp.lastName}`,
          email:      demoEmp.email,
          role:       demoEmp.role,
          employeeId: demoEmp.id,
          avatar:     demoEmp.avatar,
          department: demoEmp.department,
          jobTitle:   demoEmp.jobTitle,
        }
      } else if (registeredUser.profile) {
        // Use the self-registered profile
        const p = registeredUser.profile
        authUser = {
          id:         registeredUser.employeeId ?? `reg-${Date.now()}`,
          name:       `${p.firstName} ${p.lastName}`.trim(),
          email:      normalizedEmail,
          role:       (p.role as Role) ?? 'EMPLOYEE',
          employeeId: registeredUser.employeeId ?? '',
          department: p.department,
          jobTitle:   p.jobTitle,
        }
      } else {
        // Account activated but no profile (edge case — minimal AuthUser)
        return NextResponse.json(
          {
            error:
              'Your account is activated but the employee profile is incomplete. Please contact HR.',
          },
          { status: 403 }
        )
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

    // ── 3. Surface a clear error ───────────────────────────────────────────
    // Show the "not activated" message verbatim; all other failures get a
    // generic message (don't reveal whether an email exists).
    const NOT_ACTIVATED =
      'Account not yet activated. Please check your email for the activation link.'

    const safeError =
      registryResult.error === NOT_ACTIVATED ? NOT_ACTIVATED : 'Invalid email or password.'

    return NextResponse.json({ error: safeError }, { status: 401 })
  } catch (err) {
    console.error('[CEMT] /api/auth/login error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
