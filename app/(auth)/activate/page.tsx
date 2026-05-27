'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CheckCircle2, XCircle, Loader2, ArrowRight, AlertCircle } from 'lucide-react'

type Status = 'loading' | 'success' | 'error'

// ── Inner component (needs Suspense because of useSearchParams) ───────────────

function ActivateContent() {
  const searchParams = useSearchParams()
  const token        = searchParams.get('token') ?? ''

  const [status,  setStatus]  = useState<Status>('loading')
  const [message, setMessage] = useState('')
  const [email,   setEmail]   = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('No activation token found in the URL. Please use the link from your email.')
      return
    }

    async function activate() {
      try {
        const res  = await fetch('/api/auth/activate', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ token }),
        })
        const data = await res.json() as { message?: string; email?: string; error?: string }

        if (res.ok) {
          setEmail(data.email ?? '')
          setMessage(data.message ?? 'Account activated!')
          setStatus('success')
        } else {
          setMessage(data.error ?? 'Activation failed.')
          setStatus('error')
        }
      } catch {
        setMessage('Network error. Please try again.')
        setStatus('error')
      }
    }

    activate()
  }, [token])

  return (
    <>
      {/* ── Loading ─────────────────────────────────────────────────────── */}
      {status === 'loading' && (
        <>
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-500/20 border border-blue-500/30 mb-5">
            <Loader2 className="h-8 w-8 text-blue-400 animate-spin" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Activating your account…</h1>
          <p className="text-sm text-slate-400">Please wait while we verify your activation link.</p>
        </>
      )}

      {/* ── Success ─────────────────────────────────────────────────────── */}
      {status === 'success' && (
        <>
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 mb-5">
            <CheckCircle2 className="h-8 w-8 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Account Activated! 🎉</h1>
          <p className="text-sm text-slate-400 mb-1">
            Your Cloudaeon Tracker account is now active.
          </p>
          {email && (
            <p className="text-xs text-slate-500 mb-6">
              Email: <span className="text-white font-mono">{email}</span>
            </p>
          )}

          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 mb-6 text-left">
            <p className="text-sm text-emerald-300 font-medium mb-1">What&apos;s next?</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Sign in with your registered email and password to access your dashboard.
            </p>
          </div>

          <Link href="/login">
            <Button className="w-full gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white border-0">
              Go to Sign In
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </>
      )}

      {/* ── Error ───────────────────────────────────────────────────────── */}
      {status === 'error' && (
        <>
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-500/20 border border-red-500/30 mb-5">
            <XCircle className="h-8 w-8 text-red-400" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Activation Failed</h1>

          <div className="flex items-start gap-2 text-sm text-red-300 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2 mb-6 text-left">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-red-400" />
            <span>{message}</span>
          </div>

          <div className="space-y-2">
            <Link href="/signup">
              <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white border-0">
                Register again
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" className="w-full border-white/10 text-slate-300 hover:text-white hover:bg-white/10 bg-transparent">
                Back to Sign In
              </Button>
            </Link>
          </div>
        </>
      )}
    </>
  )
}

// ── Page shell with Suspense boundary ────────────────────────────────────────

export default function ActivatePage() {
  return (
    <div className="relative z-10 w-full max-w-md">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl text-center">
        <Suspense
          fallback={
            <div className="flex flex-col items-center gap-3 py-4">
              <Loader2 className="h-8 w-8 text-blue-400 animate-spin" />
              <p className="text-sm text-slate-400">Loading…</p>
            </div>
          }
        >
          <ActivateContent />
        </Suspense>
      </div>

      <p className="text-center text-xs text-slate-500 mt-6">
        © 2025 Cloudaeon Technologies · CEMT v1.0 Demo
      </p>
    </div>
  )
}
