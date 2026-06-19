import { PageShell } from "@/components/page-shell"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function ListingsPage() {
  return (
    <PageShell title="Ads Management" description="View and manage all provider ads on the platform.">
      <div className="flex items-center gap-4">
        <Input placeholder="Search ads..." className="max-w-sm bg-card" />
        <Button>Search</Button>
      </div>
      <div className="rounded-lg border border-border bg-card overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Verified</TableHead>
              <TableHead>Posted</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <td colSpan={8} className="py-16 text-center text-sm text-muted-foreground">No ads submitted yet.</td>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </PageShell>
  )
}
