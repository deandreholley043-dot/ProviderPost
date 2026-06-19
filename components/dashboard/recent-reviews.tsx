export function RecentReviews() {
  return (
    <div className="flex flex-col rounded-lg border border-border bg-card">
      <div className="border-b border-border px-6 py-4">
        <h2 className="text-lg font-bold text-card-foreground">Recent Ads</h2>
      </div>
      <div className="flex flex-col items-center justify-center px-6 py-10">
        <p className="text-sm text-muted-foreground">No ads posted yet.</p>
      </div>
    </div>
  )
}
