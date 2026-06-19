"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Menu, X, Briefcase, Search, Home, List, PlusCircle, LogIn, Phone } from "lucide-react"
import { ZipcodeLookup } from "@/components/zipcode-lookup"
import type { ZipLookupResult } from "@/lib/zipcode-db"

// Bottom mobile nav tabs
const MOB_TABS = [
  { href: "/",       label: "Home",   icon: Home      },
  { href: "/browse", label: "Browse", icon: List      },
  { href: "/post",   label: "Post Ad", icon: PlusCircle },
  { href: "/login",  label: "Login",  icon: LogIn     },
  { href: "/contact",label: "Contact",icon: Phone     },
]

export function SiteHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  // Close drawer on route change
  useEffect(() => { setDrawerOpen(false); setSearchOpen(false) }, [pathname])

  // Lock body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [drawerOpen])

  function handleLocationSelect(result: ZipLookupResult) {
    router.push(`/browse?state=${result.state}&city=${encodeURIComponent(result.city)}`)
    setDrawerOpen(false)
    setSearchOpen(false)
  }

  return (
    <>
      {/* ── Main header ─────────────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full bg-foreground text-background shadow-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 lg:h-16 lg:px-8">

          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <Briefcase className="h-6 w-6 text-primary lg:h-7 lg:w-7" />
            <span className="text-lg font-extrabold tracking-tight lg:text-xl">PROVIDERPOST</span>
          </Link>

          {/* Location bar — desktop only */}
          <div className="hidden flex-1 md:flex md:max-w-sm lg:max-w-md">
            <ZipcodeLookup
              size="sm"
              placeholder="Zip code or city..."
              onLocationSelect={handleLocationSelect}
              className="w-full [&_input]:bg-background [&_input]:text-foreground"
            />
          </div>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-6 md:flex">
            {[
              { href: "/browse",  label: "BROWSE"  },
              { href: "/post",    label: "POST AD" },
              { href: "/login",   label: "LOGIN"   },
              { href: "/contact", label: "CONTACT" },
            ].map(({ href, label }) => (
              <Link key={href} href={href}
                className={cn("text-sm font-bold tracking-wide transition-colors hover:text-primary",
                  pathname === href ? "text-primary" : "text-background")}>
                {label}
              </Link>
            ))}
          </nav>

          {/* Mobile right side: search + hamburger */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => { setSearchOpen(!searchOpen); setDrawerOpen(false) }}
              className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-white/10 transition-colors"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>
            <button
              onClick={() => { setDrawerOpen(!drawerOpen); setSearchOpen(false) }}
              className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-white/10 transition-colors"
              aria-label="Toggle menu"
            >
              {drawerOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile search bar — slides down */}
        {searchOpen && (
          <div className="border-t border-white/10 px-4 py-3 md:hidden">
            <ZipcodeLookup
              size="sm"
              placeholder="Enter zip code, postal code, or city..."
              onLocationSelect={handleLocationSelect}
              className="w-full [&_input]:bg-background [&_input]:text-foreground"
            />
          </div>
        )}
      </header>

      {/* ── Mobile slide-in drawer ───────────────────────────── */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setDrawerOpen(false)}>
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          {/* Panel */}
          <div
            className="absolute right-0 top-0 h-full w-72 bg-foreground shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                <span className="font-extrabold text-background">PROVIDERPOST</span>
              </div>
              <button onClick={() => setDrawerOpen(false)} className="text-background/70 hover:text-background">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Nav links */}
            <nav className="flex flex-col py-2">
              {[
                { href: "/browse",   label: "Browse Ads",   icon: List       },
                { href: "/post",     label: "Post Ad",      icon: PlusCircle },
                { href: "/login",    label: "Login",        icon: LogIn      },
                { href: "/register", label: "Register",     icon: LogIn      },
                { href: "/contact",  label: "Contact Us",   icon: Phone      },
                { href: "/about",    label: "About Us",     icon: Home       },
                { href: "/faq",      label: "FAQ / Help",   icon: Home       },
              ].map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href}
                  onClick={() => setDrawerOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-5 py-3.5 text-sm font-semibold transition-colors",
                    pathname === href
                      ? "text-primary bg-white/5"
                      : "text-background/80 hover:text-background hover:bg-white/5"
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </Link>
              ))}
            </nav>

            {/* CTA at bottom */}
            <div className="mt-auto p-5 border-t border-white/10">
              <Link href="/post"
                onClick={() => setDrawerOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-pink-500 text-white py-3 text-sm font-bold hover:bg-pink-600 transition-colors"
              >
                <PlusCircle className="h-4 w-4" /> Post Free Ad
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── Bottom mobile nav bar ──────────────────────────────── */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card md:hidden safe-area-bottom">
        <div className="grid grid-cols-5">
          {MOB_TABS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== "/" && pathname.startsWith(href))
            return (
              <Link key={href} href={href}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Icon className={cn("h-5 w-5", active && "text-primary")} />
                <span>{label}</span>
              </Link>
            )
          })}
        </div>
        {/* iOS safe area spacer */}
        <div className="h-safe-area-bottom bg-card" />
      </nav>

      {/* Spacer so content doesn't hide behind bottom nav on mobile */}
      <div className="h-16 md:hidden" aria-hidden="true" />
    </>
  )
}
