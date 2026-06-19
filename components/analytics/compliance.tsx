import { Scale, FileCheck, ShieldCheck, UserCheck, AlertCircle, CheckCircle2, Clock } from "lucide-react"

const complianceItems = [
  { label: "Age Verification", status: "active", description: "All users must verify age on registration", icon: UserCheck },
  { label: "GDPR Compliance", status: "active", description: "Data processing agreements and cookie consent enabled", icon: FileCheck },
  { label: "DMCA Takedowns", status: "active", description: "No pending takedown requests", icon: Scale },
  { label: "2257 Records", status: "active", description: "All content creator records on file and up to date", icon: ShieldCheck },
  { label: "Terms of Service", status: "active", description: "Terms of service current", icon: FileCheck },
  { label: "Content Policy", status: "active", description: "Automated content screening operational", icon: ShieldCheck },
]

const statusConfig: Record<string, { label: string; class: string; icon: typeof CheckCircle2 }> = {
  active: { label: "Active", class: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
  review: { label: "Needs Review", class: "bg-pink-100 text-pink-700", icon: AlertCircle },
  update: { label: "Update Due", class: "bg-pink-100 text-pink-700", icon: Clock },
}

export function Compliance() {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="flex items-center gap-2 pb-4">
        <Scale className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold text-card-foreground">Legal & Compliance</h2>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {complianceItems.map((item) => {
          const Icon = item.icon
          const cfg = statusConfig[item.status]
          const StatusIcon = cfg.icon
          return (
            <div key={item.label} className="flex flex-col gap-3 rounded-lg border border-border p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold text-card-foreground">{item.label}</span>
                </div>
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${cfg.class}`}>
                  <StatusIcon className="h-3 w-3" />
                  {cfg.label}
                </span>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">{item.description}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
