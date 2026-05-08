'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { canApproveLeave } from '@/lib/auth'
import { DEMO_LEAVES } from '@/lib/mock-data'
import { getStatusColor, getLeaveTypeColor, formatDate } from '@/lib/utils'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { PageHeader } from '@/components/layout/DashboardShell'
import { CheckCircle2, XCircle, Clock, MessageSquare, CalendarDays } from 'lucide-react'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

export default function LeaveApprovalsPage() {
  const { user } = useAuth()
  const router = useRouter()

  if (!canApproveLeave(user?.role ?? 'EMPLOYEE')) {
    router.replace('/leave')
    return null
  }

  const [leaves, setLeaves] = useState(DEMO_LEAVES)
  const [actionDialog, setActionDialog] = useState<{ leaveId: string; action: 'APPROVED' | 'REJECTED' } | null>(null)
  const [note, setNote] = useState('')

  const pending = useMemo(() => leaves.filter((l) => l.status === 'PENDING'), [leaves])
  const approved = useMemo(() => leaves.filter((l) => l.status === 'APPROVED'), [leaves])
  const rejected = useMemo(() => leaves.filter((l) => l.status === 'REJECTED'), [leaves])

  function handleAction() {
    if (!actionDialog) return
    setLeaves((prev) => prev.map((l) =>
      l.id === actionDialog.leaveId
        ? { ...l, status: actionDialog.action, approverName: user?.name, approvedAt: new Date().toISOString().split('T')[0], notes: note }
        : l
    ))
    setActionDialog(null)
    setNote('')
  }

  function LeaveCard({ leave, showActions }: { leave: typeof DEMO_LEAVES[number]; showActions?: boolean }) {
    return (
      <div className="flex items-start gap-4 p-4 rounded-xl border border-border hover:bg-muted/20 transition-colors">
        <Avatar name={leave.employeeName} size="md" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-semibold text-sm">{leave.employeeName}</span>
            <span className="text-xs text-muted-foreground">{leave.department}</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${getLeaveTypeColor(leave.type)}`}>{leave.type}</span>
            <span className="text-xs font-medium text-foreground">{leave.days} day{leave.days > 1 ? 's' : ''}</span>
            <span className="text-xs text-muted-foreground">{formatDate(leave.startDate)} – {formatDate(leave.endDate)}</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1.5">{leave.reason}</p>
          {leave.notes && (
            <div className="mt-2 flex items-start gap-1.5 text-xs text-blue-600 bg-blue-50 rounded px-2 py-1.5">
              <MessageSquare className="h-3 w-3 mt-0.5 flex-shrink-0" />
              {leave.approverName}: {leave.notes}
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-1.5">Applied: {formatDate(leave.createdAt)}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${getStatusColor(leave.status)}`}>
            {leave.status}
          </span>
          {showActions && (
            <div className="flex gap-1.5">
              <Button
                size="icon-sm"
                variant="success"
                onClick={() => { setActionDialog({ leaveId: leave.id, action: 'APPROVED' }); setNote('') }}
                title="Approve"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="icon-sm"
                variant="destructive"
                onClick={() => { setActionDialog({ leaveId: leave.id, action: 'REJECTED' }); setNote('') }}
                title="Reject"
              >
                <XCircle className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>
      </div>
    )
  }

  const selectedLeave = leaves.find((l) => l.id === actionDialog?.leaveId)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leave Approvals"
        description="Review and action pending leave requests"
      >
        {pending.length > 0 && (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 px-3 py-1.5 rounded-lg text-sm font-medium">
            <Clock className="h-4 w-4" />
            {pending.length} pending
          </div>
        )}
      </PageHeader>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({pending.length})
          </TabsTrigger>
          <TabsTrigger value="approved">Approved ({approved.length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({rejected.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card>
            <CardContent className="pt-4">
              {pending.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto mb-3" />
                  <p className="font-medium text-foreground">All caught up!</p>
                  <p className="text-sm text-muted-foreground">No pending leave requests.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pending.map((l) => <LeaveCard key={l.id} leave={l} showActions />)}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approved">
          <Card>
            <CardContent className="pt-4 space-y-3">
              {approved.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No approved requests.</p>
              ) : approved.map((l) => <LeaveCard key={l.id} leave={l} />)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rejected">
          <Card>
            <CardContent className="pt-4 space-y-3">
              {rejected.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No rejected requests.</p>
              ) : rejected.map((l) => <LeaveCard key={l.id} leave={l} />)}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action dialog */}
      <Dialog open={!!actionDialog} onClose={() => setActionDialog(null)}>
        <DialogHeader onClose={() => setActionDialog(null)}>
          <DialogTitle>
            {actionDialog?.action === 'APPROVED' ? '✅ Approve' : '❌ Reject'} Leave Request
          </DialogTitle>
        </DialogHeader>
        <DialogContent>
          {selectedLeave && (
            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-3 text-sm">
                <p><span className="font-medium">{selectedLeave.employeeName}</span> · {selectedLeave.type}</p>
                <p className="text-muted-foreground">{selectedLeave.days} days · {formatDate(selectedLeave.startDate)} – {formatDate(selectedLeave.endDate)}</p>
                <p className="text-muted-foreground mt-1">{selectedLeave.reason}</p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="approverNote">Add a note (optional)</Label>
                <textarea
                  id="approverNote"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder={actionDialog?.action === 'APPROVED' ? 'e.g. Have a great time!' : 'e.g. Team workload is high next week'}
                  rows={2}
                  className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                />
              </div>
            </div>
          )}
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onClick={() => setActionDialog(null)}>Cancel</Button>
          <Button
            variant={actionDialog?.action === 'APPROVED' ? 'success' : 'destructive'}
            onClick={handleAction}
          >
            {actionDialog?.action === 'APPROVED' ? 'Approve Leave' : 'Reject Leave'}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  )
}
