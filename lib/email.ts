import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
const FROM = process.env.RESEND_FROM_EMAIL ?? 'noreply@cloudaeon.com'

interface LeaveStatusEmailPayload {
  to: string
  employeeName: string
  leaveType: string
  startDate: string
  endDate: string
  days: number
  status: 'APPROVED' | 'REJECTED'
  approverName: string
  note?: string
}

function buildLeaveEmailHtml(p: LeaveStatusEmailPayload): string {
  const isApproved = p.status === 'APPROVED'
  const statusColor = isApproved ? '#065f46' : '#991b1b'
  const statusBg = isApproved ? '#d1fae5' : '#fee2e2'
  const statusLabel = isApproved ? 'Approved ✅' : 'Rejected ❌'

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Leave Request ${p.status}</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Inter,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#2563eb,#4f46e5);padding:32px;text-align:center;">
            <div style="width:48px;height:48px;background:rgba(255,255,255,0.2);border-radius:12px;display:inline-flex;align-items:center;justify-content:center;margin-bottom:12px;">
              <span style="color:white;font-size:24px;font-weight:bold;">C</span>
            </div>
            <h1 style="color:white;margin:0;font-size:22px;font-weight:700;">Cloudaeon Technologies</h1>
            <p style="color:rgba(255,255,255,0.75);margin:4px 0 0;font-size:14px;">Leave Request Update</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px;">
            <p style="color:#1e293b;font-size:16px;margin:0 0 8px;">Hi <strong>${p.employeeName}</strong>,</p>
            <p style="color:#475569;font-size:14px;margin:0 0 24px;">
              Your <strong>${p.leaveType.toLowerCase().replace('_', ' ')}</strong> leave request has been
              reviewed by <strong>${p.approverName}</strong>.
            </p>

            <!-- Status banner -->
            <div style="background:${statusBg};border-radius:10px;padding:14px 20px;text-align:center;margin-bottom:24px;">
              <span style="color:${statusColor};font-size:20px;font-weight:700;">${statusLabel}</span>
            </div>

            <!-- Detail table -->
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:10px;overflow:hidden;">
              <tr style="background:#f8fafc;">
                <td style="padding:10px 16px;color:#64748b;font-size:13px;font-weight:600;width:40%;">Leave Type</td>
                <td style="padding:10px 16px;color:#1e293b;font-size:13px;">${p.leaveType}</td>
              </tr>
              <tr>
                <td style="padding:10px 16px;color:#64748b;font-size:13px;font-weight:600;border-top:1px solid #e2e8f0;">From</td>
                <td style="padding:10px 16px;color:#1e293b;font-size:13px;border-top:1px solid #e2e8f0;">${p.startDate}</td>
              </tr>
              <tr style="background:#f8fafc;">
                <td style="padding:10px 16px;color:#64748b;font-size:13px;font-weight:600;border-top:1px solid #e2e8f0;">To</td>
                <td style="padding:10px 16px;color:#1e293b;font-size:13px;border-top:1px solid #e2e8f0;">${p.endDate}</td>
              </tr>
              <tr>
                <td style="padding:10px 16px;color:#64748b;font-size:13px;font-weight:600;border-top:1px solid #e2e8f0;">Working Days</td>
                <td style="padding:10px 16px;color:#1e293b;font-size:13px;border-top:1px solid #e2e8f0;">${p.days} day${p.days !== 1 ? 's' : ''}</td>
              </tr>
              ${p.note ? `
              <tr style="background:#f8fafc;">
                <td style="padding:10px 16px;color:#64748b;font-size:13px;font-weight:600;border-top:1px solid #e2e8f0;">Manager Note</td>
                <td style="padding:10px 16px;color:#1e293b;font-size:13px;border-top:1px solid #e2e8f0;font-style:italic;">"${p.note}"</td>
              </tr>` : ''}
            </table>

            <p style="color:#475569;font-size:14px;margin:24px 0 0;">
              ${isApproved
                ? '🎉 Your leave is confirmed. Enjoy your time off and recharge!'
                : '❓ If you have questions about this decision, please reach out to your manager or HR at <a href="mailto:hr@cloudaeon.com" style="color:#2563eb;">hr@cloudaeon.com</a>.'}
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f8fafc;padding:20px 32px;border-top:1px solid #e2e8f0;text-align:center;">
            <p style="color:#94a3b8;font-size:12px;margin:0;">
              Cloudaeon Employee Management Tool (CEMT) &nbsp;·&nbsp; © 2025 Cloudaeon Technologies<br/>
              This is an automated notification. Please do not reply to this email.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

export async function sendLeaveStatusEmail(payload: LeaveStatusEmailPayload): Promise<void> {
  if (!resend) {
    // Demo mode — log instead of sending
    console.log('[CEMT Email - Demo] Would send to:', payload.to, '| Status:', payload.status)
    return
  }

  const subject = payload.status === 'APPROVED'
    ? `✅ Leave Approved — ${payload.leaveType} (${payload.days} days)`
    : `❌ Leave Rejected — ${payload.leaveType} (${payload.days} days)`

  await resend.emails.send({
    from: FROM,
    to: payload.to,
    subject,
    html: buildLeaveEmailHtml(payload),
  })
}
