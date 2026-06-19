"use client"

// The actual auth enforcement is in middleware.ts (server-side).
// If this component renders, the middleware already verified the admin_token cookie.
// This component just provides the loading shell while the page hydrates.

import { Briefcase } from "lucide-react"

export function AdminAuthGate({ children }: { children: React.ReactNode }) {
  // Middleware guarantees only authenticated requests reach here.
  // No client-side cookie sniffing needed — that check has been removed.
  return <>{children}</>
}
