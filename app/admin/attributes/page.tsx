import { PageShell } from "@/components/page-shell"
import { Button } from "@/components/ui/button"

export default function AttributesPage() {
  return (
    <PageShell
      title="Attribute Labels"
      description="Manage custom attribute labels for provider profiles."
    >
      <div className="flex items-center gap-4">
        <Button>Add Attribute</Button>
      </div>
      <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card px-6 py-16">
        <p className="text-sm text-muted-foreground">No attributes configured yet.</p>
      </div>
    </PageShell>
  )
}
