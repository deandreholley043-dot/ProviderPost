"use client"

import Link from "next/link"
import { PageShell } from "@/components/page-shell"
import { Button } from "@/components/ui/button"
import { CheckCircle, AlertCircle, Calendar, CreditCard, Download, Plus, RefreshCw } from "lucide-react"

const PLANS = [
  { id: "1m", name: "1 Month", price: 39.99, months: 1 },
  { id: "3m", name: "3 Months", price: 99.99, months: 3 },
  { id: "6m", name: "6 Months", price: 179.99, months: 6 },
  { id: "12m", name: "12 Months", price: 299.99, months: 12 },
]

const BILLING_HISTORY = [
  {
    date: "2024-05-15",
    plan: "1 Month",
    amount: 39.99,
    status: "paid",
    paymentId: "PP-2024-05-15-001",
    coin: "BTC",
  },
  {
    date: "2024-04-15",
    plan: "1 Month",
    amount: 39.99,
    status: "paid",
    paymentId: "PP-2024-04-15-001",
    coin: "ETH",
  },
  {
    date: "2024-03-15",
    plan: "1 Month",
    amount: 39.99,
    status: "paid",
    paymentId: "PP-2024-03-15-001",
    coin: "SOL",
  },
]

export default function SubscriptionPage() {
  const currentPlan = "1 Month"
  const expiresAt = new Date(Date.now() + 76 * 24 * 60 * 60 * 1000)
  const daysLeft = Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24))

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 lg:px-8">
      <PageShell title="Subscription & Billing" description="Manage your subscription plan and payment history.">
        {/* Current subscription status */}
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-6 mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-emerald-600 shrink-0" />
              <div>
                <h2 className="text-lg font-bold text-emerald-900">Active Subscription</h2>
                <p className="text-sm text-emerald-700 mt-0.5">Your ad is currently live</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 border border-emerald-100">
              <p className="text-xs text-emerald-700 font-medium">Current Plan</p>
              <p className="text-lg font-bold text-foreground mt-1">{currentPlan}</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-emerald-100">
              <p className="text-xs text-emerald-700 font-medium">Expires On</p>
              <p className="text-lg font-bold text-foreground mt-1">{expiresAt.toLocaleDateString()}</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-emerald-100">
              <p className="text-xs text-emerald-700 font-medium">Days Remaining</p>
              <p className="text-lg font-bold text-emerald-600 mt-1">{daysLeft} days</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild className="bg-emerald-600 text-white hover:bg-emerald-700">
              <Link href="/checkout">
                <Plus className="h-4 w-4 mr-2" /> Renew Subscription
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/checkout">
                <RefreshCw className="h-4 w-4 mr-2" /> Upgrade Plan
              </Link>
            </Button>
          </div>
        </div>

        {/* Available plans */}
        <div className="mb-8">
          <h3 className="text-base font-bold text-foreground mb-4">Available Plans</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {PLANS.map((plan) => (
              <div key={plan.id} className="rounded-lg border border-border bg-card p-4">
                <p className="text-sm font-bold text-foreground">{plan.name}</p>
                <p className="text-2xl font-bold text-rose-600 mt-2">${plan.price.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground mt-1">USD</p>
                <Button asChild size="sm" className="w-full mt-4 bg-foreground text-background hover:bg-foreground/90">
                  <Link href={`/checkout?plan=${plan.id}`}>Select</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Billing history */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-foreground">Billing History</h3>
            <Button variant="outline" size="sm" className="text-xs gap-1.5">
              <Download className="h-3.5 w-3.5" /> Export CSV
            </Button>
          </div>

          <div className="border border-border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-foreground">Date</th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground">Plan</th>
                    <th className="text-right px-4 py-3 font-semibold text-foreground">Amount</th>
                    <th className="text-center px-4 py-3 font-semibold text-foreground">Coin</th>
                    <th className="text-center px-4 py-3 font-semibold text-foreground">Status</th>
                    <th className="text-center px-4 py-3 font-semibold text-foreground">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {BILLING_HISTORY.map((record) => (
                    <tr key={record.paymentId} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 text-muted-foreground">{record.date}</td>
                      <td className="px-4 py-3 font-medium text-foreground">{record.plan}</td>
                      <td className="px-4 py-3 text-right font-bold text-foreground">${record.amount.toFixed(2)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-xs font-mono text-muted-foreground">{record.coin}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700">
                          <CheckCircle className="h-3 w-3" /> Paid
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Button
                          asChild
                          size="sm"
                          variant="ghost"
                          className="h-6 px-2 text-xs gap-1"
                        >
                          <a href="#">
                            <Download className="h-3 w-3" />
                          </a>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment methods */}
          <div className="mt-8 pt-8 border-t border-border">
            <h3 className="text-base font-bold text-foreground mb-4">Payment Methods</h3>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-3 mb-4">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">Cryptocurrency</p>
                  <p className="text-xs text-muted-foreground">Bitcoin, Ethereum, Solana, XRP</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                We accept cryptocurrency payments via NowPayments. All payments are processed on-chain and activate your subscription within minutes of confirmation.
              </p>
            </div>
          </div>
        </div>
      </PageShell>
    </div>
  )
}
