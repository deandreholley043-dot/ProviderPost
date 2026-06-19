import { PageShell } from "@/components/page-shell"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function MessagesPage() {
  return (
    <PageShell
      title="Private Messages"
      description="Monitor and moderate private messages between users."
    >
      <div className="flex items-center gap-4">
        <Input placeholder="Search messages..." className="max-w-sm bg-card" />
        <Button>Search</Button>
      </div>
      <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card px-6 py-16">
        <p className="text-sm text-muted-foreground">No messages to display.</p>
      </div>
    </PageShell>
  )
}
