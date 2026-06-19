import Link from "next/link"

const actions = [
  { label: "Flagged Content", count: 0, badgeColor: "bg-[#ef5350] text-white", bgColor: "bg-[#ffebee]", href: "/admin/moderation" },
  { label: "Pending Ads", count: 0, badgeColor: "bg-[#ffa726] text-white", bgColor: "bg-[#fff8e1]", href: "/admin/members" },
  { label: "Media Pending Approval", count: 0, badgeColor: "bg-[#ec4899] text-white", bgColor: "bg-[#fce4ec]", href: "/admin/media" },
]

export function PendingActions() {
  return (
    <div className="flex flex-col rounded-lg border border-border bg-card">
      <div className="border-b border-border px-6 py-4">
        <h2 className="text-lg font-bold text-card-foreground">Pending Actions</h2>
      </div>
      <div className="flex flex-col gap-3 p-4">
        {actions.map((action) => (
          <div key={action.label} className={`flex items-center justify-between rounded-lg px-4 py-3 ${action.bgColor}`}>
            <div className="flex items-center gap-3">
              <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${action.badgeColor}`}>
                {action.count}
              </span>
              <span className="text-sm font-medium text-card-foreground">{action.label}</span>
            </div>
            <Link href={action.href} className="text-sm font-medium text-primary hover:underline">{"Review ->"}</Link>
          </div>
        ))}
      </div>
    </div>
  )
}
