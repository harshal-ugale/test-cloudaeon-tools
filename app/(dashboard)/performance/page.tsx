'use client'

import { useMemo, useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { isPrivileged } from '@/lib/auth'
import { DEMO_EMPLOYEES, DEMO_PERFORMANCE, PERFORMANCE_TREND_DATA } from '@/lib/mock-data'
import { Avatar } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { PageHeader } from '@/components/layout/DashboardShell'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line,
  Cell
} from 'recharts'
import { TrendingUp, Award, Star, BarChart2, ExternalLink } from 'lucide-react'

interface CertSummaryRow {
  employeeId: string
  employeeName: string
  employeeAvatar?: string
  department?: string
  total: number
  verified: number
  pending: number
  rejected: number
}

const SCORE_COLOR = (score: number) =>
  score >= 90 ? '#10b981' : score >= 75 ? '#3b82f6' : score >= 60 ? '#f59e0b' : '#ef4444'

const SCORE_LABEL = (score: number) =>
  score >= 90 ? 'Outstanding' : score >= 75 ? 'Exceeds Expectations' : score >= 60 ? 'Meets Expectations' : 'Needs Improvement'

export default function PerformancePage() {
  const { user } = useAuth()
  const isPriv = isPrivileged(user?.role ?? 'EMPLOYEE') || user?.role === 'MANAGER'

  const [certSummary, setCertSummary] = useState<CertSummaryRow[]>([])

  const authHeaders = useMemo(() => ({
    'x-demo-role': user?.role ?? '',
    'x-demo-emp-id': user?.employeeId ?? '',
  }), [user])

  const loadCertSummary = useCallback(async () => {
    if (!user || !isPrivileged(user.role)) return
    try {
      const res = await fetch('/api/certifications/hr/summary', { headers: authHeaders })
      const data = await res.json()
      setCertSummary(data.summary ?? [])
    } catch { /* non-critical */ }
  }, [user, authHeaders])

  useEffect(() => { loadCertSummary() }, [loadCertSummary])

  const myPerformance = useMemo(() => {
    if (isPriv) return DEMO_PERFORMANCE
    return DEMO_PERFORMANCE.filter((p) => p.employeeId === user?.employeeId)
  }, [isPriv, user])

  const latestReviews = useMemo(() => {
    const byEmployee: Record<string, typeof DEMO_PERFORMANCE[number]> = {}
    myPerformance.forEach((p) => {
      if (!byEmployee[p.employeeId]) byEmployee[p.employeeId] = p
    })
    return Object.values(byEmployee)
  }, [myPerformance])

  const orgAvgScore = latestReviews.length > 0
    ? Math.round(latestReviews.reduce((s, p) => s + p.overallScore, 0) / latestReviews.length)
    : 0

  const teamRadarData = [
    { skill: 'Technical', score: Math.round(latestReviews.reduce((s, p) => s + p.technicalSkills, 0) / (latestReviews.length || 1)) },
    { skill: 'Communication', score: Math.round(latestReviews.reduce((s, p) => s + p.communication, 0) / (latestReviews.length || 1)) },
    { skill: 'Teamwork', score: Math.round(latestReviews.reduce((s, p) => s + p.teamwork, 0) / (latestReviews.length || 1)) },
    { skill: 'Leadership', score: Math.round(latestReviews.reduce((s, p) => s + p.leadership, 0) / (latestReviews.length || 1)) },
    { skill: 'Delivery', score: Math.round(latestReviews.reduce((s, p) => s + p.delivery, 0) / (latestReviews.length || 1)) },
    { skill: 'Innovation', score: Math.round(latestReviews.reduce((s, p) => s + p.innovation, 0) / (latestReviews.length || 1)) },
  ]

  const topPerformers = [...latestReviews].sort((a, b) => b.overallScore - a.overallScore).slice(0, 5)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Performance"
        description={isPriv ? 'Track and analyze employee performance reviews' : 'Your performance reviews'}
      />

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: isPriv ? 'Reviews Completed' : 'My Reviews', value: latestReviews.length, icon: BarChart2, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: isPriv ? 'Avg Team Score' : 'My Avg Score', value: `${orgAvgScore}/100`, icon: Star, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: isPriv ? 'Outstanding' : 'Best Score', value: isPriv ? latestReviews.filter((r) => r.overallScore >= 90).length : (myPerformance[0]?.overallScore ?? 0), icon: Award, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Rating', value: SCORE_LABEL(orgAvgScore).split(' ')[0], icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="stat-card flex items-center gap-3">
              <div className={`${s.bg} ${s.color} p-2.5 rounded-xl`}><Icon className="h-5 w-5" /></div>
              <div>
                <p className="text-xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Team skills radar */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{isPriv ? 'Team Average' : 'My'} Skills Radar</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <RadarChart data={teamRadarData} cx="50%" cy="50%" outerRadius="70%">
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="skill" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <Radar name="Score" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Performance trend */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">{isPriv ? 'Organization' : 'My'} Performance Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={PERFORMANCE_TREND_DATA} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="quarter" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis domain={[60, 100]} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="avg" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 5, fill: 'hsl(var(--primary))' }} name="Avg Score" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Score distribution */}
      {isPriv && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Individual Scores — Q1 2025</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={latestReviews.map((r) => {
                  const emp = DEMO_EMPLOYEES.find((e) => e.id === r.employeeId)
                  return {
                    name: emp ? emp.firstName : r.employeeId,
                    score: r.overallScore,
                  }
                })}
                margin={{ top: 5, right: 10, left: -15, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="score" radius={[6, 6, 0, 0]} name="Score">
                  {latestReviews.map((r, i) => (
                    <Cell key={i} fill={SCORE_COLOR(r.overallScore)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Review cards */}
      <div className="space-y-4">
        <h3 className="text-base font-semibold text-foreground">
          {isPriv ? 'Latest Reviews' : 'My Review History'}
        </h3>
        {(isPriv ? topPerformers : myPerformance).map((review) => {
          const emp = DEMO_EMPLOYEES.find((e) => e.id === review.employeeId)
          const name = emp ? `${emp.firstName} ${emp.lastName}` : review.employeeId
          const skills = [
            { label: 'Technical', v: review.technicalSkills },
            { label: 'Communication', v: review.communication },
            { label: 'Teamwork', v: review.teamwork },
            { label: 'Leadership', v: review.leadership },
            { label: 'Delivery', v: review.delivery },
            { label: 'Innovation', v: review.innovation },
          ]
          return (
            <Card key={review.id}>
              <CardContent className="pt-4">
                <div className="flex items-start gap-4">
                  {isPriv && <Avatar name={name} src={emp?.avatar} size="md" />}
                  <div className="flex-1">
                    <div className="flex items-start justify-between flex-wrap gap-2">
                      <div>
                        {isPriv && <p className="font-semibold">{name}</p>}
                        <p className="text-sm text-muted-foreground">{review.quarter} {review.year} · Reviewed by {review.reviewedBy}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold" style={{ color: SCORE_COLOR(review.overallScore) }}>
                          {review.overallScore}
                        </p>
                        <p className="text-xs text-muted-foreground">{SCORE_LABEL(review.overallScore)}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                      {skills.map((s) => (
                        <div key={s.label}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-muted-foreground">{s.label}</span>
                            <span className="font-semibold">{s.v}</span>
                          </div>
                          <Progress value={s.v} color={SCORE_COLOR(s.v)} className="h-1.5" />
                        </div>
                      ))}
                    </div>
                    {review.comments && (
                      <p className="text-sm text-muted-foreground mt-3 italic bg-muted/40 rounded-lg px-3 py-2">
                        "{review.comments}"
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
        {(isPriv ? topPerformers : myPerformance).length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <BarChart2 className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
              <p className="font-medium text-foreground">No reviews yet</p>
              <p className="text-sm text-muted-foreground">Performance reviews appear here after they are submitted.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Certification Summary — HR/Admin only */}
      {isPrivileged(user?.role ?? 'EMPLOYEE') && certSummary.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-foreground">Certification Summary</h3>
            <a
              href="/certifications/hr"
              className="text-sm text-primary hover:underline inline-flex items-center gap-1"
            >
              View all <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
          <Card>
            <CardContent className="pt-4 pb-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left pb-2 font-medium text-muted-foreground">Employee</th>
                      <th className="text-center pb-2 font-medium text-muted-foreground">Total</th>
                      <th className="text-center pb-2 font-medium text-emerald-600">Verified</th>
                      <th className="text-center pb-2 font-medium text-amber-600">Pending</th>
                      <th className="text-center pb-2 font-medium text-red-600">Rejected</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {certSummary.map((row) => (
                      <tr key={row.employeeId} className="hover:bg-muted/20">
                        <td className="py-2.5">
                          <div className="flex items-center gap-2">
                            <Avatar name={row.employeeName} src={row.employeeAvatar} size="sm" />
                            <div>
                              <p className="font-medium text-foreground leading-tight">{row.employeeName}</p>
                              <p className="text-xs text-muted-foreground">{row.department}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 text-center font-semibold">{row.total}</td>
                        <td className="py-2.5 text-center text-emerald-600 font-semibold">{row.verified}</td>
                        <td className="py-2.5 text-center text-amber-600 font-semibold">{row.pending}</td>
                        <td className="py-2.5 text-center text-red-600 font-semibold">{row.rejected}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
