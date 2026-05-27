'use client'

import { useState, type FormEvent, type ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input }  from '@/components/ui/input'
import { Label }  from '@/components/ui/label'
import { DEMO_CREDENTIALS } from '@/lib/mock-data'
import {
  Eye, EyeOff, Zap, Building2, Shield, User,
  Mail, Lock, AlertCircle, UserPlus,
} from 'lucide-react'

const ROLE_ICONS  = [Building2, Shield, User]
const ROLE_COLORS = [
  'from-purple-500 to-indigo-600',
  'from-pink-500 to-rose-600',
  'from-blue-500 to-cyan-600',
]

export default function LoginPage() {
  const { login } = useAuth()
  const router    = useRouter()

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  // ── Client-side guard: block obviously empty / invalid inputs ─────────────
  function clientValidate(): string | null {
    if (!email.trim())    return 'Please enter your email address.'
    if (!password.trim()) return 'Please enter your password.'
    const parts = email.trim().split('@')
    if (parts.length !== 2) return 'Email must contain exactly one "@" symbol.'
    if (!email.trim().toLowerCase().endsWith('@cloudaeon.com'))
      return 'Email must end with @cloudaeon.com.'
    return null
  }

  // ── Manual login ──────────────────────────────────────────────────────────
  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    const clientErr = clientValidate()
    if (clientErr) { setError(clientErr); return }

    setLoading(true)
    const result = await login(email.trim(), password)
    setLoading(false)

    if (result.success) {
      router.push('/dashboard')
    } else {
      setError(result.error ?? 'Login failed.')
    }
  }

  // ── Quick demo login (bypasses manual validation) ─────────────────────────
  async function quickLogin(cred: (typeof DEMO_CREDENTIALS)[number]) {
    setLoading(true)
    const result = await login(cred.email, cred.password)
    setLoading(false)
    if (result.success) router.push('/dashboard')
    else setError(result.error ?? 'Demo login failed.')
  }

  return (
    <div className="relative z-10 w-full max-w-md">
      {/* Card */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30 mb-4">
            <span className="text-white font-bold text-2xl">C</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="text-sm text-slate-400 mt-1">Sign in to Cloudaeon Tracker</p>
        </div>

        {/* Demo Quick Login */}
        <div className="mb-6">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Zap className="h-3 w-3 text-amber-400" />
            Quick Demo Login
          </p>
          <div className="grid grid-cols-3 gap-2">
            {DEMO_CREDENTIALS.map((cred, i) => {
              const Icon = ROLE_ICONS[i]
              return (
                <button
                  key={cred.email}
                  onClick={() => quickLogin(cred)}
                  disabled={loading}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl bg-gradient-to-br
                    ${ROLE_COLORS[i]} text-white text-xs font-medium transition-all
                    hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-center leading-tight">{cred.role}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-xs text-slate-500">or sign in manually</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Manual login form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-slate-300">Email address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500 pointer-events-none" />
              <Input
                id="email"
                type="text"
                autoComplete="email"
                placeholder="you@cloudaeon.com"
                value={email}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                required
                className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-blue-500"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-slate-300">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500 pointer-events-none" />
              <Input
                id="password"
                type={showPw ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Your password"
                value={password}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                required
                className="pl-9 pr-10 bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-blue-500"
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
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-10 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 border-0 text-white font-medium shadow-lg disabled:opacity-50"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </Button>
        </form>

        {/* Register link */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-xs text-slate-500">new here?</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <Link href="/signup">
          <Button
            variant="outline"
            className="w-full gap-2 border-white/10 text-slate-300 hover:text-white hover:bg-white/10 bg-transparent"
          >
            <UserPlus className="h-4 w-4" />
            Create an Account
          </Button>
        </Link>
      </div>

      {/* Footer */}
      <p className="text-center text-xs text-slate-500 mt-6">
        © 2025 Cloudaeon Technologies · CEMT v1.0 Demo
      </p>
    </div>
  )
}
