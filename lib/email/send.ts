import { Resend } from "resend"
import * as templates from "./templates"

const resend = new Resend(process.env.RESEND_API_KEY)
const fromEmail = process.env.RESEND_FROM_EMAIL || "noreply@providerpost.com"

export interface SendEmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

/**
 * Send raw email
 */
export async function sendEmail(options: SendEmailOptions) {
  try {
    const result = await resend.emails.send({
      from: fromEmail,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    })

    return { success: true, id: result.data?.id }
  } catch (error) {
    console.error("Email send error:", error)
    return { success: false, error }
  }
}

/**
 * Send welcome email
 */
export async function sendWelcomeEmail(email: string, name: string) {
  const template = templates.welcomeEmailTemplate(name)
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
) {
  const template = templates.adSubmissionConfirmationTemplate(providerName, adTitle)
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
) {
  const template = templates.adApprovedTemplate(providerName, adTitle, adUrl)
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
) {
  const template = templates.adRejectedTemplate(providerName, adTitle, reason)
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
) {
  const template = templates.paymentReceiptTemplate(
    providerName,
    planName,
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
 * Send renewal reminder (7 days before expiry)
 */
export async function sendRenewalReminderEmail(
  email: string,
  providerName: string,
  expiryDate: string,
  renewalUrl: string
) {
  const template = templates.renewalReminderTemplate(
    providerName,
    expiryDate,
    renewalUrl
  )
  return sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
    text: template.text,
  })
}

/**
 * Send renewal final notice (1 day before expiry)
 */
export async function sendRenewalFinalNoticeEmail(
  email: string,
  providerName: string,
  expiryDate: string,
  renewalUrl: string
) {
  const template = templates.renewalFinalNoticeTemplate(
    providerName,
    expiryDate,
    renewalUrl
  )
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
) {
  const template = templates.passwordResetTemplate(name, resetUrl)
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
) {
  const template = templates.photoRejectionTemplate(
    providerName,
    adTitle,
    photoCount,
    reason
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
) {
  const template = templates.verificationSuccessTemplate(
    providerName,
    verificationType
  )
  return sendEmail({
    to: email,
    subject: template.subject,
    html: template.html,
    text: template.text,
  })
}
