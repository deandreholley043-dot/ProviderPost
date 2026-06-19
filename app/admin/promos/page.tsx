"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Tag, Plus, Trash2, ToggleLeft, ToggleRight, Copy,
  CheckCircle, Calendar, Users, Percent, Clock, RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import {
  getAllPromoCodes, createPromoCode, deletePromoCode, togglePromoActive,
  getAllRedemptions, promoTypeLabel,
  type PromoCode, type PromoType, type PromoRedemption,
} from "@/lib/promo-store"

const PROMO_TYPES: { value: PromoType; label: string; icon: typeof Clock }[] = [
  { value: "days_free",        label: "Days Free",        icon: Clock   },
  { value: "weeks_free",       label: "Weeks Free",       icon: Clock   },
  { value: "months_free",      label: "Months Free",      icon: Calendar },
  { value: "years_free",       label: "Years Free",       icon: Calendar },
  { value: "percent_discount", label: "% Discount / post", icon: Percent },
]

function typeColor(type: PromoType) {
  if (type === "percent_discount") return "bg-purple-100 text-purple-700"
  if (type === "years_free")       return "bg-rose-100 text-rose-700"
  if (type === "months_free")      return "bg-pink-100 text-pink-700"
  if (type === "weeks_free")       return "bg-amber-100 text-amber-700"
  return "bg-emerald-100 text-emerald-700"
}

function CodeRow({ code, onDelete, onToggle }: { code: PromoCode; onDelete: (id: string) => void; onToggle: (id: string) => void }) {
  const [copied, setCopied]   = useState(false)
  const [confirm, setConfirm] = useState(false)

  function copy() {
    navigator.clipboard.writeText(code.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleDelete() {
    if (confirm) { onDelete(code.id); setConfirm(false) }
    else { setConfirm(true); setTimeout(() => setConfirm(false), 3000) }
  }

  const expired = code.expiresAt && new Date(code.expiresAt) < new Date()
  const maxed   = code.maxUses !== null && code.usedCount >= code.maxUses

  return (
    <tr className="border-b border-border last:border-0 hover:bg-muted/30">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-bold text-foreground tracking-wider">{code.code}</span>
          <button onClick={copy} className="text-muted-foreground hover:text-foreground transition-colors" title="Copy code">
            {copied ? <CheckCircle className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{code.description}</p>
      </td>
      <td className="px-4 py-3">
        <Badge className={cn("text-xs", typeColor(code.type))}>
          {promoTypeLabel(code.type, code.value)}
        </Badge>
      </td>
      <td className="px-4 py-3 text-xs text-muted-foreground">
        {code.usedCount}{code.maxUses !== null ? ` / ${code.maxUses}` : " / ∞"}
        {maxed && <span className="ml-1 text-red-500 font-medium">(maxed)</span>}
      </td>
      <td className="px-4 py-3 text-xs text-muted-foreground">
        {code.expiresAt
          ? <span className={expired ? "text-red-500" : ""}>{new Date(code.expiresAt).toLocaleDateString()}{expired && " (expired)"}</span>
          : "Never"}
      </td>
      <td className="px-4 py-3 text-xs text-muted-foreground">
        {new Date(code.createdAt).toLocaleDateString()}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Switch checked={code.active} onCheckedChange={() => onToggle(code.id)} />
          <span className={cn("text-xs", code.active && !expired && !maxed ? "text-emerald-600" : "text-muted-foreground")}>
            {expired ? "Expired" : maxed ? "Maxed" : code.active ? "Active" : "Off"}
          </span>
        </div>
      </td>
      <td className="px-4 py-3 text-right">
        <button
          onClick={handleDelete}
          className={cn("rounded p-1.5 transition-colors", confirm ? "text-red-500 hover:text-red-700" : "text-muted-foreground hover:text-red-500")}
          title={confirm ? "Click again to confirm" : "Delete"}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </td>
    </tr>
  )
}

export default function PromosPage() {
  const [codes, setCodes]             = useState<PromoCode[]>([])
  const [redemptions, setRedemptions] = useState<PromoRedemption[]>([])
  const [tab, setTab]                 = useState<"codes" | "redemptions">("codes")

  // Form state
  const [fCode, setFCode]             = useState("")
  const [fType, setFType]             = useState<PromoType>("months_free")
  const [fValue, setFValue]           = useState("1")
  const [fDesc, setFDesc]             = useState("")
  const [fMaxUses, setFMaxUses]       = useState("")
  const [fExpires, setFExpires]       = useState("")
  const [fError, setFError]           = useState("")
  const [fSuccess, setFSuccess]       = useState("")

  const refresh = useCallback(() => {
    setCodes(getAllPromoCodes())
    setRedemptions(getAllRedemptions())
  }, [])

  useEffect(() => { refresh() }, [refresh])

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setFError(""); setFSuccess("")
    const code = fCode.toUpperCase().trim()
    if (!code || !/^[A-Z0-9_-]{3,20}$/.test(code)) {
      setFError("Code must be 3–20 characters, letters, numbers, - or _ only."); return
    }
    if (codes.find((c) => c.code === code)) {
      setFError("That code already exists."); return
    }
    const val = parseInt(fValue)
    if (isNaN(val) || val < 1) { setFError("Value must be at least 1."); return }
    if (fType === "percent_discount" && val > 100) { setFError("Discount cannot exceed 100%."); return }

    const maxUses = fMaxUses ? parseInt(fMaxUses) : null
    if (fMaxUses && (isNaN(maxUses!) || maxUses! < 1)) { setFError("Max uses must be a positive number."); return }

    createPromoCode({
      code,
      type: fType,
      value: val,
      description: fDesc.trim() || promoTypeLabel(fType, val),
      createdBy: "Admin",
      expiresAt: fExpires ? new Date(fExpires).toISOString() : null,
      maxUses: maxUses,
      active: true,
    })

    setFCode(""); setFValue("1"); setFDesc(""); setFMaxUses(""); setFExpires("")
    setFSuccess(`Code "${code}" created successfully.`)
    setTimeout(() => setFSuccess(""), 3000)
    refresh()
  }

  function genRandom() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    setFCode(Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join(""))
  }

  const activeCodes  = codes.filter((c) => c.active)
  const totalUses    = codes.reduce((s, c) => s + c.usedCount, 0)

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <Tag className="h-7 w-7 text-primary" />
          Promo Codes
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create and manage promo codes for free posting periods and per-post discounts.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Total Codes</p>
          <p className="text-2xl font-bold text-foreground mt-0.5">{codes.length}</p>
          <p className="text-xs text-muted-foreground mt-1">{activeCodes.length} active</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Total Redemptions</p>
          <p className="text-2xl font-bold text-foreground mt-0.5">{totalUses}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Unique Users</p>
          <p className="text-2xl font-bold text-foreground mt-0.5">
            {new Set(redemptions.map((r) => r.username)).size}
          </p>
        </div>
      </div>

      {/* Create form */}
      <form onSubmit={handleCreate} className="rounded-lg border border-border bg-card p-6 flex flex-col gap-5">
        <h2 className="text-base font-bold text-card-foreground flex items-center gap-2">
          <Plus className="h-4 w-4 text-primary" /> Create Promo Code
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Code */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="f-code">Promo Code</Label>
            <div className="flex gap-2">
              <Input
                id="f-code"
                value={fCode}
                onChange={(e) => setFCode(e.target.value.toUpperCase())}
                placeholder="e.g. SUMMER50"
                className="font-mono tracking-wider"
              />
              <Button type="button" variant="outline" size="sm" onClick={genRandom} title="Generate random">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Type */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="f-type">Type</Label>
            <select
              id="f-type"
              value={fType}
              onChange={(e) => setFType(e.target.value as PromoType)}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {PROMO_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* Value */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="f-value">
              {fType === "percent_discount" ? "Discount %" : "Amount"}
            </Label>
            <Input
              id="f-value"
              type="number"
              min="1"
              max={fType === "percent_discount" ? "100" : undefined}
              value={fValue}
              onChange={(e) => setFValue(e.target.value)}
              placeholder={fType === "percent_discount" ? "e.g. 50" : "e.g. 3"}
            />
            {fType !== "percent_discount" && fValue && (
              <p className="text-xs text-muted-foreground">
                = {promoTypeLabel(fType, parseInt(fValue) || 0)}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="f-desc">Description (optional)</Label>
            <Input
              id="f-desc"
              value={fDesc}
              onChange={(e) => setFDesc(e.target.value)}
              placeholder="e.g. Summer launch promo"
            />
          </div>

          {/* Max uses */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="f-max">Max Uses (blank = unlimited)</Label>
            <Input
              id="f-max"
              type="number"
              min="1"
              value={fMaxUses}
              onChange={(e) => setFMaxUses(e.target.value)}
              placeholder="e.g. 100"
            />
          </div>

          {/* Expiry */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="f-expires">Code Expires (blank = never)</Label>
            <Input
              id="f-expires"
              type="date"
              value={fExpires}
              onChange={(e) => setFExpires(e.target.value)}
            />
          </div>
        </div>

        {/* Preview */}
        {fCode && fValue && (
          <div className="rounded-md bg-muted px-4 py-3 text-sm">
            <span className="font-mono font-bold tracking-wider text-foreground">{fCode.toUpperCase()}</span>
            <span className="mx-2 text-muted-foreground">—</span>
            <span className="text-foreground">{promoTypeLabel(fType, parseInt(fValue) || 0)}</span>
            {fMaxUses && <span className="text-muted-foreground ml-2">· max {fMaxUses} uses</span>}
            {fExpires && <span className="text-muted-foreground ml-2">· expires {new Date(fExpires).toLocaleDateString()}</span>}
          </div>
        )}

        {fError   && <p className="text-sm text-red-500">{fError}</p>}
        {fSuccess && <p className="text-sm text-emerald-600 flex items-center gap-1.5"><CheckCircle className="h-4 w-4" />{fSuccess}</p>}

        <Button type="submit" className="w-fit bg-foreground text-background hover:bg-foreground/90">
          <Plus className="h-4 w-4 mr-1.5" /> Create Code
        </Button>
      </form>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg border border-border bg-card p-1 w-fit">
        {(["codes", "redemptions"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "rounded-md px-4 py-2 text-sm font-medium transition-colors",
              tab === t ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted"
            )}
          >
            {t === "codes" ? `All Codes (${codes.length})` : `Redemptions (${redemptions.length})`}
          </button>
        ))}
      </div>

      {/* Codes table */}
      {tab === "codes" && (
        codes.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
            <Tag className="mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No promo codes yet. Create one above.</p>
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-left text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Code</th>
                  <th className="px-4 py-3 font-medium">Benefit</th>
                  <th className="px-4 py-3 font-medium">Uses</th>
                  <th className="px-4 py-3 font-medium">Expires</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Del</th>
                </tr>
              </thead>
              <tbody>
                {codes.map((c) => (
                  <CodeRow
                    key={c.id}
                    code={c}
                    onDelete={(id) => { deletePromoCode(id); refresh() }}
                    onToggle={(id) => { togglePromoActive(id); refresh() }}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* Redemptions table */}
      {tab === "redemptions" && (
        redemptions.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
            <Users className="mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No codes redeemed yet.</p>
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-left text-muted-foreground">
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Code</th>
                  <th className="px-4 py-3 font-medium">Benefit</th>
                  <th className="px-4 py-3 font-medium">Redeemed</th>
                  <th className="px-4 py-3 font-medium">Free Until</th>
                </tr>
              </thead>
              <tbody>
                {redemptions.map((r) => {
                  const active = r.expiresAt ? new Date(r.expiresAt) > new Date() : true
                  return (
                    <tr key={r.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-100 text-rose-600 text-[10px] font-bold uppercase">
                            {r.username[0]}
                          </div>
                          <span className="font-medium text-foreground">@{r.username}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-sm font-bold tracking-wider text-foreground">{r.code}</td>
                      <td className="px-4 py-3">
                        <Badge className={cn("text-xs", typeColor(r.type))}>
                          {promoTypeLabel(r.type, r.value)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(r.redeemedAt).toLocaleString()}</td>
                      <td className="px-4 py-3 text-xs">
                        {r.type === "percent_discount"
                          ? <span className="text-purple-600 font-medium">Per-post discount</span>
                          : r.expiresAt
                          ? <span className={active ? "text-emerald-600 font-medium" : "text-red-500"}>
                              {new Date(r.expiresAt).toLocaleDateString()} {active ? "(active)" : "(expired)"}
                            </span>
                          : "—"}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )
      )}

    </div>
  )
}
