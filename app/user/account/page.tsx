"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { CheckCircle, Clock, List, MessageCircle, Settings, BarChart3, CreditCard, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

function SubmissionBanner() {
  const params = useSearchParams()
  const submitted = params.get("submitted") === "1"
  const title     = params.get("title") || "Your Ad"
  const dateParam = params.get("date")

  if (!submitted) return null

  const submittedAt = dateParam
    ? new Date(dateParam).toLocaleString(undefined, {
        year: "numeric", month: "long", day: "numeric",
        hour: "2-digit", minute: "2-digit",
      })
    : new Date().toLocaleString()

  return (
    <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-5 flex flex-col gap-4 mb-6">
      <div className="flex items-start gap-3">
        <CheckCircle className="h-6 w-6 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-base font-bold text-emerald-800">Thank you for your post.</p>
          <p className="text-sm text-emerald-700 mt-0.5">It will be up shortly after approval by an administrator.</p>
        </div>
      </div>

      <div className="rounded-md border border-emerald-200 bg-white px-4 py-3 flex flex-col gap-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground font-medium">Advertisement</span>
          <span className="font-semibold text-foreground">{title}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground font-medium">Submitted</span>
          <span className="text-foreground">{submittedAt}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground font-medium">Status</span>
          <span className="flex items-center gap-1.5 font-semibold text-amber-600">
            <Clock className="h-3.5 w-3.5" />
            Pending Approval
          </span>
        </div>
      </div>
    </div>
  )
}

const NAV_ITEMS = [
  { href: "/user/my-ads", label: "My Ads", icon: List },
  { href: "/user/messages", label: "Messages", icon: MessageCircle },
  { href: "/user/statistics", label: "Statistics", icon: BarChart3 },
  { href: "/user/subscription", label: "Subscription & Billing", icon: CreditCard },
  { href: "/user/account", label: "Account Settings", icon: Settings },
]

export default function AccountPage() {
  const pathname = usePathname()

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Sidebar navigation */}
        <div className="lg:col-span-1">
          <div className="rounded-lg border border-border bg-card overflow-hidden sticky top-20">
            {/* Header */}
            <div className="px-4 py-4 bg-pink-50 border-b border-border">
              <h2 className="text-sm font-bold text-foreground">Dashboard</h2>
            </div>

            {/* Links */}
            <nav className="flex flex-col">
              <Link href="/post" className="px-4 py-3 text-sm font-semibold text-white bg-foreground hover:opacity-90 transition-opacity flex items-center gap-3 border-b border-border">
                <Plus className="h-4 w-4" />
                Post New Ad
              </Link>

              {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "px-4 py-3 text-sm font-medium transition-colors flex items-center gap-3 border-b border-border last:border-b-0",
                    pathname === href
                      ? "text-primary bg-pink-50 border-l-2 border-l-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Main content */}
        <div className="lg:col-span-4">
          <Suspense>
            <SubmissionBanner />
          </Suspense>

          {/* Dashboard overview */}
          {pathname === "/user/account" && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="rounded-lg border border-border bg-card p-6">
                  <p className="text-xs text-muted-foreground font-medium">Active Ads</p>
                  <p className="text-3xl font-bold text-foreground mt-2">1</p>
                  <p className="text-xs text-emerald-600 mt-2">Expires in 76 days</p>
                </div>
                <div className="rounded-lg border border-border bg-card p-6">
                  <p className="text-xs text-muted-foreground font-medium">This Month</p>
                  <p className="text-3xl font-bold text-foreground mt-2">342</p>
                  <p className="text-xs text-muted-foreground mt-2">Total views</p>
                </div>
                <div className="rounded-lg border border-border bg-card p-6">
                  <p className="text-xs text-muted-foreground font-medium">Unread Messages</p>
                  <p className="text-3xl font-bold text-rose-600 mt-2">2</p>
                  <p className="text-xs text-muted-foreground mt-2">New inquiries</p>
                </div>
              </div>

              {/* Account settings form */}
              <div className="rounded-lg border border-border bg-card p-6">
                <h3 className="text-base font-bold text-foreground mb-6">Account Settings</h3>
                <div className="space-y-5">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" defaultValue="destiny_la" readOnly className="bg-muted" />
                    <p className="text-xs text-muted-foreground">Your unique username on ProviderPost</p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" defaultValue="destiny@example.com" />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="phone">Phone (WhatsApp)</Label>
                    <Input id="phone" type="tel" defaultValue="+1 (213) 555-0142" placeholder="+1 (000) 000-0000" />
                    <p className="text-xs text-muted-foreground">Used for client contact requests</p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="wechat">WeChat ID</Label>
                    <Input id="wechat" defaultValue="destiny_la" placeholder="WeChat username" />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="password">Change Password</Label>
                    <Input id="password" type="password" placeholder="Enter new password" />
                    <p className="text-xs text-muted-foreground">Leave blank to keep current password</p>
                  </div>

                  <Button className="bg-foreground text-background hover:bg-foreground/90 w-full sm:w-auto">
                    Save Changes
                  </Button>
                </div>
              </div>
            </>
          )}

          {/* When user navigates to other sections, they see that page content */}
          {(pathname === "/user/my-ads" || pathname === "/user/messages" || pathname === "/user/subscription" || pathname === "/user/statistics") && (
            <p className="text-sm text-muted-foreground text-center py-12">Navigate to section using the sidebar menu</p>
          )}
        </div>
      </div>
    </div>
  )
}

