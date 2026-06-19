"use client"

import { useState, useEffect } from "react"
import {
  CreditCard, Eye, EyeOff, CheckCircle, AlertCircle,
  RefreshCw, History, Trash2, Calendar, Star,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  getConfig, saveConfig, updatePlans, isFree, COINS, DEFAULT_PLANS,
  type NowPaymentsConfig, type CoinId, type SubscriptionPlan,
  getBaseUrl,
} from "@/lib/nowpayments"

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-card p-6 flex flex-col gap-5">
      <h2 className="text-base font-bold text-card-foreground">{title}</h2>
      {children}
    </div>
  )
}

export default function PaymentsPage() {
  const [config, setConfig]             = useState<NowPaymentsConfig | null>(null)
  const [showKey, setShowKey]           = useState(false)
  const [showSecret, setShowSecret]     = useState(false)
  const [saved, setSaved]               = useState(false)
  const [testing, setTesting]           = useState(false)
  const [testResult, setTestResult]     = useState<{ ok: boolean; message: string } | null>(null)
  const [plansSaved, setPlansSaved]     = useState(false)
  const [effectiveFrom, setEffectiveFrom] = useState(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`
  })
  // Local editable copy of plans
  const [editPlans, setEditPlans]       = useState<SubscriptionPlan[]>(DEFAULT_PLANS)

  useEffect(() => {
    const cfg = getConfig()
    setConfig(cfg)
    setEditPlans(cfg.plans)
  }, [])

  if (!config) return null

  const free = isFree(config)

  function update(patch: Partial<NowPaymentsConfig>) {
    setConfig((c) => c ? { ...c, ...patch } : c)
    setSaved(false)
  }

  function toggleCoin(coin: CoinId) {
    if (!config) return
    const enabled = config.enabledCoins.includes(coin)
    update({ enabledCoins: enabled ? config.enabledCoins.filter((c) => c !== coin) : [...config.enabledCoins, coin] })
  }

  function handleSave() {
    if (!config) return
    saveConfig(config)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  function handleSetFreeMode(val: boolean) {
    if (!config) return
    const updated: NowPaymentsConfig = { ...config, freeMode: val }
    setConfig(updated)
    saveConfig(updated)
  }

  async function handleTest() {
    if (!config) return
    if (!config.apiKey) { setTestResult({ ok: false, message: "Enter an API key first." }); return }
    setTesting(true); setTestResult(null)
    try {
      const res = await fetch(`${getBaseUrl(config.sandboxMode)}/status`, { headers: { "x-api-key": config.apiKey } })
      if (res.ok) {
        const data = await res.json()
        setTestResult({ ok: true, message: `Connected — NowPayments: ${data.message || "OK"}` })
      } else {
        setTestResult({ ok: false, message: `API returned ${res.status}. Check your key.` })
      }
    } catch {
      setTestResult({ ok: false, message: "Connection failed. Check API key and network." })
    } finally {
      setTesting(false)
    }
  }

  function handlePriceChange(id: string, value: string) {
    setEditPlans((prev) => prev.map((p) => p.id === id ? { ...p, priceUSD: parseFloat(value) || 0 } : p))
  }

  function handleBadgeChange(id: string, value: string) {
    setEditPlans((prev) => prev.map((p) => p.id === id ? { ...p, badge: value || undefined } : p))
  }

  function toggleHighlight(id: string) {
    setEditPlans((prev) => prev.map((p) => p.id === id ? { ...p, highlight: !p.highlight } : p))
  }

  function handleSavePlans() {
    if (!config) return
    const updated = updatePlans(config, editPlans, effectiveFrom)
    setConfig(updated)
    saveConfig(updated)
    setPlansSaved(true)
    setTimeout(() => setPlansSaved(false), 2500)
  }

  function handleResetPlans() {
    setEditPlans(DEFAULT_PLANS)
  }

  // Per-month cost helper
  function perMonth(plan: SubscriptionPlan) {
    return (plan.priceUSD / plan.months).toFixed(2)
  }

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <CreditCard className="h-7 w-7 text-primary" />
          Payment Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage subscription plans, NowPayments API, and accepted cryptocurrencies.
        </p>
      </div>

      {/* Current status banner */}
      <div className={cn(
        "rounded-lg border-2 px-5 py-4 flex items-center justify-between",
        free ? "border-emerald-300 bg-emerald-50" : "border-pink-300 bg-pink-50"
      )}>
        <div>
          <p className={cn("text-sm font-bold", free ? "text-emerald-700" : "text-pink-700")}>
            {free ? "🟢 Posting is currently FREE" : "💳 Subscription plans active"}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {free
              ? "Providers can post ads without payment."
              : `Plans from $${Math.min(...config.plans.map((p) => p.priceUSD)).toFixed(2)} to $${Math.max(...config.plans.map((p) => p.priceUSD)).toFixed(2)}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Free mode</span>
          <Switch checked={config.freeMode} onCheckedChange={handleSetFreeMode} />
        </div>
      </div>

      {/* ── Subscription Plans ─────────────────────────────────────────────── */}
      <Section title="Subscription Plans">
        <p className="text-sm text-muted-foreground -mt-2">
          Set the price for each subscription tier. Changes are logged in rate history.
        </p>

        {/* Plan cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {editPlans.map((plan) => (
            <div
              key={plan.id}
              className={cn(
                "rounded-xl border-2 p-5 flex flex-col gap-3 transition-all",
                plan.highlight ? "border-pink-400 bg-pink-50" : "border-border bg-card"
              )}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-bold text-foreground">{plan.label}</p>
                  <p className="text-xs text-muted-foreground">${perMonth(plan)}/mo</p>
                </div>
                <button
                  onClick={() => toggleHighlight(plan.id)}
                  title="Toggle best value highlight"
                  className={cn("rounded-full p-1 transition-colors", plan.highlight ? "text-pink-500" : "text-muted-foreground hover:text-pink-400")}
                >
                  <Star className={cn("h-4 w-4", plan.highlight && "fill-pink-500")} />
                </button>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor={`price-${plan.id}`} className="text-xs">Price (USD)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                  <Input
                    id={`price-${plan.id}`}
                    type="number"
                    min="0"
                    step="0.01"
                    value={plan.priceUSD}
                    onChange={(e) => handlePriceChange(plan.id, e.target.value)}
                    className="pl-7 text-lg font-bold"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor={`badge-${plan.id}`} className="text-xs">Badge label (optional)</Label>
                <Input
                  id={`badge-${plan.id}`}
                  value={plan.badge || ""}
                  onChange={(e) => handleBadgeChange(plan.id, e.target.value)}
                  placeholder="e.g. Save 25%"
                  className="text-sm"
                />
              </div>

              {plan.highlight && (
                <Badge className="bg-pink-100 text-pink-700 text-xs w-fit">⭐ Best Value</Badge>
              )}
            </div>
          ))}
        </div>

        {/* Effective date + save */}
        <div className="flex flex-wrap items-end gap-4 pt-2 border-t border-border">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="eff-date">Effective From</Label>
            <Input
              id="eff-date"
              type="date"
              value={effectiveFrom}
              onChange={(e) => setEffectiveFrom(e.target.value)}
              className="w-44"
            />
          </div>
          <div className="flex gap-3">
            <Button onClick={handleSavePlans} className="bg-foreground text-background hover:bg-foreground/90">
              Save Plans
            </Button>
            <Button variant="outline" onClick={handleResetPlans}>
              Reset to Defaults
            </Button>
          </div>
          {plansSaved && (
            <span className="flex items-center gap-1.5 text-sm text-emerald-600">
              <CheckCircle className="h-4 w-4" /> Plans saved
            </span>
          )}
        </div>
      </Section>

      {/* ── Rate History ──────────────────────────────────────────────────── */}
      <Section title={`Rate History (${config.rateHistory.length} entries)`}>
        {config.rateHistory.length === 0 ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-4 justify-center">
            <History className="h-4 w-4" /> No rate changes recorded yet.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-left text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Period</th>
                  <th className="px-4 py-3 font-medium">1 Month</th>
                  <th className="px-4 py-3 font-medium">3 Months</th>
                  <th className="px-4 py-3 font-medium">6 Months</th>
                  <th className="px-4 py-3 font-medium">12 Months</th>
                  <th className="px-4 py-3 font-medium">Effective</th>
                  <th className="px-4 py-3 font-medium">Set At</th>
                </tr>
              </thead>
              <tbody>
                {config.rateHistory.map((r, i) => (
                  <tr key={r.id} className={cn("border-b border-border last:border-0", i === 0 && "bg-pink-50/50")}>
                    <td className="px-4 py-3 font-medium text-foreground">
                      {r.label}
                      {i === 0 && <Badge className="ml-2 bg-pink-100 text-pink-700 text-[10px]">Current</Badge>}
                    </td>
                    {(["1month","3months","6months","12months"] as const).map((planId) => {
                      const p = r.plans.find((x) => x.id === planId)
                      return (
                        <td key={planId} className="px-4 py-3 font-semibold text-foreground">
                          {p ? (p.priceUSD === 0 ? <span className="text-emerald-600">FREE</span> : `$${p.priceUSD.toFixed(2)}`) : "—"}
                        </td>
                      )
                    })}
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(r.effectiveFrom + "T00:00:00").toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(r.setAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      {/* ── API Credentials ────────────────────────────────────────────────── */}
      <Section title="NowPayments API Credentials">
        <div className="flex items-center justify-between -mt-2">
          <p className="text-sm text-muted-foreground">Required when plans have a price greater than $0.</p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Mode:</span>
            <Switch checked={config.sandboxMode} onCheckedChange={(v) => update({ sandboxMode: v })} />
            <Badge className={config.sandboxMode ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}>
              {config.sandboxMode ? "Sandbox" : "Live"}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="apiKey">API Key</Label>
            <div className="relative">
              <Input id="apiKey" type={showKey ? "text" : "password"} value={config.apiKey}
                onChange={(e) => update({ apiKey: e.target.value })} placeholder="Your NowPayments API key" className="pr-10" />
              <button type="button" onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ipnSecret">IPN Secret</Label>
            <div className="relative">
              <Input id="ipnSecret" type={showSecret ? "text" : "password"} value={config.ipnSecret}
                onChange={(e) => update({ ipnSecret: e.target.value })} placeholder="Your IPN secret key" className="pr-10" />
              <button type="button" onClick={() => setShowSecret(!showSecret)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleTest} disabled={testing}>
            {testing && <RefreshCw className="h-4 w-4 mr-1.5 animate-spin" />}
            Test Connection
          </Button>
          {testResult && (
            <span className={`flex items-center gap-1.5 text-sm ${testResult.ok ? "text-emerald-600" : "text-red-500"}`}>
              {testResult.ok ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              {testResult.message}
            </span>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          Get your API key at{" "}
          <a href="https://nowpayments.io" target="_blank" rel="noopener noreferrer" className="text-primary underline">nowpayments.io</a>
        </p>
      </Section>

      {/* ── Accepted Coins ────────────────────────────────────────────────── */}
      <Section title="Accepted Cryptocurrencies">
        <p className="text-sm text-muted-foreground -mt-2">Toggle which coins appear on the checkout page.</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(Object.entries(COINS) as [CoinId, typeof COINS[CoinId]][]).map(([id, coin]) => {
            const enabled = config.enabledCoins.includes(id)
            return (
              <button key={id} onClick={() => toggleCoin(id)}
                className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all ${enabled ? "shadow-md" : "border-border opacity-50 grayscale"}`}
                style={enabled ? { borderColor: coin.color, backgroundColor: coin.color + "12" } : {}}>
                <div className="flex h-12 w-12 items-center justify-center rounded-full text-xl font-black text-white" style={{ backgroundColor: coin.color }}>
                  {coin.symbol[0]}
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-foreground">{coin.symbol}</p>
                  <p className="text-xs text-muted-foreground">{coin.label}</p>
                </div>
                {enabled && <CheckCircle className="h-4 w-4" style={{ color: coin.color }} />}
              </button>
            )
          })}
        </div>
      </Section>

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} className="bg-foreground text-background hover:bg-foreground/90">Save API Settings</Button>
        {saved && <span className="flex items-center gap-1.5 text-sm text-emerald-600"><CheckCircle className="h-4 w-4" /> Saved</span>}
      </div>

    </div>
  )
}
