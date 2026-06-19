"use client"

import { useState } from "react"
import { PageShell } from "@/components/page-shell"
import { Eye, MessageCircle, Heart, TrendingUp, Calendar } from "lucide-react"

const MOCK_STATS = {
  totalViews: 2156,
  totalContacts: 89,
  totalFavorites: 67,
  avgViewsPerDay: 32,
  contactRate: "4.1%",
  favoriteRate: "3.1%",
  dailyData: [
    { date: "May 21", views: 28, contacts: 1, favorites: 2 },
    { date: "May 22", views: 35, contacts: 2, favorites: 1 },
    { date: "May 23", views: 42, contacts: 2, favorites: 3 },
    { date: "May 24", views: 31, contacts: 1, favorites: 2 },
    { date: "May 25", views: 38, contacts: 2, favorites: 2 },
    { date: "May 26", views: 29, contacts: 1, favorites: 1 },
    { date: "May 27", views: 45, contacts: 3, favorites: 2 },
  ]
}

export default function StatisticsPage() {
  const [timeRange, setTimeRange] = useState("7d")

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 lg:px-8">
      <PageShell
        title="Ad Statistics"
        description="Track views, contacts, and performance metrics for your ads."
      >
        {/* Time range selector */}
        <div className="flex gap-2 mb-6">
          {["7d", "30d", "90d", "all"].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeRange === range
                  ? "bg-foreground text-background"
                  : "border border-border bg-card hover:border-pink-300"
              }`}
            >
              {range === "7d" ? "Last 7 days" : range === "30d" ? "Last 30 days" : range === "90d" ? "Last 90 days" : "All time"}
            </button>
          ))}
        </div>

        {/* Key metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase">Total Views</p>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold text-foreground">{MOCK_STATS.totalViews.toLocaleString()}</p>
            <p className="text-xs text-emerald-600 mt-2">+12% from last period</p>
          </div>

          <div className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase">Contacts</p>
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold text-foreground">{MOCK_STATS.totalContacts}</p>
            <p className="text-xs text-muted-foreground mt-2">Contact rate: {MOCK_STATS.contactRate}</p>
          </div>

          <div className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase">Favorites</p>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold text-foreground">{MOCK_STATS.totalFavorites}</p>
            <p className="text-xs text-muted-foreground mt-2">Favorite rate: {MOCK_STATS.favoriteRate}</p>
          </div>

          <div className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase">Avg Daily Views</p>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold text-foreground">{MOCK_STATS.avgViewsPerDay}</p>
            <p className="text-xs text-muted-foreground mt-2">Over selected period</p>
          </div>
        </div>

        {/* Daily breakdown */}
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h3 className="text-base font-bold text-foreground">Daily Breakdown</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="text-left px-6 py-3 font-semibold text-foreground">Date</th>
                  <th className="text-right px-6 py-3 font-semibold text-foreground">
                    <div className="flex items-center justify-end gap-1.5">
                      <Eye className="h-4 w-4" /> Views
                    </div>
                  </th>
                  <th className="text-right px-6 py-3 font-semibold text-foreground">
                    <div className="flex items-center justify-end gap-1.5">
                      <MessageCircle className="h-4 w-4" /> Contacts
                    </div>
                  </th>
                  <th className="text-right px-6 py-3 font-semibold text-foreground">
                    <div className="flex items-center justify-end gap-1.5">
                      <Heart className="h-4 w-4" /> Favorites
                    </div>
                  </th>
                  <th className="text-right px-6 py-3 font-semibold text-foreground">CTR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {MOCK_STATS.dailyData.map((day, i) => (
                  <tr key={i} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 text-muted-foreground">{day.date}</td>
                    <td className="px-6 py-4 text-right font-medium text-foreground">{day.views}</td>
                    <td className="px-6 py-4 text-right font-medium text-foreground">{day.contacts}</td>
                    <td className="px-6 py-4 text-right font-medium text-foreground">{day.favorites}</td>
                    <td className="px-6 py-4 text-right text-muted-foreground">
                      {((day.contacts / day.views) * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tips section */}
        <div className="mt-8 rounded-lg border border-amber-200 bg-amber-50 p-5">
          <h3 className="text-sm font-bold text-amber-900 mb-3">📈 Tips to Boost Your Views</h3>
          <ul className="text-xs text-amber-800 space-y-2 leading-relaxed">
            <li>✓ Upload high-quality photos (6+ clear photos = more views)</li>
            <li>✓ Write an engaging description (detailed & honest)</li>
            <li>✓ Update your availability regularly (Available Now badge increases views 40%)</li>
            <li>✓ Respond quickly to messages (contacts appreciate fast replies)</li>
            <li>✓ Renew your ad on time (new ads appear at the top of search)</li>
          </ul>
        </div>
      </PageShell>
    </div>
  )
}
