"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { PhotoUploader } from "@/components/photo-uploader"
import { ZipcodeLookup } from "@/components/zipcode-lookup"
import { US_STATES, CA_PROVINCES } from "@/lib/us-states"
import type { ZipLookupResult } from "@/lib/zipcode-db"
import { getConfig, isFree, type NowPaymentsConfig } from "@/lib/nowpayments"
import { validatePromoCode, redeemPromoCode, getUserPromoStatus, promoTypeLabel } from "@/lib/promo-store"
import { CheckCircle, Tag, X } from "lucide-react"

// ─── Auth placeholder ─────────────────────────────────────────────────────────
// Replace with real session — e.g. const { data: session } = useSession()
// Then use session.user.name or session.user.email as the username.
const CURRENT_USERNAME = "" // empty = not logged in

export default function PostAdPage() {
  const router = useRouter()
  const [charCount, setCharCount] = useState(0)
  const [selectedLocation, setSelectedLocation] = useState<ZipLookupResult | null>(null)
  const [selectedState, setSelectedState] = useState("")
  const [providerName, setProviderName] = useState("")
  const [payConfig, setPayConfig] = useState<NowPaymentsConfig | null>(null)

  // Promo code state
  const [promoInput, setPromoInput]     = useState("")
  const [promoError, setPromoError]     = useState("")
  const [promoApplied, setPromoApplied] = useState<{ code: string; label: string; type: string } | null>(null)
  const [promoFree, setPromoFree]       = useState(false)
  const [promoDiscount, setPromoDiscount] = useState(0)

  useEffect(() => {
    setPayConfig(getConfig())
    // Check if user already has an active promo
    const status = getUserPromoStatus(CURRENT_USERNAME)
    if (status.hasFreePosting) {
      setPromoFree(true)
      setPromoApplied({ code: "ACTIVE", label: "Free posting period active", type: "free" })
    } else if (status.discountPercent > 0) {
      setPromoDiscount(status.discountPercent)
      setPromoApplied({ code: "ACTIVE", label: `${status.discountPercent}% discount applied`, type: "discount" })
    }
  }, [])

  const siteFree = payConfig ? isFree(payConfig) : true
  const free = siteFree || promoFree

  function applyPromo() {
    setPromoError("")
    if (!promoInput.trim()) { setPromoError("Enter a promo code."); return }
    const result = validatePromoCode(promoInput, CURRENT_USERNAME)
    if (!result.valid) { setPromoError(result.error); return }

    const redemption = redeemPromoCode(promoInput, CURRENT_USERNAME)
    if (!redemption) { setPromoError("Failed to apply code."); return }

    const label = promoTypeLabel(result.promo.type, result.promo.value)
    setPromoApplied({ code: result.promo.code, label, type: result.promo.type })

    if (result.promo.type !== "percent_discount") {
      setPromoFree(true)
    } else {
      setPromoDiscount(result.promo.value)
    }
    setPromoInput("")
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 lg:px-8">
      {/* Banner */}
      <div className="rounded-md bg-pink-400 px-6 py-3 mb-8">
        <h1 className="text-xl font-extrabold text-foreground">POST FREE AD</h1>
      </div>

      <form className="flex flex-col gap-8" onSubmit={(e) => e.preventDefault()}>

        {/* PROFILE INFORMATION */}
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="bg-pink-400 px-4 py-2">
            <h2 className="font-bold text-foreground">Profile Information</h2>
          </div>
          <div className="bg-pink-50 px-4 py-5 flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="prov-name">Provider Name</Label>
                <Input id="prov-name" placeholder="e.g. Lisa" value={providerName} onChange={(e) => setProviderName(e.target.value)} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="gender">Gender</Label>
                <select id="gender" className="rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="">Select...</option>
                  <option>Female</option>
                  <option>Male</option>
                  <option>Trans</option>
                  <option>Non-binary</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor="age">Age</Label>
                <Input id="age" placeholder="e.g. 25" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="height">Height</Label>
                <Input id="height" placeholder={'e.g. 5\'6"'} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="weight">Weight</Label>
                <Input id="weight" placeholder="e.g. 125 lbs" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="ethnicity">Ethnicity</Label>
                <select id="ethnicity" className="rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="">Select...</option>
                  <option value="Ebony">Ebony</option>
                  <option value="White">White</option>
                  <optgroup label="Latin">
                    <option value="Latin">Latin (General)</option>
                    <option value="Mexican">Mexican</option>
                    <option value="El Salvadorian">El Salvadorian</option>
                    <option value="Colombian">Colombian</option>
                    <option value="Brazilian">Brazilian</option>
                    <option value="Venezuelan">Venezuelan</option>
                  </optgroup>
                  <option value="Native American">Native American</option>
                  <optgroup label="Asian">
                    <option value="Asian">Asian (General)</option>
                    <option value="Chinese">Chinese</option>
                    <option value="Japanese">Japanese</option>
                    <option value="Korean">Korean</option>
                    <option value="Vietnamese">Vietnamese</option>
                    <option value="Thai">Thai</option>
                    <option value="Cambodian">Cambodian</option>
                    <option value="Filipina">Filipina</option>
                    <option value="Indian">Indian</option>
                  </optgroup>
                  <option value="Middle East">Middle East</option>
                  <option value="Mixed">Mixed</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="sees">Sees</Label>
                <select id="sees" className="rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="">Select...</option>
                  <option>Gentlemen</option>
                  <option>Couples</option>
                  <option>Gentlemen &amp; Couples</option>
                  <option>Everyone</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* SERVICES / AVAILABILITY */}
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="bg-pink-400 px-4 py-2">
            <h2 className="font-bold text-foreground">Services / Availability</h2>
          </div>
          <div className="bg-pink-50 px-4 py-5 flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="quick-visit">Quick Visit</Label>
                <Input id="quick-visit" placeholder="e.g. $80" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="half-hour">Half Hour</Label>
                <Input id="half-hour" placeholder="e.g. $150" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="hour">Hour</Label>
                <Input id="hour" placeholder="e.g. $250" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="overnight">Overnight</Label>
                <Input id="overnight" placeholder="e.g. $900" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label>Service Type</Label>
                <select className="rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option value="">Select...</option>
                  <option>Incall</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* CONTACT INFO */}
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="bg-pink-400 px-4 py-2">
            <h2 className="font-bold text-foreground">Contact Info</h2>
          </div>
          <div className="bg-pink-50 px-4 py-5 flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" placeholder="e.g. 15125551234" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="whatsapp">
                  <span className="flex items-center gap-1.5">
                    <span className="inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-black text-white" style={{ backgroundColor: "#25D366" }}>W</span>
                    WhatsApp Number
                  </span>
                </Label>
                <Input id="whatsapp" placeholder="e.g. +15125551234" />
                <p className="text-xs text-muted-foreground">Include country code — visitors can tap to open WhatsApp directly</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="wechat">
                  <span className="flex items-center gap-1.5">
                    <span className="inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-black text-white" style={{ backgroundColor: "#07C160" }}>W</span>
                    WeChat ID
                  </span>
                </Label>
                <Input id="wechat" placeholder="e.g. yourwechatid" />
                <p className="text-xs text-muted-foreground">Your WeChat username — visitors can copy and search you</p>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="messaging">Other Messaging Apps</Label>
                <Input id="messaging" placeholder="e.g. Telegram, Signal" />
              </div>
            </div>
          </div>
        </div>

        {/* LOCATION */}
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="bg-pink-400 px-4 py-2">
            <h2 className="font-bold text-foreground">Location</h2>
          </div>
          <div className="bg-pink-50 px-4 py-5 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label>City / Region (Zip Code Lookup)</Label>
              <ZipcodeLookup
                placeholder="Enter your zip code or city name..."
                onLocationSelect={(result) => {
                  setSelectedLocation(result)
                  setSelectedState(result.state)
                }}
                className="w-full"
                size="md"
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="state">State</Label>
                <select
                  id="state"
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select region...</option>
                  <optgroup label="🇺🇸 United States">
                    {US_STATES.map((s) => (
                      <option key={s.code} value={s.code}>{s.name} ({s.code})</option>
                    ))}
                  </optgroup>
                  <optgroup label="🇨🇦 Canada">
                    {CA_PROVINCES.map((s) => (
                      <option key={s.code} value={s.code}>{s.name} ({s.code})</option>
                    ))}
                  </optgroup>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={selectedLocation?.city || ""}
                  readOnly={!!selectedLocation}
                  placeholder="Auto-filled from zip code"
                  className={selectedLocation ? "bg-muted" : ""}
                />
              </div>
            </div>
          </div>
        </div>

        {/* PHOTOS */}
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="bg-pink-400 px-4 py-2">
            <h2 className="font-bold text-foreground">Photos</h2>
          </div>
          <div className="bg-pink-50 px-4 py-5">
            <PhotoUploader />
          </div>
        </div>

        {/* DESCRIPTION */}
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="bg-pink-400 px-4 py-2">
            <h2 className="font-bold text-foreground">Description</h2>
          </div>
          <div className="bg-pink-50 px-4 py-5 flex flex-col gap-2">
            <Textarea
              id="description"
              placeholder="Describe yourself, your services, availability, and anything else clients should know. Be detailed for better results."
              rows={6}
              onChange={(e) => setCharCount(e.target.value.length)}
            />
            <p className="text-xs text-muted-foreground italic">{charCount} characters</p>
          </div>
        </div>

        {/* Payment section */}
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="bg-pink-400 px-4 py-2">
            <h2 className="font-bold text-foreground">Choose Your Plan</h2>
          </div>
          <div className="bg-pink-50 px-4 py-5 flex flex-col gap-4">

            {/* Promo code entry */}
            {!siteFree && !promoApplied && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="promo-code" className="flex items-center gap-1.5 text-sm">
                  <Tag className="h-4 w-4 text-primary" /> Have a promo code?
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="promo-code"
                    value={promoInput}
                    onChange={(e) => { setPromoInput(e.target.value.toUpperCase()); setPromoError("") }}
                    placeholder="e.g. SUMMER50"
                    className="font-mono tracking-wider max-w-xs"
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); applyPromo() } }}
                  />
                  <Button type="button" variant="outline" onClick={applyPromo}>Apply</Button>
                </div>
                {promoError && <p className="text-sm text-red-500">{promoError}</p>}
              </div>
            )}

            {/* Applied promo badge */}
            {promoApplied && promoApplied.code !== "ACTIVE" && (
              <div className="flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2">
                <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                <div className="flex-1">
                  <span className="font-mono font-bold text-emerald-700 text-sm">{promoApplied.code}</span>
                  <span className="ml-2 text-sm text-emerald-600">{promoApplied.label}</span>
                </div>
                <button onClick={() => { setPromoApplied(null); setPromoFree(false); setPromoDiscount(0) }}
                  className="text-emerald-400 hover:text-emerald-700">
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Free mode */}
            {free ? (
              <>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0" />
                  <p className="text-sm font-medium text-emerald-700">
                    {promoFree && !siteFree ? "Promo applied — posting is free!" : "Posting is currently FREE — no payment required"}
                  </p>
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="self-start bg-foreground text-background hover:bg-foreground/90"
                  onClick={(e) => {
                    e.preventDefault()
                    const title = providerName.trim() || "Your Ad"
                    const date  = new Date().toISOString()
                    router.push(
                      `/user/account?submitted=1&title=${encodeURIComponent(title)}&date=${encodeURIComponent(date)}`
                    )
                  }}
                >
                  Submit Ad — Free
                </Button>
              </>
            ) : (
              <>
                <p className="text-xs text-muted-foreground">
                  Select a subscription plan to publish your ad. Pay securely with crypto via NOWPayments.
                  {promoDiscount > 0 && <span className="ml-1 font-semibold text-emerald-600">{promoDiscount}% promo discount applied.</span>}
                </p>

                {/* Rate explanation */}
                <div className="rounded-lg border border-border bg-card p-4 flex flex-col gap-3">
                  <p className="text-sm font-bold text-foreground">What you get with every plan:</p>
                  <ul className="flex flex-col gap-1.5 text-sm text-muted-foreground">
                    {[
                      "Your ad stays live and visible for the full subscription period",
                      "Full profile page with photos, videos, contact info and rates",
                      "Searchable by city, state, and province across the US & Canada",
                      "WhatsApp and WeChat contact buttons on your profile",
                      "Hobbyist users can save your profile to their favorites",
                      "Verified badge available once your profile is reviewed by admin",
                      "Renew anytime — your ad stays active until the period ends",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="mt-0.5 shrink-0 text-emerald-500">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>

                  <div className="border-t border-border pt-3 mt-1">
                    <p className="text-sm font-bold text-foreground mb-2">Plan breakdown:</p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-border text-left text-muted-foreground text-xs">
                            <th className="pb-2 font-medium">Plan</th>
                            <th className="pb-2 font-medium">Duration</th>
                            <th className="pb-2 font-medium">Total Price</th>
                            <th className="pb-2 font-medium">Per Month</th>
                            <th className="pb-2 font-medium">Savings vs Monthly</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(payConfig?.plans ?? []).map((plan, i) => {
                            const baseMonthly = payConfig?.plans[0]?.priceUSD ?? 39.99
                            const fullPrice = baseMonthly * plan.months
                            const savings = fullPrice - plan.priceUSD
                            const savingsPct = Math.round((savings / fullPrice) * 100)
                            const finalPrice = promoDiscount > 0
                              ? plan.priceUSD * (1 - promoDiscount / 100)
                              : plan.priceUSD
                            const perMonth = (finalPrice / plan.months).toFixed(2)

                            return (
                              <tr key={plan.id} className={`border-b border-border last:border-0 ${plan.highlight ? "bg-pink-50" : ""}`}>
                                <td className="py-2 font-medium text-foreground">
                                  {plan.label}
                                  {plan.highlight && <span className="ml-2 rounded-full bg-pink-200 px-2 py-0.5 text-[10px] font-bold text-pink-700">Best Value</span>}
                                </td>
                                <td className="py-2 text-muted-foreground">{plan.months} month{plan.months > 1 ? "s" : ""}</td>
                                <td className="py-2 font-bold text-foreground">
                                  ${finalPrice.toFixed(2)}
                                  {promoDiscount > 0 && (
                                    <span className="ml-1 text-xs font-normal text-muted-foreground line-through">${plan.priceUSD.toFixed(2)}</span>
                                  )}
                                </td>
                                <td className="py-2 text-foreground">${perMonth}/mo</td>
                                <td className="py-2">
                                  {i === 0
                                    ? <span className="text-muted-foreground text-xs">—</span>
                                    : <span className="text-emerald-600 font-medium text-xs">Save ${savings.toFixed(2)} ({savingsPct}%)</span>
                                  }
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground border-t border-border pt-3">
                    All payments are processed securely via <span className="font-medium text-foreground">NOWPayments</span>.
                    Accepted: Bitcoin (BTC), Ethereum (ETH), Solana (SOL), and XRP.
                    Your ad goes live as soon as payment is confirmed on-chain — usually within minutes.
                  </p>
                </div>

                {/* Plan cards */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {(payConfig?.plans ?? []).map((plan) => {
                    const finalPrice = promoDiscount > 0
                      ? plan.priceUSD * (1 - promoDiscount / 100)
                      : plan.priceUSD
                    const perMonth = (finalPrice / plan.months).toFixed(2)

                    return (
                      <button
                        key={plan.id}
                        type="button"
                        onClick={() => {
                          const discount = promoDiscount > 0 ? `&discount=${promoDiscount}` : ""
                          window.location.href = `/checkout?plan=${plan.id}${discount}`
                        }}
                        className={`relative flex flex-col items-center rounded-xl border-2 p-4 text-center transition-all hover:shadow-md hover:-translate-y-0.5 ${
                          plan.highlight
                            ? "border-pink-400 bg-white"
                            : "border-border bg-white hover:border-pink-300"
                        }`}
                      >
                        {plan.badge && (
                          <span className={`absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full px-2.5 py-0.5 text-[10px] font-bold whitespace-nowrap ${
                            plan.highlight ? "bg-pink-400 text-white" : "bg-muted text-muted-foreground"
                          }`}>
                            {plan.badge}
                          </span>
                        )}
                        <p className="text-sm font-bold text-foreground mt-1">{plan.label}</p>
                        <p className="text-xl font-extrabold text-foreground mt-1">
                          ${finalPrice.toFixed(2)}
                          {promoDiscount > 0 && (
                            <span className="ml-1 text-xs text-muted-foreground line-through">${plan.priceUSD.toFixed(2)}</span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">${perMonth}/mo</p>
                        <span className="mt-3 w-full rounded-lg bg-foreground px-3 py-1.5 text-xs font-bold text-background">
                          Select
                        </span>
                      </button>
                    )
                  })}
                </div>

                <p className="text-[10px] text-muted-foreground">
                  Bitcoin (BTC) · Ethereum (ETH) · Solana (SOL) · XRP · Powered by NOWPayments
                </p>
              </>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}
