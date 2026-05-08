'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme, THEMES } from '@/contexts/ThemeContext'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Avatar } from '@/components/ui/avatar'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { PageHeader } from '@/components/layout/DashboardShell'
import { isPrivileged } from '@/lib/auth'
import { DEMO_EMPLOYEES } from '@/lib/mock-data'
import {
  Palette, Bell, Shield, User, CheckCircle2, Monitor, Moon, Sun
} from 'lucide-react'

export default function SettingsPage() {
  const { user } = useAuth()
  const { theme, setTheme, themes } = useTheme()
  const isPriv = isPrivileged(user?.role ?? 'EMPLOYEE')

  const [saved, setSaved] = useState(false)
  const [notifications, setNotifications] = useState({
    leaveApproval: true,
    payslipReady: true,
    attendanceAlert: false,
    performanceReview: true,
    teamUpdates: false,
  })

  const emp = DEMO_EMPLOYEES.find((e) => e.id === user?.employeeId)

  async function handleSave() {
    setSaved(true)
    await new Promise((r) => setTimeout(r, 1500))
    setSaved(false)
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader title="Settings" description="Manage your account preferences and application settings" />

      <Tabs defaultValue="appearance">
        <TabsList>
          <TabsTrigger value="appearance">
            <Palette className="h-4 w-4 mr-1.5" /> Appearance
          </TabsTrigger>
          <TabsTrigger value="profile">
            <User className="h-4 w-4 mr-1.5" /> Profile
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-1.5" /> Notifications
          </TabsTrigger>
          {isPriv && (
            <TabsTrigger value="security">
              <Shield className="h-4 w-4 mr-1.5" /> Security
            </TabsTrigger>
          )}
        </TabsList>

        {/* Appearance / Theme */}
        <TabsContent value="appearance">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Application Theme</CardTitle>
                <CardDescription>Choose a color theme for the Cloudaeon Tracker interface</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {themes.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTheme(t.id)}
                      className={`relative p-4 rounded-xl border-2 text-left transition-all hover:shadow-md ${
                        theme === t.id
                          ? 'border-primary shadow-md ring-2 ring-primary/20'
                          : 'border-border hover:border-primary/40'
                      }`}
                    >
                      {theme === t.id && (
                        <div className="absolute top-2 right-2">
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                        </div>
                      )}
                      {/* Color preview */}
                      <div className="flex gap-1.5 mb-3">
                        <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: t.preview }} />
                        <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: t.preview, opacity: 0.5 }} />
                        <div className="w-8 h-8 rounded-lg bg-muted" />
                      </div>
                      <p className="text-sm font-semibold text-foreground">{t.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  Theme is saved automatically and persists across sessions.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Display Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Compact Mode</p>
                    <p className="text-xs text-muted-foreground">Reduce spacing for denser content</p>
                  </div>
                  <button className="relative w-11 h-6 bg-muted rounded-full transition-colors hover:bg-muted/80">
                    <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform" />
                  </button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Sidebar Collapsed by Default</p>
                    <p className="text-xs text-muted-foreground">Start with a collapsed navigation sidebar</p>
                  </div>
                  <button className="relative w-11 h-6 bg-muted rounded-full transition-colors hover:bg-muted/80">
                    <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform" />
                  </button>
                </div>
                <Separator />
                <div className="space-y-1.5">
                  <Label>Date Format</Label>
                  <Select className="w-48">
                    <option value="dd-mmm-yyyy">DD MMM YYYY (08 May 2025)</option>
                    <option value="mm/dd/yyyy">MM/DD/YYYY</option>
                    <option value="dd/mm/yyyy">DD/MM/YYYY</option>
                    <option value="yyyy-mm-dd">YYYY-MM-DD</option>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Currency Display</Label>
                  <Select className="w-48">
                    <option value="INR">₹ Indian Rupee (INR)</option>
                    <option value="USD">$ US Dollar (USD)</option>
                    <option value="EUR">€ Euro (EUR)</option>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Profile */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Profile Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <Avatar name={user?.name ?? ''} src={user?.avatar} size="xl" />
                <div>
                  <p className="font-semibold">{user?.name}</p>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                  <Button variant="outline" size="sm" className="mt-2">Change Avatar</Button>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>First Name</Label>
                  <Input defaultValue={emp?.firstName ?? ''} />
                </div>
                <div className="space-y-1.5">
                  <Label>Last Name</Label>
                  <Input defaultValue={emp?.lastName ?? ''} />
                </div>
                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <Input type="email" defaultValue={emp?.email ?? ''} disabled className="bg-muted/50" />
                </div>
                <div className="space-y-1.5">
                  <Label>Phone</Label>
                  <Input type="tel" defaultValue={emp?.phone ?? ''} />
                </div>
                <div className="space-y-1.5">
                  <Label>Job Title</Label>
                  <Input defaultValue={emp?.jobTitle ?? ''} disabled={!isPriv} className={!isPriv ? 'bg-muted/50' : ''} />
                </div>
                <div className="space-y-1.5">
                  <Label>Department</Label>
                  <Input defaultValue={emp?.department ?? ''} disabled className="bg-muted/50" />
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={handleSave} className="gap-2">
                  {saved ? <><CheckCircle2 className="h-4 w-4" />Saved!</> : 'Save Changes'}
                </Button>
                <Button variant="outline">Cancel</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Notification Preferences</CardTitle>
              <CardDescription>Control which notifications you receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'leaveApproval' as const, label: 'Leave Approval Updates', desc: 'When your leave is approved or rejected' },
                { key: 'payslipReady' as const, label: 'Payslip Ready', desc: 'When your monthly payslip is generated' },
                { key: 'attendanceAlert' as const, label: 'Attendance Alerts', desc: 'Reminders if attendance is not marked by noon' },
                { key: 'performanceReview' as const, label: 'Performance Reviews', desc: 'When a new review is submitted for you' },
                { key: 'teamUpdates' as const, label: 'Team Updates', desc: 'When team members join or leave' },
              ].map((item) => (
                <div key={item.key}>
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <button
                      onClick={() => setNotifications((n) => ({ ...n, [item.key]: !n[item.key] }))}
                      className={`relative w-11 h-6 rounded-full transition-colors ${notifications[item.key] ? 'bg-primary' : 'bg-muted'}`}
                    >
                      <div
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${notifications[item.key] ? 'translate-x-5' : 'translate-x-1'}`}
                      />
                    </button>
                  </div>
                  <Separator />
                </div>
              ))}
              <Button onClick={handleSave} className="gap-2 mt-2">
                {saved ? <><CheckCircle2 className="h-4 w-4" />Saved!</> : 'Save Preferences'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security (HR/Admin only) */}
        {isPriv && (
          <TabsContent value="security">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Change Password</CardTitle>
                  <CardDescription>Update your account password</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 max-w-sm">
                  <div className="space-y-1.5">
                    <Label>Current Password</Label>
                    <Input type="password" placeholder="••••••••" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>New Password</Label>
                    <Input type="password" placeholder="••••••••" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Confirm New Password</Label>
                    <Input type="password" placeholder="••••••••" />
                  </div>
                  <Button>Update Password</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Organization Settings</CardTitle>
                  <CardDescription>Global configuration for Cloudaeon Tracker</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label>Organization Name</Label>
                      <Input defaultValue="Cloudaeon Technologies" />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Financial Year Start</Label>
                      <Select>
                        <option value="april">April (India)</option>
                        <option value="january">January</option>
                        <option value="july">July</option>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Annual Leave Days</Label>
                      <Input type="number" defaultValue={18} min={0} max={365} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Sick Leave Days</Label>
                      <Input type="number" defaultValue={12} min={0} max={365} />
                    </div>
                  </div>
                  <Button onClick={handleSave} className="gap-2">
                    {saved ? <><CheckCircle2 className="h-4 w-4" />Saved!</> : 'Save Settings'}
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-destructive/30 bg-destructive/5">
                <CardHeader>
                  <CardTitle className="text-base text-destructive">Danger Zone</CardTitle>
                  <CardDescription>Irreversible actions — proceed with caution</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between p-3 border border-destructive/30 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Reset All Data</p>
                      <p className="text-xs text-muted-foreground">This will reset all employee and payroll data to demo state</p>
                    </div>
                    <Button variant="destructive" size="sm" onClick={() => alert('This is a demo — no data to reset')}>Reset</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
