'use client'

import { useState, useRef, type FormEvent, type ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input }  from '@/components/ui/input'
import { Label }  from '@/components/ui/label'
import {
  Eye, EyeOff, Mail, Lock, AlertCircle, UserPlus,
  Building2, Shield, User,
} from 'lucide-react'

// ─── Role tiles (no auto-login — just pre-fill the email) ────────────────────

const ROLE_TILES = [
  {
    label: 'Founder / CEO',
    email: 'founder@cloudaeon.com',
    icon:  Building2,
    gradient: 'from-purple-500 to-indigo-600',
    ring:     'ring-purple-500/50',
  },
  {
    label: 'HR Director',
    email: 'hr@cloudaeon.com',
    icon:  Shield,
    gradient: 'from-pink-500 to-rose-600',
    ring:     'ring-pink-500/50',
  },
  {
    label: 'Employee',
    email: 'rahul@cloudaeon.com',
    icon:  User,
    gradient: 'from-blue-500 to-cyan-600',
    ring:     'ring-blue-500/50',
  },
]

// ─── Component ────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const { login } = useAuth()
  const router    = useRouter()

  const [email,       setEmail]       = useState('')
  const [password,    setPassword]    = useState('')
  const [showPw,      setShowPw]      = useState(false)
  const [error,       setError]       = useState('')
  const [loading,     setLoading]     = useState(false)
  const [activeRole,  setActiveRole]  = useState<string | null>(null)

  const passwordRef = useRef<HTMLInputElement>(null)

  // ── Clicking a role tile pre-fills email + focuses password ──────────────
  function handleRoleTile(tile: (typeof ROLE_TILES)[number]) {
    setEmail(tile.email)
    setActiveRole(tile.email)
    setError('')
    // Give React a tick to update the input, then focus password
    setTimeout(() => passwordRef.current?.focus(), 50)
  }

  // ── Client-side guard ─────────────────────────────────────────────────────
  function clientValidate(): string | null {
    if (!email.trim())
      return 'Please enter your email address.'
    if (!password.trim())
      return 'Please enter your password.'
    const parts = email.trim().split('@')
    if (parts.length !== 2)
      return 'Email must contain exactly one "@" symbol.'
    if (!email.trim().toLowerCase().endsWith('@cloudaeon.com'))
      return 'Email must end with @cloudaeon.com.'
    return null
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    const err = clientValidate()
    if (err) { setError(err); return }

    setLoading(true)
    const result = await login(email.trim(), password)
    setLoading(false)

    if (result.success) {
      router.push('/dashboard')
    } else {
      setError(result.error ?? 'Login failed.')
    }
  }

  return (
    <div className="relative z-10 w-full max-w-md">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">

        {/* ── Header ───────────────────────────────────────────────── */}
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl
                          bg-gradient-to-br from-blue-500 to-indigo-600
                          shadow-lg shadow-blue-500/30 mb-4">
            <span className="text-white font-bold text-2xl">C</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="text-sm text-slate-400 mt-1">Sign in to Cloudaeon Tracker</p>
        </div>

        {/* ── Role selection tiles ──────────────────────────────────── */}
        <div className="mb-6">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Select your role to get started
          </p>
          <div className="grid grid-cols-3 gap-2">
            {ROLE_TILES.map((tile) => {
              const Icon     = tile.icon
              const isActive = activeRole === tile.email
              return (
                <button
                  key={tile.email}
                  type="button"
                  onClick={() => handleRoleTile(tile)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl
                    bg-gradient-to-br ${tile.gradient} text-white text-xs font-medium
                    transition-all hover:scale-105 hover:shadow-lg
                    focus:outline-none focus-visible:ring-2 ${tile.ring}
                    ${isActive ? `ring-2 ${tile.ring} scale-105 shadow-lg` : 'opacity-80 hover:opacity-100'}`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-center leading-tight">{tile.label}</span>
                </button>
              )
            })}
          </div>
          <p className="text-center text-[11px] text-slate-500 mt-2">
            Click a role to pre-fill the email — then enter your password below
          </p>
        </div>

        {/* ── Divider ──────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-xs text-slate-500">sign in with your credentials</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* ── Form ─────────────────────────────────────────────────── */}
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
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setEmail(e.target.value)
                  setActiveRole(null)   // clear active tile if user types manually
                }}
                className="pl-9 bg-white/5 border-white/10 text-white
                           placeholder:text-slate-500 focus-visible:ring-blue-500"
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
                ref={passwordRef}
                type={showPw ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                className="pl-9 pr-10 bg-white/5 border-white/10 text-white
                           placeholder:text-slate-500 focus-visible:ring-blue-500"
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
            <div className="flex items-start gap-2 text-sm text-red-400
                            bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-10 bg-gradient-to-r from-blue-600 to-indigo-600
                       hover:from-blue-500 hover:to-indigo-500 border-0 text-white
                       font-medium shadow-lg disabled:opacity-50"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </Button>
        </form>

        {/* ── Register link ─────────────────────────────────────────── */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-xs text-slate-500">new here?</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <Link href="/signup">
          <Button
            variant="outline"
            className="w-full gap-2 border-white/10 text-slate-300
                       hover:text-white hover:bg-white/10 bg-transparent"
          >
            <UserPlus className="h-4 w-4" />
            Create an Account
          </Button>
        </Link>
      </div>

      {/* Footer */}
      <p className="text-center text-xs text-slate-500 mt-6">
        © 2025 Cloudaeon Technologies · CEMT v1.0
      </p>
    </div>
  )
}
