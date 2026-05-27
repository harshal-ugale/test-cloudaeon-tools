import { NextRequest, NextResponse } from 'next/server'
import { activateUser } from '@/lib/user-registry'

/**
 * GET /api/auth/activate?token=<hex>
 *
 * Activates the user account tied to the given token.
 * The activation page calls this and redirects based on the result.
 */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token') ?? ''

  const result = activateUser(token)

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  return NextResponse.json(
    { message: 'Account activated successfully!', email: result.email },
    { status: 200 }
  )
}

/**
 * POST /api/auth/activate  { token }
 *
 * Same logic but accepts token in request body (used by client components).
 */
export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json() as { token?: string }

    if (!token) {
      return NextResponse.json({ error: 'No activation token provided.' }, { status: 400 })
    }

    const result = activateUser(token)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json(
      { message: 'Account activated successfully!', email: result.email },
      { status: 200 }
    )
  } catch (err) {
    console.error('[CEMT] /api/auth/activate error:', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}