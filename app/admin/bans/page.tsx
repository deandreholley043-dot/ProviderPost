"use client"

import { useState, useEffect, useCallback } from "react"
import { Ban, Mail, User, Plus, Trash2, RefreshCw, Search, ShieldOff, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  getAllBans,
  addBan,
  removeBan,
  updateBan,
  isActive,
  type BanEntry,
  type BanType,
} from "@/lib/ban-store"

// ─── Tab config ───────────────────────────────────────────────────────────────

const tabs: { id: BanType; label: string; icon: typeof Ban }[] = [
  { id: "ip",       label: "IP Address",  icon: Globe },
  { id: "email",    label: "Email",        icon: Mail  },
  { id: "username", label: "Username",     icon: User  },
]

// ─── Add Ban Form ─────────────────────────────────────────────────────────────

function AddBanForm({
  type,
  onAdded,
}: {
  type: BanType
  onAdded: () => void
}) {
  const [value, setValue]       = useState("")
  const [reason, setReason]     = useState("")
  const [notes, setNotes]       = useState("")
  const [permanent, setPermanent] = useState(true)
  const [expiresAt, setExpiresAt] = useState("")
  const [error, setError]       = useState("")
  const [success, setSuccess]   = useState("")

  const placeholder: Record<BanType, string> = {
    ip:       "e.g. 192.168.1.1",
    email:    "e.g. spammer@example.com",
    username: "e.g. baduser42",
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setSuccess("")

    const trimmed = value.trim()
    if (!trimmed) { setError("Value is required."); return }
    if (!reason.trim()) { setError("Reason is required."); return }
    if (!permanent && !expiresAt) { setError("Expiry date is required for temporary bans."); return }

    // Basic IP format check
    if (type === "ip") {
      const ipv4 = /^(\d{1,3}\.){3}\d{1,3}$/
      const ipv6 = /^[0-9a-fA-F:]+$/
      if (!ipv4.test(trimmed) && !ipv6.test(trimmed)) {
        setError("Enter a valid IPv4 or IPv6 address.")
        return
      }
    }

    addBan({
      type,
      value: trimmed,
      reason: reason.trim(),
      notes: notes.trim() || undefined,
      bannedBy: "Admin",
      permanent,
      expiresAt: permanent ? undefined : new Date(expiresAt).toISOString(),
    })

    setValue("")
    setReason("")
    setNotes("")
    setExpiresAt("")
    setPermanent(true)
    setSuccess(`${type === "ip" ? "IP" : type === "email" ? "Email" : "Username"} banned successfully.`)
    onAdded()
    setTimeout(() => setSuccess(""), 3000)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-border bg-card p-6 flex flex-col gap-4"
    >
      <h2 className="text-base font-bold text-card-foreground flex items-center gap-2">
        <Plus className="h-4 w-4 text-primary" />
        Add {type === "ip" ? "IP Ban" : type === "email" ? "Email Ban" : "Username Ban"}
      </h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ban-value">
            {type === "ip" ? "IP Address" : type === "email" ? "Email Address" : "Username"}
          </Label>
          <Input
            id="ban-value"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder[type]}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ban-reason">Reason</Label>
          <Input
            id="ban-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Spam, Abuse, Fraud"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="ban-notes">Notes (optional)</Label>
        <Input
          id="ban-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Internal notes about this ban"
        />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <input
            type="radio"
            id="perm-yes"
            name="permanent"
            checked={permanent}
            onChange={() => setPermanent(true)}
            className="accent-primary"
          />
          <Label htmlFor="perm-yes">Permanent</Label>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="radio"
            id="perm-no"
            name="permanent"
            checked={!permanent}
            onChange={() => setPermanent(false)}
            className="accent-primary"
          />
          <Label htmlFor="perm-no">Temporary</Label>
        </div>
        {!permanent && (
          <div className="flex flex-col gap-1">
            <Label htmlFor="expires">Expires</Label>
            <Input
              id="expires"
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="w-56"
            />
          </div>
        )}
      </div>

      {error   && <p className="text-sm text-red-500">{error}</p>}
      {success && <p className="text-sm text-emerald-600">{success}</p>}

      <Button type="submit" className="self-start bg-foreground text-background hover:bg-foreground/90">
        Add Ban
      </Button>
    </form>
  )
}

// ─── Ban Table ────────────────────────────────────────────────────────────────

function BanTable({
  bans,
  onRemove,
  onRefresh,
}: {
  bans: BanEntry[]
  onRemove: (id: string) => void
  onRefresh: () => void
}) {
  const [search, setSearch] = useState("")
  const [confirmId, setConfirmId] = useState<string | null>(null)

  const filtered = bans.filter(
    (b) =>
      b.value.toLowerCase().includes(search.toLowerCase()) ||
      b.reason.toLowerCase().includes(search.toLowerCase())
  )

  function handleRemove(id: string) {
    if (confirmId === id) {
      onRemove(id)
      setConfirmId(null)
    } else {
      setConfirmId(id)
      setTimeout(() => setConfirmId(null), 3000)
    }
  }

  if (bans.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-14 text-center">
        <ShieldOff className="mb-3 h-10 w-10 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">No bans in this category yet.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search bans..."
            className="pl-9"
          />
        </div>
        <Button variant="outline" size="sm" onClick={onRefresh}>
          <RefreshCw className="h-4 w-4 mr-1.5" /> Refresh
        </Button>
        <span className="text-xs text-muted-foreground">{filtered.length} record{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="px-4 py-3 font-medium">Value</th>
              <th className="px-4 py-3 font-medium">Reason</th>
              <th className="px-4 py-3 font-medium">Duration</th>
              <th className="px-4 py-3 font-medium">Banned At</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Notes</th>
              <th className="px-4 py-3 text-right font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((ban) => {
              const active = isActive(ban)
              return (
                <tr key={ban.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-foreground">
                    {ban.value}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground max-w-[160px] truncate">
                    {ban.reason}
                  </td>
                  <td className="px-4 py-3">
                    {ban.permanent ? (
                      <span className="text-xs text-foreground font-medium">Permanent</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        Until {ban.expiresAt ? new Date(ban.expiresAt).toLocaleDateString() : "—"}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(ban.bannedAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    {active ? (
                      <Badge className="bg-red-100 text-red-700 text-xs">Active</Badge>
                    ) : (
                      <Badge className="bg-muted text-muted-foreground text-xs">Expired</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground max-w-[140px] truncate">
                    {ban.notes || "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemove(ban.id)}
                      className={cn(
                        "text-xs",
                        confirmId === ban.id
                          ? "bg-red-500 text-white border-red-500 hover:bg-red-600"
                          : "text-destructive border-destructive hover:bg-destructive hover:text-white"
                      )}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" />
                      {confirmId === ban.id ? "Confirm?" : "Unban"}
                    </Button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BansPage() {
  const [activeTab, setActiveTab] = useState<BanType>("ip")
  const [allBans, setAllBans] = useState<BanEntry[]>([])

  const refresh = useCallback(() => {
    setAllBans(getAllBans())
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  function handleRemove(id: string) {
    removeBan(id)
    refresh()
  }

  const tabBans = allBans.filter((b) => b.type === activeTab)
  const counts: Record<BanType, number> = {
    ip:       allBans.filter((b) => b.type === "ip"       && isActive(b)).length,
    email:    allBans.filter((b) => b.type === "email"    && isActive(b)).length,
    username: allBans.filter((b) => b.type === "username" && isActive(b)).length,
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <Ban className="h-7 w-7 text-red-500" />
          Ban Management
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Block users by IP address, email, or username. IP bans are enforced at the network edge.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {tabs.map(({ id, label, icon: Icon }) => (
          <div
            key={id}
            className="flex items-center gap-3 rounded-lg border border-border bg-card p-4"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50">
              <Icon className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{label} Bans</p>
              <p className="text-2xl font-bold text-card-foreground">{counts[id]}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg border border-border bg-card p-1 w-fit">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={cn(
              "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
              activeTab === id
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-muted"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
            {counts[id] > 0 && (
              <span className={cn(
                "ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                activeTab === id ? "bg-red-500 text-white" : "bg-red-100 text-red-700"
              )}>
                {counts[id]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Add form */}
      <AddBanForm type={activeTab} onAdded={refresh} />

      {/* Ban list */}
      <BanTable bans={tabBans} onRemove={handleRemove} onRefresh={refresh} />

      {/* IP note */}
      {activeTab === "ip" && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <strong>Note:</strong> IP bans are enforced via Next.js middleware and a browser cookie.
          They block the IP at the edge before any page loads. For production enforcement without
          a database, deploy behind Cloudflare or Vercel and use their IP block rules as a
          secondary layer.
        </div>
      )}
    </div>
  )
}
