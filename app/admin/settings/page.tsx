"use client"

import { useState, useEffect } from "react"
import { PageShell } from "@/components/page-shell"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { CheckCircle } from "lucide-react"
import { getSiteSettings, saveSiteSettings, type SiteSettings } from "@/lib/site-settings"

export default function SettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => { setSettings(getSiteSettings()) }, [])

  if (!settings) return null

  function update(patch: Partial<SiteSettings>) {
    setSettings((s) => s ? { ...s, ...patch } : s)
    setSaved(false)
  }

  function handleSave() {
    saveSiteSettings(settings!)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <PageShell
      title="Site Settings"
      description="Configure global site settings, branding, and feature flags."
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* General */}
        <div className="flex flex-col gap-6 rounded-lg border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-card-foreground">General</h2>
          <div className="flex flex-col gap-2">
            <Label htmlFor="siteName">Site Name</Label>
            <Input
              id="siteName"
              value={settings.siteName}
              onChange={(e) => update({ siteName: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="siteDesc">Site Description</Label>
            <Input
              id="siteDesc"
              value={settings.siteDescription}
              onChange={(e) => update({ siteDescription: e.target.value })}
              placeholder="A brief site description"
            />
          </div>
        </div>

        {/* Features */}
        <div className="flex flex-col gap-5 rounded-lg border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-card-foreground">Features</h2>

          <div className="flex items-center justify-between">
            <div>
              <Label>Enable User Registration</Label>
              <p className="text-xs text-muted-foreground mt-0.5">Allow new users to register accounts</p>
            </div>
            <Switch
              checked={settings.enableRegistration}
              onCheckedChange={(v) => update({ enableRegistration: v })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Enable Reviews</Label>
              <p className="text-xs text-muted-foreground mt-0.5">Show the review box on provider profiles</p>
            </div>
            <Switch
              checked={settings.enableReviews}
              onCheckedChange={(v) => update({ enableReviews: v })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Enable Forum</Label>
              <p className="text-xs text-muted-foreground mt-0.5">Show forum sections site-wide</p>
            </div>
            <Switch
              checked={settings.enableForum}
              onCheckedChange={(v) => update({ enableForum: v })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Require Email Verification</Label>
              <p className="text-xs text-muted-foreground mt-0.5">Users must verify email before posting</p>
            </div>
            <Switch
              checked={settings.requireEmailVerification}
              onCheckedChange={(v) => update({ requireEmailVerification: v })}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} className="bg-foreground text-background hover:bg-foreground/90">
          Save Changes
        </Button>
        {saved && (
          <span className="flex items-center gap-1.5 text-sm text-emerald-600">
            <CheckCircle className="h-4 w-4" /> Saved
          </span>
        )}
      </div>
    </PageShell>
  )
}
