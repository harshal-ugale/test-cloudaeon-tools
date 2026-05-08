'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Info } from 'lucide-react'

export default function SignupPage() {
  return (
    <div className="relative z-10 w-full max-w-md">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30 mb-4">
          <Info className="h-7 w-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Employee Registration</h1>
        <p className="text-slate-400 text-sm mb-6">
          New employee accounts are created by your HR team. Please contact{' '}
          <a href="mailto:hr@cloudaeon.com" className="text-blue-400 hover:text-blue-300 transition-colors">
            hr@cloudaeon.com
          </a>{' '}
          to get access.
        </p>
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-6 text-left">
          <p className="text-xs font-semibold text-blue-300 uppercase tracking-wide mb-2">For Demo</p>
          <p className="text-sm text-slate-300">Use the quick login buttons on the sign-in page to explore all three roles instantly.</p>
        </div>
        <Link href="/login">
          <Button className="w-full gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white border-0">
            <ArrowLeft className="h-4 w-4" />
            Back to Sign In
          </Button>
        </Link>
      </div>
    </div>
  )
}
