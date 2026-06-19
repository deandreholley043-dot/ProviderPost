import { ShieldAlert } from "lucide-react"

export function FraudDetection() {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="flex items-center gap-2 pb-4">
        <ShieldAlert className="h-5 w-5 text-primary" />
        <h2 className="text-lg font-semibold text-card-foreground">Fraud & Abuse</h2>
      </div>
      <div className="flex h-72 items-center justify-center">
        <p className="text-sm text-muted-foreground">No flags or incidents reported.</p>
      </div>
    </div>
  )
}
