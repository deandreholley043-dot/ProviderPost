"use client"

import Link from "next/link"
import { useState } from "react"
import { HelpCircle, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"

const FAQS: { category: string; items: { q: string; a: string }[] }[] = [
  {
    category: "Getting Started",
    items: [
      {
        q: "What is ProviderPost?",
        a: "ProviderPost is a classified advertising platform that connects independent providers with clients across the United States and Canada. Providers can post ads with photos, rates, and contact details. Clients can browse by location and ethnicity, read reviews, and reach out directly.",
      },
      {
        q: "Is it free to create an account?",
        a: "Yes — creating an account is always free. There are two account types: Hobbyist (free, browse and review) and Provider (free to register, subscription required to publish ads).",
      },
      {
        q: "What is the difference between a Hobbyist and a Provider account?",
        a: "A Hobbyist account lets you browse all ads, save favorites, and leave verified reviews. A Provider account lets you create and manage your own advertisements. You cannot post reviews on a Provider account.",
      },
      {
        q: "What countries and regions do you cover?",
        a: "We cover all 50 US states plus the District of Columbia, and all 13 Canadian provinces and territories — Ontario, British Columbia, Quebec, Alberta, Manitoba, Saskatchewan, Nova Scotia, New Brunswick, Newfoundland and Labrador, Prince Edward Island, Northwest Territories, Nunavut, and Yukon.",
      },
    ],
  },
  {
    category: "Posting an Ad",
    items: [
      {
        q: "How do I post an advertisement?",
        a: "Register a Provider account, then click Post Ad in the navigation. Fill in your profile details, upload photos, enter your rates and contact information, and choose a subscription plan. After submitting, your ad will be reviewed by our team and go live once approved — usually within a few hours.",
      },
      {
        q: "How long does approval take?",
        a: "Most ads are reviewed and approved within 1–4 hours. During busy periods it may take up to 24 hours. You will receive a confirmation on your account dashboard once your ad is live.",
      },
      {
        q: "Why was my ad rejected?",
        a: "Common rejection reasons include prohibited content, unclear or low-quality photos, incomplete profile information, suspected duplicate listings, or policy violations. If your ad was rejected you can edit it and resubmit. Contact support if you believe a rejection was made in error.",
      },
      {
        q: "Can I edit my ad after it goes live?",
        a: "Yes. You can edit your ad at any time from your account dashboard. Significant edits may trigger a brief re-review before the changes appear publicly.",
      },
      {
        q: "How many photos can I upload?",
        a: "You can upload up to 12 photos per listing. Photos are automatically compressed to 1200px wide at 75% JPEG quality to ensure fast loading without sacrificing image quality.",
      },
      {
        q: "Can I upload videos?",
        a: "Yes. Videos up to 50MB are supported. They are compressed and processed automatically before being attached to your listing.",
      },
    ],
  },
  {
    category: "Subscriptions and Payments",
    items: [
      {
        q: "How much does it cost to post an ad?",
        a: "We offer four subscription plans: 1 Month ($39.99), 3 Months ($99.99), 6 Months ($179.99), and 12 Months ($299.99). Your subscription keeps your ad active and visible for the full period.",
      },
      {
        q: "What payment methods are accepted?",
        a: "All payments are processed via NowPayments using cryptocurrency. We accept Bitcoin (BTC), Ethereum (ETH), Solana (SOL), and XRP. Payment is confirmed on-chain and typically activates your subscription within minutes.",
      },
      {
        q: "What happens after I pay?",
        a: "Once your payment is confirmed on the blockchain, your subscription activates automatically and your pending ad is approved. You will see your ad status change to Active on your account dashboard.",
      },
      {
        q: "Do you offer refunds?",
        a: "Subscription fees are non-refundable once your ad has been activated. If your ad was rejected before activation, please contact support. We review refund requests on a case-by-case basis.",
      },
      {
        q: "Do you have promo codes?",
        a: "Yes. Promo codes can give you a free posting period (days, weeks, months, or years) or a percentage discount on your subscription. Promo codes are issued by the admin team. Each code can only be used once per account.",
      },
    ],
  },
  {
    category: "Reviews",
    items: [
      {
        q: "Who can leave reviews?",
        a: "Only verified Hobbyist account holders can leave reviews. Provider accounts, guests, and anonymous users cannot post reviews. This ensures all reviews come from real, registered members of the community.",
      },
      {
        q: "Can I leave more than one review for the same provider?",
        a: "No. Each Hobbyist account can leave one review per provider profile. This prevents review manipulation.",
      },
      {
        q: "Can a provider review themselves?",
        a: "No. The system prevents self-reviews automatically.",
      },
      {
        q: "How do I report a fake or abusive review?",
        a: "Use the Report button on the review, or contact us through the contact form. Our moderation team reviews all reports and removes content that violates our policies.",
      },
    ],
  },
  {
    category: "Safety and Privacy",
    items: [
      {
        q: "How do I report an ad?",
        a: "There is a Report this ad link on every provider profile page. Reports are sent directly to our moderation team and reviewed promptly.",
      },
      {
        q: "What do you do about fake or spam ads?",
        a: "Our systems detect duplicate content, reused phone numbers, and suspicious posting patterns automatically. Flagged ads are queued for manual review. Accounts confirmed to be spam are permanently banned.",
      },
      {
        q: "Is my personal information safe?",
        a: "Yes. Passwords are hashed using bcrypt and never stored in plain text. Session cookies are HttpOnly and Secure. We do not sell your personal data to third parties. See our Privacy Policy for full details.",
      },
      {
        q: "What information do you collect?",
        a: "We collect account information (username, email), ad content, and standard web analytics (page views, device type, general location). See our Privacy Policy for a complete list.",
      },
    ],
  },
  {
    category: "Account Management",
    items: [
      {
        q: "How do I reset my password?",
        a: "Click Forgot your password? on the login page. Enter your registered email address and follow the instructions sent to you.",
      },
      {
        q: "How do I delete my account?",
        a: "Contact us through the contact form with a deletion request. We will process it within 7 business days and confirm once complete. Note that active subscriptions are not refunded upon account deletion.",
      },
      {
        q: "My account has been banned — what can I do?",
        a: "If you believe your account was banned in error, contact our support team through the contact form with your username and a description of the situation. We review all ban appeals within 5 business days.",
      },
    ],
  },
]

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-start justify-between gap-4 py-4 text-left"
      >
        <span className="text-sm font-semibold text-foreground leading-relaxed">{q}</span>
        {open
          ? <ChevronUp className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground" />
          : <ChevronDown className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground" />
        }
      </button>
      {open && (
        <p className="pb-4 text-sm text-muted-foreground leading-relaxed pr-8">{a}</p>
      )}
    </div>
  )
}

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState(FAQS[0].category)

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 lg:px-8">

      {/* Header */}
      <div className="rounded-md bg-pink-400 px-6 py-3 mb-10 flex items-center gap-3">
        <HelpCircle className="h-5 w-5 text-pink-900" />
        <h1 className="text-xl font-extrabold text-foreground">Help &amp; FAQ</h1>
      </div>

      <p className="text-sm text-muted-foreground mb-8">
        Can't find your answer here?{" "}
        <Link href="/contact" className="text-primary hover:underline font-medium">Contact our support team →</Link>
      </p>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {FAQS.map(({ category }) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={cn(
              "rounded-full px-4 py-1.5 text-xs font-semibold transition-colors",
              activeCategory === category
                ? "bg-foreground text-background"
                : "bg-muted text-muted-foreground hover:bg-muted/70"
            )}
          >
            {category}
          </button>
        ))}
      </div>

      {/* FAQ list */}
      {FAQS.filter(({ category }) => category === activeCategory).map(({ category, items }) => (
        <div key={category} className="rounded-lg border border-border bg-card px-5">
          {items.map(({ q, a }) => (
            <FAQItem key={q} q={q} a={a} />
          ))}
        </div>
      ))}

      {/* Still need help */}
      <div className="mt-10 rounded-lg border border-pink-200 bg-pink-50 p-6 text-center">
        <p className="text-sm font-bold text-foreground mb-1">Still need help?</p>
        <p className="text-xs text-muted-foreground mb-4">Our support team typically responds within 24 hours.</p>
        <Link
          href="/contact"
          className="inline-flex items-center justify-center rounded-lg bg-foreground text-background px-5 py-2.5 text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          Contact Support
        </Link>
      </div>

    </div>
  )
}
