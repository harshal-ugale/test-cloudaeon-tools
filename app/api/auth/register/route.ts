import { NextRequest, NextResponse } from 'next/server'
import { validateEmail, validatePassword } from '@/lib/validation'
import { registerUser, type RegistrationProfile } from '@/lib/user-registry'
import { sendActivationEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      email?:    string
      password?: string
      profile?:  RegistrationProfile
    }

    const { email, password, profile } = body

    // ── Required fields guard ──────────────────────────────────────────────
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      )
    }

    // ── Email validation ───────────────────────────────────────────────────
    const emailCheck = validateEmail(email)
    if (!emailCheck.valid) {
      return NextResponse.json({ error: emailCheck.error }, { status: 400 })
    }

    // ── Password validation ────────────────────────────────────────────────
    const pwCheck = validatePassword(password)
    if (!pwCheck.valid) {
      return NextResponse.json({ error: pwCheck.error }, { status: 400 })
    }

    // ── Profile: require core personal + employment fields ─────────────────
    if (profile) {
      if (!profile.firstName?.trim() || !profile.lastName?.trim()) {
        return NextResponse.json(
          { error: 'First name and last name are required.' },
          { status: 400 }
        )
      }
      if (!profile.mobileNumber?.trim()) {
        return NextResponse.json(
          { error: 'Mobile number is required.' },
          { status: 400 }
        )
      }
    }

    // ── Register user ──────────────────────────────────────────────────────
    const result = registerUser(email, password, profile)
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 409 })
    }

    // ── Send activation email ──────────────────────────────────────────────
    const emailResult = await sendActivationEmail(email, result.token)

    return NextResponse.json(
      {
        message: emailResult.sent
          ? 'Registration successful! Please check your email to activate your account.'
          : 'Registration successful! (Demo mode: no email sent)',
        demoActivationLink: emailResult.demoLink ?? null,
        alreadyPending:     result.alreadyPending,
      },
      { status: 201 }
    )
  } catch (err) {
    console.error('[CEMT] /api/auth/register error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
