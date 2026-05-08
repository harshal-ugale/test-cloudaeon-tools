'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DEMO_CREDENTIALS } from '@/lib/mock-data'
import { Eye, EyeOff, Zap, Building2, Shield, User } from 'lucide-react'

const ROLE_ICONS = [Building2, Shield, User]
const ROLE_COLORS = ['from-purple-500 to-indigo-600', 'from-pink-500 to-rose-600', 'from-blue-500 to-cyan-600']

export default function LoginPage() {
  const { login } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await login(email, password)
    setLoading(false)
    if (result.success) {
      router.push('/dashboard')
    } else {
      setError(result.error ?? 'Login failed')
    }
  }

  async function quickLogin(cred: (typeof DEMO_CREDENTIALS)[number]) {
    setLoading(true)
    const result = await login(cred.email, cred.password)
    setLoading(false)
    if (result.success) router.push('/dashboard')
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
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl bg-gradient-to-br ${ROLE_COLORS[i]} text-white text-xs font-medium transition-all hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-slate-300">Email address</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@cloudaeon.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-blue-500"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-slate-300">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPw ? 'text' : 'password'}
                placeholder="demo123"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-blue-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 transition-colors"
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full h-10 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 border-0 text-white font-medium shadow-lg" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        {/* Demo hint */}
        <p className="text-center text-xs text-slate-500 mt-6">
          Demo password: <span className="text-slate-300 font-mono">demo123</span>
        </p>
      </div>

      {/* Footer */}
      <p className="text-center text-xs text-slate-500 mt-6">
        © 2025 Cloudaeon Technologies · CEMT v1.0 Demo
      </p>
    </div>
  )
}
