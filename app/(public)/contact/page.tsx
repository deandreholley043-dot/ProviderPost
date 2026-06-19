"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { MapPin } from "lucide-react"

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-12 lg:px-8">
      <div className="rounded-md bg-pink-400 px-6 py-3 mb-8">
        <h1 className="text-xl font-extrabold text-foreground">CONTACT US</h1>
      </div>

      {/* Office address */}
      <div className="mb-8 flex items-start gap-3 rounded-lg border border-border bg-card p-4">
        <MapPin className="h-5 w-5 text-pink-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-foreground mb-1">Our Office</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            #254, Preah Monivong Blvd<br />
            Sangkat Chaktomuk, Khan Daun Penh<br />
            Phnom Penh 120207<br />
            Cambodia
          </p>
        </div>
      </div>

      <form className="flex flex-col gap-5" onSubmit={(e) => e.preventDefault()}>
        <div className="flex flex-col gap-2">
          <Label htmlFor="name">Your Name</Label>
          <Input id="name" placeholder="Full name" />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email Address</Label>
          <Input id="email" type="email" placeholder="your@email.com" />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="subject">Subject</Label>
          <Input id="subject" placeholder="How can we help?" />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="message">Message</Label>
          <Textarea id="message" placeholder="Your message..." rows={5} />
        </div>

        <Button type="submit" size="lg" className="bg-foreground text-background hover:bg-foreground/90">
          Send Message
        </Button>
      </form>
    </div>
  )
}
