// ─── Types ────────────────────────────────────────────────────────────────────

export type CoinId = "btc" | "eth" | "sol" | "xrp"

export interface SubscriptionPlan {
  id: "1month" | "3months" | "6months" | "12months"
  label: string
  months: number
  priceUSD: number
  highlight?: boolean   // show as "best value" etc.
  badge?: string
}

export interface MonthlyRate {
  id: string
  label: string
  plans: SubscriptionPlan[]
  effectiveFrom: string
  setAt: string
  setBy: string
}

export interface NowPaymentsConfig {
  apiKey: string
  ipnSecret: string
  sandboxMode: boolean
  freeMode: boolean
  plans: SubscriptionPlan[]
  enabledCoins: CoinId[]
  rateHistory: MonthlyRate[]
}

// ─── Default plans ────────────────────────────────────────────────────────────

export const DEFAULT_PLANS: SubscriptionPlan[] = [
  { id: "1month",   label: "1 Month",   months: 1,  priceUSD: 39.99 },
  { id: "3months",  label: "3 Months",  months: 3,  priceUSD: 99.99, badge: "Save 17%" },
  { id: "6months",  label: "6 Months",  months: 6,  priceUSD: 179.99, badge: "Save 25%", highlight: true },
  { id: "12months", label: "12 Months", months: 12, priceUSD: 299.99, badge: "Save 37%" },
]

// ─── Coin definitions ─────────────────────────────────────────────────────────

export const COINS: Record<CoinId, { label: string; symbol: string; color: string; nowpaymentsCurrency: string }> = {
  btc: { label: "Bitcoin",  symbol: "BTC", color: "#F7931A", nowpaymentsCurrency: "btc" },
  eth: { label: "Ethereum", symbol: "ETH", color: "#627EEA", nowpaymentsCurrency: "eth" },
  sol: { label: "Solana",   symbol: "SOL", color: "#9945FF", nowpaymentsCurrency: "sol" },
  xrp: { label: "XRP",      symbol: "XRP", color: "#00AAE4", nowpaymentsCurrency: "xrp" },
}

// ─── Storage ──────────────────────────────────────────────────────────────────

const CONFIG_KEY = "providerpost_nowpayments_config"

const DEFAULT_CONFIG: NowPaymentsConfig = {
  apiKey: "",
  ipnSecret: "",
  sandboxMode: true,
  freeMode: true,
  plans: DEFAULT_PLANS,
  enabledCoins: ["btc", "eth", "sol", "xrp"],
  rateHistory: [],
}

export function getConfig(): NowPaymentsConfig {
  if (typeof window === "undefined") return DEFAULT_CONFIG
  try {
    const raw = localStorage.getItem(CONFIG_KEY)
    const stored = raw ? JSON.parse(raw) : {}
    return {
      ...DEFAULT_CONFIG,
      ...stored,
      plans: stored.plans?.length ? stored.plans : DEFAULT_PLANS,
    }
  } catch {
    return DEFAULT_CONFIG
  }
}

export function saveConfig(config: NowPaymentsConfig): void {
  if (typeof window === "undefined") return
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config))
}

// ─── Rate helpers ─────────────────────────────────────────────────────────────

export function updatePlans(config: NowPaymentsConfig, plans: SubscriptionPlan[], effectiveFrom: string): NowPaymentsConfig {
  const now = new Date(effectiveFrom + "T00:00:00")
  const label = now.toLocaleString("default", { month: "long", year: "numeric" })
  const entry: MonthlyRate = {
    id: crypto.randomUUID(),
    label,
    plans: [...plans],
    effectiveFrom,
    setAt: new Date().toISOString(),
    setBy: "Admin",
  }
  return {
    ...config,
    plans,
    freeMode: plans.every((p) => p.priceUSD === 0),
    rateHistory: [entry, ...config.rateHistory],
  }
}

// Keep addRateEntry as alias for backward compat
export function addRateEntry(
  config: NowPaymentsConfig,
  standardUSD: number,
  featuredUSD: number,
  effectiveFrom: string
): NowPaymentsConfig {
  return config // no-op, replaced by updatePlans
}

export function isFree(config: NowPaymentsConfig): boolean {
  return config.freeMode || config.plans.every((p) => p.priceUSD === 0)
}

export function getPlanById(config: NowPaymentsConfig, id: string): SubscriptionPlan | undefined {
  return config.plans.find((p) => p.id === id)
}

// ─── NowPayments API ──────────────────────────────────────────────────────────

export interface CreatePaymentParams {
  apiKey: string
  sandbox: boolean
  priceAmount: number
  priceCurrency: "usd"
  payCurrency: string
  orderId: string
  orderDescription: string
  ipnCallbackUrl?: string
  successUrl?: string
  cancelUrl?: string
}

export interface NowPaymentResponse {
  payment_id: string
  payment_status: string
  pay_address: string
  price_amount: number
  price_currency: string
  pay_amount: number
  pay_currency: string
  order_id: string
  order_description: string
  created_at: string
  updated_at: string
}

export interface PaymentStatusResponse {
  payment_id: string
  payment_status: "waiting" | "confirming" | "confirmed" | "sending" | "partially_paid" | "finished" | "failed" | "refunded" | "expired"
  pay_address: string
  pay_amount: number
  actually_paid: number
  pay_currency: string
  order_id: string
}

export function getBaseUrl(sandbox: boolean) {
  return sandbox
    ? "https://api-sandbox.nowpayments.io/v1"
    : "https://api.nowpayments.io/v1"
}

export async function createPayment(params: CreatePaymentParams): Promise<NowPaymentResponse> {
  const baseUrl = getBaseUrl(params.sandbox)
  const res = await fetch(`${baseUrl}/payment`, {
    method: "POST",
    headers: { "x-api-key": params.apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({
      price_amount: params.priceAmount,
      price_currency: params.priceCurrency,
      pay_currency: params.payCurrency,
      order_id: params.orderId,
      order_description: params.orderDescription,
      ipn_callback_url: params.ipnCallbackUrl,
      success_url: params.successUrl,
      cancel_url: params.cancelUrl,
    }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.message || `NowPayments error: ${res.status}`)
  }
  return res.json()
}

export async function getPaymentStatus(apiKey: string, sandbox: boolean, paymentId: string): Promise<PaymentStatusResponse> {
  const baseUrl = getBaseUrl(sandbox)
  const res = await fetch(`${baseUrl}/payment/${paymentId}`, { headers: { "x-api-key": apiKey } })
  if (!res.ok) throw new Error(`Status fetch error: ${res.status}`)
  return res.json()
}
