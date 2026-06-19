import Link from "next/link"
import { Shield } from "lucide-react"

export const metadata = {
  title: "Privacy Policy – ProviderPost",
  description: "How ProviderPost collects, uses, and protects your personal information.",
}

const LAST_UPDATED = "June 1, 2026"

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 lg:px-8">
      {/* Header */}
      <div className="rounded-md bg-pink-400 px-6 py-3 mb-8 flex items-center gap-3">
        <Shield className="h-5 w-5 text-pink-900" />
        <h1 className="text-xl font-extrabold text-foreground">Privacy Policy</h1>
      </div>

      <p className="text-sm text-muted-foreground mb-8">Last updated: {LAST_UPDATED}</p>

      <div className="prose prose-sm max-w-none flex flex-col gap-8 text-foreground">

        <section>
          <h2 className="text-base font-bold mb-2">1. Introduction</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            ProviderPost ("we," "our," or "us") is committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services. Please read this policy carefully. If you disagree with its terms, please discontinue use of the site.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold mb-2">2. Information We Collect</h2>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">We collect information you provide directly to us, including:</p>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1.5">
            <li>Account registration information (username, email address, password hash)</li>
            <li>Profile and advertisement content you submit</li>
            <li>Payment transaction data (processed via NowPayments — we do not store raw crypto wallet keys or payment credentials)</li>
            <li>Communications you send to us via the contact form</li>
            <li>Promo code redemption records</li>
          </ul>
          <p className="text-sm text-muted-foreground leading-relaxed mt-3">We also collect certain information automatically when you visit the site:</p>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1.5 mt-2">
            <li>IP address (hashed for storage where possible)</li>
            <li>Browser type, operating system, and device type</li>
            <li>Pages visited, time on page, and referrer URL</li>
            <li>Session identifiers stored in cookies and localStorage</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-bold mb-2">3. How We Use Your Information</h2>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1.5">
            <li>To create and manage your account</li>
            <li>To process and display your advertisements</li>
            <li>To process payments and activate subscriptions</li>
            <li>To enforce our Terms of Service and community guidelines</li>
            <li>To detect, investigate, and prevent fraudulent or abusive activity</li>
            <li>To send transactional communications related to your account</li>
            <li>To improve the site and understand how users interact with it</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-bold mb-2">4. Information Sharing</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We do not sell, rent, or trade your personal information to third parties for marketing purposes. We may share information with:
          </p>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1.5 mt-2">
            <li><strong>Service providers</strong> — such as Supabase (database hosting) and NowPayments (payment processing) who process data on our behalf under strict confidentiality agreements</li>
            <li><strong>Law enforcement</strong> — when required by applicable law, court order, or government regulation</li>
            <li><strong>Safety and fraud prevention</strong> — to protect the rights, property, or safety of ProviderPost, our users, or the public</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-bold mb-2">5. Cookies and Tracking</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We use cookies and similar technologies to maintain your login session, remember your preferences, and analyze site usage. Session cookies are HttpOnly and Secure in production. You can instruct your browser to refuse cookies, but some features of the site may not function correctly as a result.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold mb-2">6. Data Retention</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We retain your personal data for as long as your account is active or as needed to provide services. Analytics event data is retained for up to 365 days by default (configurable by admin). You may request deletion of your account and associated data by contacting us at the address below.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold mb-2">7. Your Rights</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">Depending on your location, you may have the right to:</p>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1.5 mt-2">
            <li>Access the personal data we hold about you</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Object to or restrict certain processing activities</li>
            <li>Data portability (receive your data in a structured format)</li>
          </ul>
          <p className="text-sm text-muted-foreground mt-3">To exercise these rights, contact us using the information in Section 10.</p>
        </section>

        <section>
          <h2 className="text-base font-bold mb-2">8. Children's Privacy</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            This site is intended for adults aged 18 and over. We do not knowingly collect personal information from anyone under the age of 18. If we become aware that a minor has provided us with personal information, we will take steps to delete it immediately.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold mb-2">9. Security</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We implement industry-standard security measures including password hashing (bcrypt), HTTPS-only transmission, HttpOnly session cookies, and server-side input validation. No method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
          </p>
        </section>

        <section>
          <h2 className="text-base font-bold mb-2">10. Contact Us</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            If you have questions about this Privacy Policy or wish to exercise your data rights, contact us at:
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
