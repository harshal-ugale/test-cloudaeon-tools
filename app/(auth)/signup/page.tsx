'use client'

import { useState, type FormEvent, type ChangeEvent } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input }  from '@/components/ui/input'
import { Label }  from '@/components/ui/label'
import {
  Eye, EyeOff, ArrowLeft, CheckCircle2, XCircle,
  AlertCircle, Mail, Lock, UserPlus, ExternalLink,
} from 'lucide-react'
import { checkPassword, type PasswordCheck } from '@/lib/validation'

// ─── Password requirements row ───────────────────────────────────────────────

function Req({ met, label }: { met: boolean; label: string }) {
  return (
    <li className="flex items-center gap-2 text-xs">
      {met
        ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
        : <XCircle      className="h-3.5 w-3.5 text-slate-600   shrink-0" />}
      <span className={met ? 'text-emerald-300' : 'text-slate-400'}>{label}</span>
    </li>
  )
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function SignupPage() {
  const [email,       setEmail]       = useState('')
  const [password,    setPassword]    = useState('')
  const [confirmPw,   setConfirmPw]   = useState('')
  const [showPw,      setShowPw]      = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error,       setError]       = useState('')
  const [loading,     setLoading]     = useState(false)

  // success state
  const [success,      setSuccess]      = useState(false)
  const [emailSent,    setEmailSent]    = useState(false)
  const [demoLink,     setDemoLink]     = useState<string | null>(null)
  const [registeredAs, setRegisteredAs] = useState('')

  // live checks
  const pwChecks: PasswordCheck = checkPassword(password)
  const pwAllMet =
    pwChecks.minLength && pwChecks.hasUppercase &&
    pwChecks.hasLowercase && pwChecks.hasDigit && pwChecks.hasTwoSpecial

  // email format hint
  const emailOk =
    email.length > 0 &&
    email.split('@').length === 2 &&
    email.toLowerCase().endsWith('@cloudaeon.com')

  const confirmMatch = confirmPw.length > 0 && confirmPw === password

  // ── Submit ────────────────────────────────────────────────────────────────
  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    if (!pwAllMet) {
      setError('Please meet all password requirements before submitting.')
      return
    }
    if (password !== confirmPw) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: email.trim(), password }),
      })
      const data = await res.json() as {
        message?: string
        error?: string
        demoActivationLink?: string | null
      }

      if (!res.ok) {
        setError(data.error ?? 'Registration failed. Please try again.')
        return
      }

      setRegisteredAs(email.trim().toLowerCase())
      setEmailSent(!data.demoActivationLink)
      setDemoLink(data.demoActivationLink ?? null)
      setSuccess(true)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ─── Success screen ───────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          {/* Icon */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 mb-4">
              <CheckCircle2 className="h-8 w-8 text-emerald-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">Registration Successful!</h1>
            <p className="text-sm text-slate-400 mt-1">One more step to activate your account</p>
          </div>

          {emailSent ? (
            /* Real email was sent */
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-blue-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-blue-300 mb-1">Check your email</p>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    We sent an activation email to{' '}
                    <span className="text-white font-mono">{registeredAs}</span>.
                    Click the <strong className="text-white">Activate</strong> button in the
                    email to complete your registration.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* Demo mode — show the activation link directly */
            <div className="space-y-3 mb-6">
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-amber-300 mb-1">
                      Demo mode — no email sent
                    </p>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      No <code className="text-slate-300">RESEND_API_KEY</code> is configured.
                      Use the activation link below to activate your account instantly.
                    </p>
                  </div>
                </div>
              </div>

              {demoLink && (
                <a
                  href={demoLink}
                  className="flex items-center justify-center gap-2 w-full py-3 px-4
                             bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30
                             rounded-xl text-emerald-300 text-sm font-medium transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  Click here to Activate your Account
                </a>
              )}
            </div>
          )}

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-slate-500">already activated?</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <Link href="/login">
            <Button className="w-full gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white border-0">
              <ArrowLeft className="h-4 w-4" />
              Back to Sign In
            </Button>
          </Link>
        </div>
        <p className="text-center text-xs text-slate-500 mt-6">
          © 2025 Cloudaeon Technologies · CEMT v1.0
        </p>
      </div>
    )
  }

  // ─── Registration form ────────────────────────────────────────────────────
  return (
    <div className="relative z-10 w-full max-w-md">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">

        {/* Header */}
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30 mb-4">
            <UserPlus className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Create Account</h1>
          <p className="text-sm text-slate-400 mt-1">Register for Cloudaeon Tracker</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* ── Email ───────────────────────────────────────────────────── */}
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-slate-300">
              Work Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500 pointer-events-none" />
              <Input
                id="email"
                type="text"
                autoComplete="email"
                placeholder="yourname@cloudaeon.com"
                value={email}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                required
                className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-slate-500
                           focus-visible:ring-blue-500"
              />
            </div>

            {/* Email hint */}
            {email.length > 0 && (
              <p className={`text-xs flex items-center gap-1.5 mt-1 ${emailOk ? 'text-emerald-400' : 'text-amber-400'}`}>
                {emailOk
                  ? <><CheckCircle2 className="h-3 w-3" /> Valid Cloudaeon email</>
                  : <><AlertCircle  className="h-3 w-3" /> Must end with @cloudaeon.com and contain exactly one @</>}
              </p>
            )}
          </div>

          {/* ── Password ────────────────────────────────────────────────── */}
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-slate-300">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500 pointer-events-none" />
              <Input
                id="password"
                type={showPw ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="e.g. #Work@123"
                value={password}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                required
                className="pl-9 pr-10 bg-white/5 border-white/10 text-white placeholder:text-slate-500
                           focus-visible:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 transition-colors"
                aria-label={showPw ? 'Hide password' : 'Show password'}
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {/* Live password requirements — shown as soon as user starts typing */}
            {password.length > 0 && (
              <div className="mt-2 bg-white/5 border border-white/10 rounded-xl p-3">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Password requirements
                </p>
                <ul className="space-y-1">
                  <Req met={pwChecks.minLength}    label="At least 8 characters" />
                  <Req met={pwChecks.hasUppercase} label="At least 1 uppercase letter (A-Z)" />
                  <Req met={pwChecks.hasLowercase} label="At least 1 lowercase letter (a-z)" />
                  <Req met={pwChecks.hasDigit}     label="At least 1 number (0-9)" />
                  <Req met={pwChecks.hasTwoSpecial}label="At least 2 special characters (e.g. # @ $ !)" />
                </ul>
                <p className="mt-2 text-[10px] text-slate-500">
                  Examples: <span className="text-slate-400 font-mono">#Work@123</span>
                  {' · '}
                  <span className="text-slate-400 font-mono">#Airbase$1610</span>
                </p>
              </div>
            )}
          </div>

          {/* ── Confirm password ─────────────────────────────────────────── */}
          <div className="space-y-1.5">
            <Label htmlFor="confirm" className="text-slate-300">
              Confirm Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500 pointer-events-none" />
              <Input
                id="confirm"
                type={showConfirm ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Re-enter your password"
                value={confirmPw}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setConfirmPw(e.target.value)}
                required
                className="pl-9 pr-10 bg-white/5 border-white/10 text-white placeholder:text-slate-500
                           focus-visible:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 transition-colors"
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {confirmPw.length > 0 && (
              <p className={`text-xs flex items-center gap-1.5 mt-1 ${confirmMatch ? 'text-emerald-400' : 'text-red-400'}`}>
                {confirmMatch
                  ? <><CheckCircle2 className="h-3 w-3" /> Passwords match</>
                  : <><XCircle      className="h-3 w-3" /> Passwords do not match</>}
              </p>
            )}
          </div>

          {/* ── Error ───────────────────────────────────────────────────── */}
          {error && (
            <div className="flex items-start gap-2 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* ── Submit ──────────────────────────────────────────────────── */}
          <Button
            type="submit"
            disabled={loading || !emailOk || !pwAllMet || !confirmMatch}
            className="w-full h-10 bg-gradient-to-r from-blue-600 to-indigo-600
                       hover:from-blue-500 hover:to-indigo-500 border-0 text-white
                       font-medium shadow-lg disabled:opacity-40"
          >
            {loading ? 'Registering…' : 'Register & Send Activation Email'}
          </Button>
        </form>

        {/* Back to login */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-xs text-slate-500">have an account?</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <Link href="/login">
          <Button variant="outline" className="w-full gap-2 border-white/10 text-slate-300 hover:text-white hover:bg-white/10 bg-transparent">
            <ArrowLeft className="h-4 w-4" />
            Back to Sign In
          </Button>
        </Link>
      </div>

      <p className="text-center text-xs text-slate-500 mt-6">
        © 2025 Cloudaeon Technologies · CEMT v1.0 Demo
      </p>
    </div>
  )
}
