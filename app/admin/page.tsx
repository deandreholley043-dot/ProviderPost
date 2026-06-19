import { StatCards } from "@/components/dashboard/stat-cards"
import { RecentReviews } from "@/components/dashboard/recent-reviews"
import { PendingActions } from "@/components/dashboard/pending-actions"

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
      <StatCards />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecentReviews />
        <PendingActions />
      </div>
    </div>
  )
}
