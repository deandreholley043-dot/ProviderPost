"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  Mail,
  Image,
  Database,
  BarChart3,
  Activity,
  TrendingUp,
  Shield,
  MapPin,
  Settings,
  Tag,
  Ban,
  CreditCard,
  MessageSquare,
  Home,
  Search,
  BookOpen,
  User,
  Heart,
  StickyNote,
  Camera,
  Video,
  LogOut,
} from "lucide-react"
import { getUnreadCount } from "@/lib/review-store"

const adminLinks = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Ads Management", href: "/admin/members", icon: Users },
  { label: "Reviews & Comments", href: "/admin/reviews", icon: MessageSquare },
  { label: "Promo Codes", href: "/admin/promos", icon: Tag },
  { label: "Ban Management", href: "/admin/bans", icon: Ban },
  { label: "Payment Settings", href: "/admin/payments", icon: CreditCard },
  { label: "Money Maker Tracker", href: "/admin/money-maker", icon: TrendingUp },
  { label: "Media Library", href: "/admin/media", icon: Image },
  { label: "Media Database (SEO)", href: "/admin/media-seo", icon: Database },
  { label: "Analytics & Statistics", href: "/admin/analytics", icon: BarChart3 },
  { label: "Stats & Intelligence", href: "/admin/intelligence", icon: Activity },
  { label: "Content Moderation", href: "/admin/moderation", icon: Shield },
  { label: "Regions & Categories", href: "/admin/regions", icon: MapPin },
  { label: "Site Settings", href: "/admin/settings", icon: Settings },
  { label: "Attribute Labels", href: "/admin/attributes", icon: Tag },
]

const userLinks = [
  { label: "Home", href: "/", icon: Home },
  { label: "Browse Ads", href: "/browse", icon: Search },
  { label: "Post Ad", href: "/post", icon: BookOpen },
  { label: "My Account", href: "/user/account", icon: User },
  { label: "My Favorites", href: "/user/favorites", icon: Heart },
  { label: "My Notes", href: "/user/notes", icon: StickyNote },
  { label: "Photos", href: "/user/photos", icon: Camera },
  { label: "Videos", href: "/user/videos", icon: Video },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [unreadReviews, setUnreadReviews] = useState(0)

  useEffect(() => {
    setUnreadReviews(getUnreadCount())
    const interval = setInterval(() => setUnreadReviews(getUnreadCount()), 10000)
    return () => clearInterval(interval)
  }, [])

  async function handleLogout() {
    await fetch("/api/admin/login", { method: "DELETE" })
    router.push("/admin/login")
    router.refresh()
  }

  return (
    <aside className="flex w-64 min-w-64 flex-col border-r border-border bg-card">
      {/* Header */}
      <div className="flex h-16 items-center px-6 bg-primary">
        <h1 className="text-lg font-bold text-primary-foreground tracking-wide">
          Admin Panel
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        {/* Admin Management Section */}
        <div className="px-6 pb-2">
          <p className="text-xs font-bold uppercase tracking-wider text-primary">
            Admin Management
          </p>
        </div>
        <ul className="flex flex-col">
          {adminLinks.map((link) => {
            const isActive = pathname === link.href
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 px-6 py-2.5 text-sm transition-colors border-l-3 border-transparent",
                    isActive
                      ? "border-l-primary text-primary font-semibold bg-sidebar-accent"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-primary"
                  )}
                >
                  <link.icon className="h-4 w-4 shrink-0" />
                  {link.label}
                  {link.href === "/admin/reviews" && unreadReviews > 0 && (
                    <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-pink-500 px-1 text-[10px] font-bold text-white">
                      {unreadReviews}
                    </span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>

        {/* Divider */}
        <div className="my-4 border-t border-border" />

        {/* User Features Section */}
        <div className="px-6 pb-2">
          <p className="text-xs font-bold uppercase tracking-wider text-primary">
            User Features
          </p>
        </div>
        <ul className="flex flex-col">
          {userLinks.map((link) => {
            const isActive = pathname === link.href
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 px-6 py-2.5 text-sm transition-colors border-l-3 border-transparent",
                    isActive
                      ? "border-l-primary text-primary font-semibold bg-sidebar-accent"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-primary"
                  )}
                >
                  <link.icon className="h-4 w-4 shrink-0" />
                  {link.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="border-t border-border p-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
