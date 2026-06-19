export function PageShell({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children?: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      {children ? (
        children
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-card px-6 py-16">
          <p className="text-sm text-muted-foreground">
            No data to display yet.
          </p>
        </div>
      )}
    </div>
  )
}
