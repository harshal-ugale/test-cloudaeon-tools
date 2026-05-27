/**
 * Email sending helper using Resend.
 *
 * If RESEND_API_KEY is not set (demo / local dev), the activation link is
 * returned in the response body so the developer / tester can activate
 * accounts without a real mail server.
 */

import { Resend } from 'resend'

const API_KEY    = process.env.RESEND_API_KEY ?? ''
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? 'noreply@cloudaeon.com'
const APP_URL    = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
const ORG_NAME   = process.env.NEXT_PUBLIC_ORG_NAME ?? 'Cloudaeon Technologies'

export interface SendActivationResult {
  sent: boolean          // true = Resend API used
  demoLink?: string      // returned when API key is absent (demo mode)
}

/**
 * Send an account activation email.
 * Returns { sent: true } when the email was dispatched via Resend.
 * Returns { sent: false, demoLink } when no API key is configured so the
 * caller can surface the link in the UI for demo purposes.
 */
export async function sendActivationEmail(
  toEmail: string,
  activationToken: string
): Promise<SendActivationResult> {
  const activationUrl = `${APP_URL}/activate?token=${activationToken}`

  // ── Demo / local mode ─────────────────────────────────────────────────────
  if (!API_KEY) {
    console.log(
      '\n[CEMT - Email skipped: no RESEND_API_KEY]\n' +
      `Activation link for ${toEmail}:\n${activationUrl}\n`
    )
    return { sent: false, demoLink: activationUrl }
  }

  // ── Production: send via Resend ───────────────────────────────────────────
  const resend = new Resend(API_KEY)
  const year   = new Date().getFullYear()

  const htmlBody = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Activate your account</title>
</head>
<body style="margin:0;padding:0;background:#0f172a;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;min-height:100vh;">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table width="560" cellpadding="0" cellspacing="0"
               style="background:#1e293b;border-radius:16px;border:1px solid #334155;overflow:hidden;">
          <tr>
            <td style="background:linear-gradient(135deg,#1d4ed8,#4338ca);padding:32px;text-align:center;">
              <div style="display:inline-block;width:52px;height:52px;background:rgba(255,255,255,0.15);border-radius:12px;line-height:52px;font-size:28px;font-weight:700;color:#fff;margin-bottom:12px;">C</div>
              <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;">${ORG_NAME}</h1>
              <p style="margin:4px 0 0;color:rgba(255,255,255,0.7);font-size:13px;">Cloudaeon Employee Management Tracker</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <h2 style="margin:0 0 8px;color:#f1f5f9;font-size:20px;">Activate your account</h2>
              <p style="margin:0 0 24px;color:#94a3b8;font-size:14px;line-height:1.6;">
                Welcome to Cloudaeon Tracker! Click the button below to activate your account.
                This link is valid for <strong style="color:#e2e8f0;">24 hours</strong>.
              </p>
              <table cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
                <tr>
                  <td style="background:linear-gradient(135deg,#2563eb,#4338ca);border-radius:10px;padding:14px 36px;text-align:center;">
                    <a href="${activationUrl}" style="color:#fff;text-decoration:none;font-size:15px;font-weight:600;display:block;">Activate Account</a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 8px;color:#64748b;font-size:12px;text-align:center;">Or copy &amp; paste this link into your browser:</p>
              <p style="margin:0 0 24px;background:#0f172a;border-radius:8px;padding:10px 14px;color:#60a5fa;font-size:11px;word-break:break-all;text-align:center;">${activationUrl}</p>
              <hr style="border:none;border-top:1px solid #334155;margin:0 0 20px;" />
              <p style="margin:0;color:#475569;font-size:12px;line-height:1.5;">
                If you did not register, you can safely ignore this email.<br />
                For help contact <a href="mailto:hr@cloudaeon.com" style="color:#60a5fa;text-decoration:none;">hr@cloudaeon.com</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 32px;background:#0f172a;border-top:1px solid #1e293b;text-align:center;">
              <p style="margin:0;color:#334155;font-size:11px;">&copy; ${year} ${ORG_NAME} &middot; CEMT v1.0</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to:   toEmail,
      subject: `Activate your ${ORG_NAME} account`,
      html: htmlBody,
    })
    return { sent: true }
  } catch (err) {
    console.error('[CEMT] Resend error:', err)
    return { sent: false, demoLink: activationUrl }
  }
}

// ─── Leave status notification ────────────────────────────────────────────────

export interface LeaveStatusEmailParams {
  to:           string
  employeeName: string
  leaveType:    string
  startDate:    string
  endDate:      string
  days:         number
  status:       'APPROVED' | 'REJECTED'
  approverName: string
  note?:        string
}

/**
 * Send a leave approval / rejection notification email.
 * Silently skips in demo mode (no API key).
 */
export async function sendLeaveStatusEmail(params: LeaveStatusEmailParams): Promise<void> {
  if (!API_KEY) {
    console.log(`[CEMT - Email skipped] Leave ${params.status} for ${params.to}`)
    return
  }

  const resend     = new Resend(API_KEY)
  const isApproved = params.status === 'APPROVED'
  const color      = isApproved ? '#10b981' : '#ef4444'
  const label      = isApproved ? 'Approved ✓' : 'Rejected ✗'
  const year       = new Date().getFullYear()

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /><title>Leave ${label}</title></head>
<body style="margin:0;padding:0;background:#0f172a;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;">
    <tr><td align="center" style="padding:40px 20px;">
      <table width="520" cellpadding="0" cellspacing="0"
             style="background:#1e293b;border-radius:16px;border:1px solid #334155;overflow:hidden;">
        <tr>
          <td style="background:${color};padding:24px 32px;">
            <h1 style="margin:0;color:#fff;font-size:20px;">Leave Request ${label}</h1>
            <p style="margin:4px 0 0;color:rgba(255,255,255,0.8);font-size:13px;">${ORG_NAME}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:28px 32px;color:#94a3b8;font-size:14px;line-height:1.7;">
            <p style="margin:0 0 16px;">Hi <strong style="color:#f1f5f9;">${params.employeeName}</strong>,</p>
            <p style="margin:0 0 20px;">Your leave request has been <strong style="color:${color};">${label.toLowerCase()}</strong>.</p>
            <table style="background:#0f172a;border-radius:10px;padding:16px;width:100%;border-collapse:collapse;">
              <tr><td style="padding:4px 0;color:#64748b;font-size:12px;">Type</td><td style="padding:4px 0;color:#e2e8f0;font-size:12px;">${params.leaveType}</td></tr>
              <tr><td style="padding:4px 0;color:#64748b;font-size:12px;">From</td><td style="padding:4px 0;color:#e2e8f0;font-size:12px;">${params.startDate}</td></tr>
              <tr><td style="padding:4px 0;color:#64748b;font-size:12px;">To</td><td style="padding:4px 0;color:#e2e8f0;font-size:12px;">${params.endDate}</td></tr>
              <tr><td style="padding:4px 0;color:#64748b;font-size:12px;">Days</td><td style="padding:4px 0;color:#e2e8f0;font-size:12px;">${params.days}</td></tr>
              <tr><td style="padding:4px 0;color:#64748b;font-size:12px;">By</td><td style="padding:4px 0;color:#e2e8f0;font-size:12px;">${params.approverName}</td></tr>
              ${params.note ? `<tr><td style="padding:4px 0;color:#64748b;font-size:12px;">Note</td><td style="padding:4px 0;color:#e2e8f0;font-size:12px;">${params.note}</td></tr>` : ''}
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 32px;background:#0f172a;border-top:1px solid #1e293b;text-align:center;">
            <p style="margin:0;color:#334155;font-size:11px;">&copy; ${year} ${ORG_NAME} &middot; CEMT v1.0</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

  await resend.emails.send({
    from:    FROM_EMAIL,
    to:      params.to,
    subject: `Leave request ${label} — ${ORG_NAME}`,
    html,
  })
}