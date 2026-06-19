import { Resend } from "resend"
import * as templates from "./templates"

const resend = new Resend(process.env.RESEND_API_KEY)
const fromEmail = process.env.RESEND_FROM_EMAIL || "noreply@providerpost.com"

// BUG FIX: Validate email format
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// BUG FIX: Validate config on load
if (!process.env.RESEND_API_KEY) {
  console.error("FATAL: RESEND_API_KEY not set in environment")
}

export interface SendEmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export interface SendEmailResult {
  success: boolean
  id?: string
  error?: string
}

/**
 * BUG FIX: Validate email address before sending
 */
function validateEmail(email: string): boolean {
  return EMAIL_REGEX.test(email)
}

/**
 * BUG FIX: Escape HTML to prevent XSS
 */
function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  }
  return text.replace(/[&<>"']/g, (m) => map[m])
}

/**
 * BUG FIX: Add retry logic with exponential backoff
 */
async function sendWithRetry(
  options: SendEmailOptions,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<SendEmailResult> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await resend.emails.send({
        from: fromEmail,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      })

      if (result.data?.id) {
        return { success: true, id: result.data.id }
      }

      if (result.error) {
        // Only retry on transient errors
        if (result.error.message?.includes("timeout") && attempt < maxRetries) {
          await new Promise((r) => setTimeout(r, delayMs * attempt))
          continue
        }
        return {
          success: false,
          error: `Email send failed: ${result.error.message}`,
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      if (attempt === maxRetries) {
        return { success: false, error: `Email send failed after ${maxRetries} attempts: ${message}` }
      }
      // Retry on network errors
      await new Promise((r) => setTimeout(r, delayMs * attempt))
    }
  }

  return { success: false, error: "Email send failed: max retries exceeded" }
}

/**
 * Send raw email with validation
 */
export async function sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  // BUG FIX: Validate email
  if (!validateEmail(options.to)) {
    return { success: false, error: "Invalid email address" }
  }

  if (!options.subject || !options.html) {
    return { success: false, error: "Missing subject or HTML" }
  }

  return sendWithRetry(options)
}

/**
 * Send welcome email with XSS protection
 */
export async function sendWelcomeEmail(
  email: string,
  name: string
): Promise<SendEmailResult> {
  // BUG FIX: Escape name to prevent XSS
  const safeName = escapeHtml(name)
  const template = templates.welcomeEmailTemplate(safeName)

  return sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
    text: template.text,
  })
}

/**
 * Send ad submission confirmation
 */
export async function sendAdSubmissionEmail(
  email: string,
  providerName: string,
  adTitle: string
): Promise<SendEmailResult> {
  const safeName = escapeHtml(providerName)
  const safeTitle = escapeHtml(adTitle)
  const template = templates.adSubmissionConfirmationTemplate(safeName, safeTitle)

  return sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
    text: template.text,
  })
}

/**
 * Send ad approved email
 */
export async function sendAdApprovedEmail(
  email: string,
  providerName: string,
  adTitle: string,
  adUrl: string
): Promise<SendEmailResult> {
  // BUG FIX: Validate URL
  try {
    new URL(adUrl)
  } catch {
    return { success: false, error: "Invalid ad URL" }
  }

  const safeName = escapeHtml(providerName)
  const safeTitle = escapeHtml(adTitle)
  const template = templates.adApprovedTemplate(safeName, safeTitle, adUrl)

  return sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
    text: template.text,
  })
}

/**
 * Send ad rejected email
 */
export async function sendAdRejectedEmail(
  email: string,
  providerName: string,
  adTitle: string,
  reason: string
): Promise<SendEmailResult> {
  const safeName = escapeHtml(providerName)
  const safeTitle = escapeHtml(adTitle)
  const safeReason = escapeHtml(reason)
  const template = templates.adRejectedTemplate(safeName, safeTitle, safeReason)

  return sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
    text: template.text,
  })
}

/**
 * Send payment receipt
 */
export async function sendPaymentReceiptEmail(
  email: string,
  providerName: string,
  planName: string,
  amount: number,
  currency: string,
  expiryDate: string
): Promise<SendEmailResult> {
  // BUG FIX: Validate amount is positive
  if (amount <= 0) {
    return { success: false, error: "Invalid payment amount" }
  }

  const safeName = escapeHtml(providerName)
  const safePlan = escapeHtml(planName)
  const template = templates.paymentReceiptTemplate(
    safeName,
    safePlan,
    amount,
    currency,
    expiryDate
  )

  return sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
    text: template.text,
  })
}

/**
 * Send renewal reminder
 */
export async function sendRenewalReminderEmail(
  email: string,
  providerName: string,
  expiryDate: string,
  renewalUrl: string
): Promise<SendEmailResult> {
  // BUG FIX: Validate URL
  try {
    new URL(renewalUrl)
  } catch {
    return { success: false, error: "Invalid renewal URL" }
  }

  const safeName = escapeHtml(providerName)
  const template = templates.renewalReminderTemplate(safeName, expiryDate, renewalUrl)

  return sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
    text: template.text,
  })
}

/**
 * Send renewal final notice
 */
export async function sendRenewalFinalNoticeEmail(
  email: string,
  providerName: string,
  expiryDate: string,
  renewalUrl: string
): Promise<SendEmailResult> {
  try {
    new URL(renewalUrl)
  } catch {
    return { success: false, error: "Invalid renewal URL" }
  }

  const safeName = escapeHtml(providerName)
  const template = templates.renewalFinalNoticeTemplate(safeName, expiryDate, renewalUrl)

  return sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
    text: template.text,
  })
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  name: string,
  resetUrl: string
): Promise<SendEmailResult> {
  try {
    new URL(resetUrl)
  } catch {
    return { success: false, error: "Invalid reset URL" }
  }

  const safeName = escapeHtml(name)
  const template = templates.passwordResetTemplate(safeName, resetUrl)

  return sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
    text: template.text,
  })
}

/**
 * Send photo rejection email
 */
export async function sendPhotoRejectionEmail(
  email: string,
  providerName: string,
  adTitle: string,
  photoCount: number,
  reason: string
): Promise<SendEmailResult> {
  // BUG FIX: Validate photoCount
  if (photoCount <= 0 || photoCount > 6) {
    return { success: false, error: "Invalid photo count" }
  }

  const safeName = escapeHtml(providerName)
  const safeTitle = escapeHtml(adTitle)
  const safeReason = escapeHtml(reason)
  const template = templates.photoRejectionTemplate(
    safeName,
    safeTitle,
    photoCount,
    safeReason
  )

  return sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
    text: template.text,
  })
}

/**
 * Send verification success email
 */
export async function sendVerificationSuccessEmail(
  email: string,
  providerName: string,
  verificationType: string
): Promise<SendEmailResult> {
  const safeName = escapeHtml(providerName)
  const safeType = escapeHtml(verificationType)
  const template = templates.verificationSuccessTemplate(safeName, safeType)

  return sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
    text: template.text,
  })
}
