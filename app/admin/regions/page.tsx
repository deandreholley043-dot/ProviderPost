import { PageShell } from "@/components/page-shell"
import { Button } from "@/components/ui/button"

export default function RegionsPage() {
  return (
    <PageShell
      title="Regions & Categories"
      description="Manage geographic regions and provider categories."
    >
      <div className="flex items-center gap-4">
        <Button>Add Region</Button>
        <Button variant="outline">Add Category</Button>
      </div>
      <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card px-6 py-16">
        <p className="text-sm text-muted-foreground">No regions or categories configured yet.</p>
      </div>
    </PageShell>
  )
}
