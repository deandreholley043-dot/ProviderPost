"use client"

import { useState, useEffect, useRef, useCallback, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Copy, CheckCircle, Clock, AlertCircle, RefreshCw, ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getConfig, COINS, isFree, getPlanById, type CoinId, type NowPaymentResponse, type PaymentStatusResponse } from "@/lib/nowpayments"

// ─── Types ────────────────────────────────────────────────────────────────────

type Step = "select-coin" | "awaiting-payment" | "confirming" | "complete" | "failed"

const STATUS_LABELS: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  waiting:        { label: "Waiting for payment",  color: "text-amber-600",   icon: Clock       },
  confirming:     { label: "Confirming on chain",  color: "text-blue-600",    icon: RefreshCw   },
  confirmed:      { label: "Confirmed",            color: "text-emerald-600", icon: CheckCircle },
  sending:        { label: "Processing",           color: "text-blue-600",    icon: RefreshCw   },
  partially_paid: { label: "Partially paid",       color: "text-amber-600",   icon: AlertCircle },
  finished:       { label: "Payment complete",     color: "text-emerald-600", icon: CheckCircle },
  failed:         { label: "Payment failed",       color: "text-red-500",     icon: AlertCircle },
  expired:        { label: "Payment expired",      color: "text-red-500",     icon: AlertCircle },
  refunded:       { label: "Refunded",             color: "text-muted-foreground", icon: RefreshCw },
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  function handleCopy() {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={handleCopy}
      className="ml-2 shrink-0 rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
      title="Copy to clipboard"
    >
      {copied ? <CheckCircle className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
    </button>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">Loading checkout…</div>}>
      <CheckoutInner />
    </Suspense>
  )
}

function CheckoutInner() {
  const searchParams  = useSearchParams()
  const router        = useRouter()
  const planParam     = searchParams.get("plan") || "standard"  // "standard" | "featured"

  const [config]      = useState(() => getConfig())
  const [step, setStep] = useState<Step>("select-coin")
  const [selectedCoin, setSelectedCoin] = useState<CoinId | null>(null)
  const [creating, setCreating]         = useState(false)
  const [createError, setCreateError]   = useState("")
  const [payment, setPayment]           = useState<NowPaymentResponse | null>(null)
  const [status, setStatus]             = useState<PaymentStatusResponse | null>(null)
  const [statusError, setStatusError]   = useState("")
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const plan = getPlanById(config, planParam) ?? config.plans[0]
  const discountParam = searchParams.get("discount")
  const discount = discountParam ? parseInt(discountParam) : 0
  const priceUSD = discount > 0
    ? parseFloat((plan.priceUSD * (1 - discount / 100)).toFixed(2))
    : plan.priceUSD
  const free = isFree(config)

  // ── Status polling ──────────────────────────────────────────────────────────
  const pollStatus = useCallback(async (paymentId: string) => {
    try {
      const res = await fetch(
        `/api/payments/status?paymentId=${paymentId}&sandbox=${config.sandboxMode}`
      )
      const data: PaymentStatusResponse = await res.json()
      setStatus(data)
      if (data.payment_status === "finished" || data.payment_status === "confirmed") {
        setStep("complete")
        if (pollRef.current) clearInterval(pollRef.current)
        setTimeout(() => router.push("/payment-success"), 2000)
      } else if (data.payment_status === "failed" || data.payment_status === "expired") {
        setStep("failed")
        if (pollRef.current) clearInterval(pollRef.current)
      } else if (data.payment_status === "confirming" || data.payment_status === "sending") {
        setStep("confirming")
      }
    } catch {
      setStatusError("Could not fetch payment status. Retrying…")
    }
  }, [config, router])

  useEffect(() => {
    if (payment?.payment_id && step === "awaiting-payment") {
      pollRef.current = setInterval(() => pollStatus(payment.payment_id), 8000)
      return () => { if (pollRef.current) clearInterval(pollRef.current) }
    }
  }, [payment, step, pollStatus])

  // ── Create payment ──────────────────────────────────────────────────────────
  async function handleCreatePayment() {
    if (!selectedCoin) return
    setCreating(true)
    setCreateError("")

    const orderId = `pp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    const payCurrency = COINS[selectedCoin].nowpaymentsCurrency

    if (!payCurrency || !selectedCoin) {
      setCreateError("Please select a payment currency.")
      setCreating(false)
      return
    }

    try {
      const res = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sandbox: config.sandboxMode,
          priceAmount: priceUSD,
          payCurrency,
          orderId,
          orderDescription: `ProviderPost ${plan?.label ?? planParam} Subscription`,
          successUrl: `${window.location.origin}/payment-success`,
          cancelUrl:  `${window.location.origin}/checkout?plan=${planParam}`,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Payment creation failed")

      setPayment(data)
      setStep("awaiting-payment")
    } catch (err: any) {
      setCreateError(err.message || "Something went wrong. Please try again.")
    } finally {
      setCreating(false)
    }
  }

  const coin = selectedCoin ? COINS[selectedCoin] : null

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-lg px-4 py-12 lg:px-8">
      {/* Back */}
      <Link
        href="/post"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Ad Form
      </Link>

      {/* Header */}
      <div className="rounded-md bg-pink-400 px-6 py-3 mb-8">
        <h1 className="text-xl font-extrabold text-foreground">CRYPTO CHECKOUT</h1>
      </div>

      {/* Order summary */}
      <div className="mb-6 rounded-lg border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">
              {plan?.label ?? planParam} Subscription
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {plan?.months ?? 1} month{(plan?.months ?? 1) > 1 ? "s" : ""} · ProviderPost
              {discount > 0 && <span className="ml-2 font-semibold text-emerald-600">{discount}% promo discount</span>}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-extrabold text-foreground">${priceUSD.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">USD</p>
          </div>
        </div>
        {config.sandboxMode && (
          <Badge className="mt-3 bg-amber-100 text-amber-700">Sandbox Mode — No real funds charged</Badge>
        )}
      </div>

      {/* Free mode — no payment needed */}
      {free && step === "select-coin" && (
        <div className="flex flex-col items-center gap-4 py-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle className="h-8 w-8 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Posting is Free!</h2>
          <p className="text-sm text-muted-foreground">
            No payment is required right now. Submit your ad and it will go live immediately.
          </p>
          <Button
            asChild
            className="bg-foreground text-background hover:bg-foreground/90"
          >
            <Link href="/payment-success">Submit Ad — Free</Link>
          </Button>
        </div>
      )}

      {/* ── STEP: Select coin ─────────────────────────────────────────────── */}
      {!free && step === "select-coin" && (
        <div className="flex flex-col gap-5">
          <p className="text-sm font-semibold text-foreground">Select payment currency:</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 sm:gap-3">
            {config.enabledCoins.map((id) => {
              const c = COINS[id]
              const active = selectedCoin === id
              return (
                <button
                  key={id}
                  onClick={() => setSelectedCoin(id)}
                  className="flex items-center gap-3 rounded-xl border-2 p-4 transition-all text-left"
                  style={{
                    borderColor: active ? c.color : "hsl(var(--border))",
                    backgroundColor: active ? c.color + "12" : "",
                  }}
                >
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white text-sm font-black"
                    style={{ backgroundColor: c.color }}
                  >
                    {c.symbol[0]}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-foreground">{c.symbol}</p>
                    <p className="text-xs text-muted-foreground">{c.label}</p>
                  </div>
                  {active && <CheckCircle className="ml-auto h-5 w-5" style={{ color: c.color }} />}
                </button>
              )
            })}
          </div>

          {createError && (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {createError}
            </div>
          )}

          <Button
            onClick={handleCreatePayment}
            disabled={!selectedCoin || creating}
            size="lg"
            className="bg-foreground text-background hover:bg-foreground/90"
          >
            {creating
              ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creating payment…</>
              : `Pay $${priceUSD.toFixed(2)} with ${selectedCoin ? COINS[selectedCoin].symbol : "Crypto"}`}
          </Button>
        </div>
      )}

      {/* ── STEP: Awaiting / confirming payment ───────────────────────────── */}
      {(step === "awaiting-payment" || step === "confirming") && payment && coin && (
        <div className="flex flex-col gap-5">
          {/* Status banner */}
          <div className="rounded-lg border border-border bg-card p-4 flex items-center gap-3">
            {(() => {
              const s = status?.payment_status
              const cfg = s ? STATUS_LABELS[s] : STATUS_LABELS["waiting"]
              const Icon = cfg?.icon ?? Clock
              return (
                <>
                  <Icon className={`h-5 w-5 shrink-0 ${cfg?.color ?? "text-amber-600"} ${step === "confirming" ? "animate-spin" : ""}`} />
                  <div>
                    <p className={`text-sm font-semibold ${cfg?.color ?? "text-amber-600"}`}>
                      {cfg?.label ?? "Waiting for payment"}
                    </p>
                    <p className="text-xs text-muted-foreground">Checking automatically every 8 seconds…</p>
                  </div>
                  <button
                    onClick={() => payment && pollStatus(payment.payment_id)}
                    className="ml-auto text-muted-foreground hover:text-foreground"
                    title="Refresh status"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                </>
              )
            })()}
          </div>

          {/* Amount to send */}
          <div className="rounded-lg border-2 p-5 text-center" style={{ borderColor: coin.color, backgroundColor: coin.color + "0a" }}>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Send exactly</p>
            <p className="text-3xl font-extrabold" style={{ color: coin.color }}>
              {payment.pay_amount} {coin.symbol}
            </p>
            <p className="text-xs text-muted-foreground mt-1">≈ ${priceUSD.toFixed(2)} USD</p>
            {payment.pay_amount && (
              <div className="mt-2 flex items-center justify-center">
                <span className="font-mono text-sm text-foreground">{payment.pay_amount}</span>
                <CopyButton text={String(payment.pay_amount)} />
              </div>
            )}
          </div>

          {/* Wallet address */}
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              Send to this {coin.label} address:
            </p>
            <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-2">
              <span className="font-mono text-xs text-foreground break-all">{payment.pay_address}</span>
              <CopyButton text={payment.pay_address} />
            </div>
          </div>

          {/* If partially paid */}
          {status?.payment_status === "partially_paid" && (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <strong>Partial payment received:</strong> {status.actually_paid} {coin.symbol} of {status.pay_amount} {coin.symbol} required.
              Please send the remaining amount to complete your order.
            </div>
          )}

          {statusError && (
            <p className="text-xs text-muted-foreground">{statusError}</p>
          )}

          {/* Payment ID */}
          <p className="text-xs text-muted-foreground">
            Payment ID: <span className="font-mono">{payment.payment_id}</span>
          </p>
        </div>
      )}

      {/* ── STEP: Complete ────────────────────────────────────────────────── */}
      {step === "complete" && (
        <div className="flex flex-col items-center gap-4 py-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle className="h-8 w-8 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Payment Confirmed!</h2>
          <p className="text-sm text-muted-foreground">Redirecting you to your ad dashboard…</p>
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* ── STEP: Failed ─────────────────────────────────────────────────── */}
      {step === "failed" && (
        <div className="flex flex-col items-center gap-4 py-8 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-foreground">Payment Failed</h2>
          <p className="text-sm text-muted-foreground">
            Your payment {status?.payment_status === "expired" ? "expired" : "failed"}. No funds were charged.
          </p>
          <Button
            onClick={() => { setStep("select-coin"); setPayment(null); setStatus(null) }}
            variant="outline"
          >
            Try Again
          </Button>
        </div>
      )}

      {/* Security note */}
      {!free && step === "select-coin" && (
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Powered by{" "}
          <a href="https://nowpayments.io" target="_blank" rel="noopener noreferrer" className="text-primary underline">
            NOWPayments
          </a>
          {" "}· All transactions are processed securely on-chain.
        </p>
      )}
    </div>
  )
}
