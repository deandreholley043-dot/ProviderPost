"use client"

import { usePathname } from "next/navigation"
import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminAuthGate } from "@/components/admin-auth-gate"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isLoginPage = pathname === "/admin/login"

  if (isLoginPage) {
    return <>{children}</>
  }

  return (
    <AdminAuthGate>
      <div className="flex h-screen overflow-hidden">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto bg-background p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </AdminAuthGate>
  )
}
