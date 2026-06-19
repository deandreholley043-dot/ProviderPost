import { Briefcase, Users, Image, Crown } from "lucide-react"

const stats = [
  { title: "Total Ads", value: "0", description: "Active provider ads", icon: Briefcase, borderColor: "border-l-[#ec4899]" },
  { title: "Registered Users", value: "0", description: "Hobbyists & providers", icon: Users, borderColor: "border-l-[#f472b6]" },
  { title: "Media Files", value: "0", description: "Photos and videos", icon: Image, borderColor: "border-l-[#ab47bc]" },
  { title: "Verified Providers", value: "0", description: "Verified provider accounts", icon: Crown, borderColor: "border-l-[#ec407a]" },
]

export function StatCards() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.title} className={`flex flex-col gap-1 rounded-lg border border-border bg-card p-5 border-l-4 ${stat.borderColor}`}>
          <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
          <p className="text-3xl font-bold text-card-foreground">{stat.value}</p>
          <p className="text-xs text-muted-foreground">{stat.description}</p>
        </div>
      ))}
    </div>
  )
}
