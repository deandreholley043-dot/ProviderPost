import { ReactNode } from "react"

export interface EmailTemplate {
  subject: string
  html: string
  text: string
}

/**
 * Email template for new user signup
 */
export function welcomeEmailTemplate(name: string): EmailTemplate {
  return {
    subject: "Welcome to ProviderPost - Get Started Today",
    text: `Hi ${name},\n\nWelcome to ProviderPost! Your account has been created successfully.\n\nNext steps:\n1. Complete your profile\n2. Post your first ad\n3. Start getting client contacts\n\nLog in: https://providerpost.com/login\n\nQuestions? Contact us at support@providerpost.com`,
    html: `
      <h1>Welcome to ProviderPost, ${name}!</h1>
      <p>Your account has been created successfully.</p>
      
      <h2>Next Steps:</h2>
      <ol>
        <li>Complete your profile</li>
        <li>Post your first ad</li>
        <li>Start getting client contacts</li>
      </ol>
      
      <p><a href="https://providerpost.com/login" style="background: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Log In Now</a></p>
      
      <hr>
      <p>Questions? <a href="mailto:support@providerpost.com">Contact support</a></p>
    `,
  }
}

export function adSubmissionConfirmationTemplate(
  providerName: string,
  adTitle: string
): EmailTemplate {
  return {
    subject: "Your Ad Has Been Submitted for Review",
    text: `Hi ${providerName},\n\nYour ad "${adTitle}" has been submitted and is awaiting admin review.\n\nYou'll receive an email within 24 hours with the status update.\n\nView your ads: https://providerpost.com/user/my-ads`,
    html: `
      <h1>Ad Submitted for Review</h1>
      <p>Hi ${providerName},</p>
      <p>Your ad <strong>"${adTitle}"</strong> has been submitted and is awaiting admin review.</p>
      <p>You'll receive an email within 24 hours with the status update.</p>
      <p><a href="https://providerpost.com/user/my-ads" style="background: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Your Ads</a></p>
    `,
  }
}

export function adApprovedTemplate(
  providerName: string,
  adTitle: string,
  adUrl: string
): EmailTemplate {
  return {
    subject: `Your Ad "${adTitle}" Is Now Live!`,
    text: `Hi ${providerName},\n\nGreat news! Your ad "${adTitle}" has been approved and is now live.\n\nClients can now see your ad when they search.\n\nView ad: ${adUrl}\n\nManage ads: https://providerpost.com/user/my-ads`,
    html: `
      <h1>✅ Your Ad Is Live!</h1>
      <p>Hi ${providerName},</p>
      <p>Great news! Your ad <strong>"${adTitle}"</strong> has been approved and is now live on ProviderPost.</p>
      <p>Clients can now see your ad when they search. Get ready for inquiries!</p>
      <p><a href="${adUrl}" style="background: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Your Ad</a></p>
    `,
  }
}

export function adRejectedTemplate(
  providerName: string,
  adTitle: string,
  reason: string
): EmailTemplate {
  return {
    subject: `Your Ad "${adTitle}" Needs Changes`,
    text: `Hi ${providerName},\n\nYour ad "${adTitle}" was rejected for the following reason:\n\n${reason}\n\nPlease make the necessary changes and resubmit.\n\nEdit ad: https://providerpost.com/post?edit=[ID]\n\nNeed help? Contact support@providerpost.com`,
    html: `
      <h1>Ad Review Feedback</h1>
      <p>Hi ${providerName},</p>
      <p>Your ad <strong>"${adTitle}"</strong> needs some adjustments:</p>
      <div style="background: #fef3c7; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Reason:</strong> ${reason}</p>
      </div>
      <p>Please make the necessary changes and resubmit.</p>
      <p><a href="https://providerpost.com/post" style="background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Edit Your Ad</a></p>
    `,
  }
}

export function paymentReceiptTemplate(
  providerName: string,
  planName: string,
  amount: number,
  currency: string,
  expiryDate: string
): EmailTemplate {
  return {
    subject: `Your ${planName} Subscription Receipt`,
    text: `Hi ${providerName},\n\nThank you for your payment!\n\nPlan: ${planName}\nAmount: ${currency} ${amount.toFixed(2)}\nExpires: ${expiryDate}\n\nYour subscription is now active.\n\nView subscription: https://providerpost.com/user/subscription`,
    html: `
      <h1>Payment Confirmed ✅</h1>
      <p>Hi ${providerName},</p>
      <p>Thank you for your payment!</p>
      <table style="width: 100%; max-width: 400px; margin: 20px 0; border-collapse: collapse;">
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 10px; text-align: right;"><strong>Plan:</strong></td>
          <td style="padding: 10px;">${planName}</td>
        </tr>
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 10px; text-align: right;"><strong>Amount:</strong></td>
          <td style="padding: 10px;">${currency} ${amount.toFixed(2)}</td>
        </tr>
        <tr>
          <td style="padding: 10px; text-align: right;"><strong>Expires:</strong></td>
          <td style="padding: 10px;">${expiryDate}</td>
        </tr>
      </table>
      <p>Your subscription is now active and your ads are live!</p>
      <p><a href="https://providerpost.com/user/subscription" style="background: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Subscription</a></p>
    `,
  }
}

export function renewalReminderTemplate(
  providerName: string,
  expiryDate: string,
  renewalUrl: string
): EmailTemplate {
  return {
    subject: "Your ProviderPost Subscription Expires in 7 Days",
    text: `Hi ${providerName},\n\nYour subscription expires on ${expiryDate}. Renew now to keep your ads live!\n\nRenew subscription: ${renewalUrl}\n\nDon't lose visibility - renew today!`,
    html: `
      <h1>Subscription Expiring Soon</h1>
      <p>Hi ${providerName},</p>
      <p>Your subscription expires on <strong>${expiryDate}</strong>.</p>
      <p>Renew now to keep your ads live and continue getting client inquiries!</p>
      <p><a href="${renewalUrl}" style="background: #f59e0b; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Renew Now</a></p>
      <hr>
      <p style="font-size: 12px; color: #666;">If you don't renew, your ads will be hidden from search.</p>
    `,
  }
}

export function renewalFinalNoticeTemplate(
  providerName: string,
  expiryDate: string,
  renewalUrl: string
): EmailTemplate {
  return {
    subject: "Last Chance: Your Subscription Expires Tomorrow",
    text: `Hi ${providerName},\n\n⚠️ Your subscription expires TOMORROW (${expiryDate}).\n\nIf you don't renew, your ads will be hidden from search.\n\nRenew now: ${renewalUrl}`,
    html: `
      <h1>⚠️ Subscription Expires Tomorrow!</h1>
      <p>Hi ${providerName},</p>
      <p>Your subscription expires <strong>TOMORROW (${expiryDate})</strong>.</p>
      <p>If you don't renew, your ads will be hidden from search results and you won't receive new client inquiries.</p>
      <p><a href="${renewalUrl}" style="background: #ef4444; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Renew Immediately</a></p>
    `,
  }
}

export function passwordResetTemplate(
  name: string,
  resetUrl: string,
  expiryMinutes: number = 60
): EmailTemplate {
  return {
    subject: "Reset Your ProviderPost Password",
    text: `Hi ${name},\n\nClick the link below to reset your password. This link expires in ${expiryMinutes} minutes.\n\n${resetUrl}\n\nIf you didn't request this, ignore this email.`,
    html: `
      <h1>Reset Your Password</h1>
      <p>Hi ${name},</p>
      <p>Click the button below to reset your password. This link expires in ${expiryMinutes} minutes.</p>
      <p><a href="${resetUrl}" style="background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
      <hr>
      <p style="font-size: 12px; color: #999;">If you didn't request this, you can safely ignore this email.</p>
    `,
  }
}

export function photoRejectionTemplate(
  providerName: string,
  adTitle: string,
  photoCount: number,
  reason: string
): EmailTemplate {
  return {
    subject: `Photos for "${adTitle}" Need Changes`,
    text: `Hi ${providerName},\n\n${photoCount} photo(s) for your ad "${adTitle}" were rejected.\n\nReason: ${reason}\n\nPlease upload new photos and resubmit your ad.\n\nEdit ad: https://providerpost.com/post`,
    html: `
      <h1>Photos Rejected</h1>
      <p>Hi ${providerName},</p>
      <p><strong>${photoCount}</strong> photo(s) for your ad <strong>"${adTitle}"</strong> were rejected.</p>
      <div style="background: #fee2e2; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Reason:</strong> ${reason}</p>
      </div>
      <p>Please upload new photos and resubmit your ad.</p>
      <p><a href="https://providerpost.com/post" style="background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Edit Your Ad</a></p>
    `,
  }
}

export function verificationSuccessTemplate(
  providerName: string,
  verificationType: string
): EmailTemplate {
  return {
    subject: `Your ${verificationType} Verification is Complete`,
    text: `Hi ${providerName},\n\nCongratulations! Your ${verificationType} verification has been approved.\n\nYour profile now displays a verified badge, which helps build trust with clients.\n\nView profile: https://providerpost.com/user/account`,
    html: `
      <h1>✅ Verification Complete</h1>
      <p>Hi ${providerName},</p>
      <p>Congratulations! Your <strong>${verificationType}</strong> verification has been approved.</p>
      <p>Your profile now displays a verified badge, which helps build trust with clients and can increase your visibility.</p>
      <p><a href="https://providerpost.com/user/account" style="background: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Your Profile</a></p>
    `,
  }
}
