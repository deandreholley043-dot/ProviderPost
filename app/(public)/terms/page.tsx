import Link from "next/link"
import { FileText } from "lucide-react"

export const metadata = {
  title: "Terms of Service – ProviderPost",
  description: "The terms and conditions governing your use of ProviderPost.",
}

const LAST_UPDATED = "June 1, 2026"

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 lg:px-8">
      <div className="rounded-md bg-pink-400 px-6 py-3 mb-8 flex items-center gap-3">
        <FileText className="h-5 w-5 text-pink-900" />
        <h1 className="text-xl font-extrabold text-foreground">Terms of Service</h1>
      </div>

      <p className="text-sm text-muted-foreground mb-8">Last updated: {LAST_UPDATED}</p>

      <div className="flex flex-col gap-8 text-foreground">

        <section>
          <h2 className="text-base font-bold mb-2">1. Acceptance of Terms</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            By accessing or using ProviderPost ("Site," "Service"), you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree, you are prohibited from using this site. These terms apply to all visitors, users, and others who access the Service.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold mb-2">2. Eligibility</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            You must be at least 18 years of age to use this Service. By using ProviderPost you represent and warrant that you are 18 years of age or older. We reserve the right to terminate accounts of users found to be under 18 and to remove any content they have submitted.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold mb-2">3. User Accounts</h2>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1.5">
            <li>You are responsible for maintaining the confidentiality of your account credentials</li>
            <li>You are responsible for all activity that occurs under your account</li>
            <li>You must provide accurate and complete registration information</li>
            <li>You may not create accounts for the purpose of circumventing bans or restrictions</li>
            <li>You may not share, sell, or transfer your account to another person</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-bold mb-2">4. Acceptable Use</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-2">You agree not to use the Service to:</p>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1.5">
            <li>Post content involving minors in any sexual, suggestive, or inappropriate context</li>
            <li>Post false, misleading, or deceptive advertisements</li>
            <li>Harass, threaten, or harm other users</li>
            <li>Spam, flood, or post duplicate advertisements</li>
            <li>Attempt to gain unauthorized access to other accounts or site systems</li>
            <li>Use automated bots, scrapers, or scripts to access the Service</li>
            <li>Reuse phone numbers, images, or contact details across multiple fraudulent listings</li>
            <li>Violate any applicable local, state, national, or international law</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-bold mb-2">5. Advertisements and Content</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            All advertisements submitted to ProviderPost are subject to review and approval by our moderation team before going live. We reserve the right to reject, remove, or modify any advertisement at our sole discretion without notice or refund. Approved advertisements are not an endorsement by ProviderPost of the advertiser or their services.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mt-3">
            You retain ownership of content you submit, but grant ProviderPost a non-exclusive, royalty-free, worldwide license to display, reproduce, and distribute that content as part of the Service.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold mb-2">6. Subscriptions and Payments</h2>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1.5">
            <li>Subscription fees are charged in advance and are non-refundable except where required by law</li>
            <li>All payments are processed in USD via NowPayments using cryptocurrency</li>
            <li>Subscriptions activate upon on-chain payment confirmation</li>
            <li>We reserve the right to change pricing with 30 days advance notice</li>
            <li>Accounts banned for Terms violations are not entitled to refunds for unused subscription time</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-bold mb-2">7. Promo Codes and Discounts</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Promo codes are issued at our discretion, are non-transferable, and may only be used once per account unless otherwise specified. We reserve the right to revoke promo codes at any time without notice if we suspect misuse or fraud.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold mb-2">8. Account Suspension and Termination</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We reserve the right to suspend or permanently ban any account at any time for violations of these Terms, suspicious activity, or any reason we deem appropriate to protect the safety of our community. Banned users may be blocked by IP address, email address, and device fingerprint.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold mb-2">9. Disclaimer of Warranties</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            The Service is provided on an "as is" and "as available" basis without warranties of any kind, either express or implied. ProviderPost does not warrant that the Service will be uninterrupted, secure, or free from errors. We are not responsible for the accuracy, legality, or appropriateness of user-submitted content.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold mb-2">10. Limitation of Liability</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            To the fullest extent permitted by law, ProviderPost shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or relating to your use of the Service, even if we have been advised of the possibility of such damages. Our total liability shall not exceed the amount you paid to us in the 90 days preceding the claim.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold mb-2">11. Governing Law</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            These Terms shall be governed by and construed in accordance with applicable law. Any disputes shall be resolved through binding arbitration where permitted by law.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold mb-2">12. Changes to Terms</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We reserve the right to modify these Terms at any time. We will post the updated Terms on this page with a revised "Last updated" date. Continued use of the Service after changes constitutes acceptance of the new Terms.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold mb-2">13. Contact</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            For questions about these Terms, contact us at:
          </p>
          <div className="mt-3 rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
            <p className="font-semibold text-foreground">ProviderPost</p>
            <p>#254, Preah Monivong Blvd</p>
            <p>Sangkat Chaktomuk, Khan Daun Penh</p>
            <p>Phnom Penh 120207, Cambodia</p>
            <p className="mt-2"><Link href="/contact" className="text-primary hover:underline">Contact Form →</Link></p>
          </div>
        </section>

      </div>
    </div>
  )
}
