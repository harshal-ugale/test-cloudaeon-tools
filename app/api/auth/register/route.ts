import { NextRequest, NextResponse } from 'next/server'
import { validateEmail, validatePassword } from '@/lib/validation'
import { registerUser } from '@/lib/user-registry'
import { sendActivationEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body as { email?: string; password?: string }

    // ── Field presence ─────────────────────────────────────────────────────
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

    // ── Register user ──────────────────────────────────────────────────────
    const result = registerUser(email, password)
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
        // only returned in demo/dev mode so tester can click the link in the UI
        demoActivationLink: emailResult.demoLink ?? null,
        alreadyPending: result.alreadyPending,
      },
      { status: 201 }
    )
  } catch (err) {
    console.error('[CEMT] /api/auth/register error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}