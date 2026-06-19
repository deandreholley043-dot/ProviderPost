import Link from "next/link"
import { CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function PaymentSuccessPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 mx-auto">
        <CheckCircle className="h-10 w-10 text-emerald-600" />
      </div>
      <h1 className="mt-6 text-3xl font-extrabold text-foreground">Payment Received!</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        Your crypto payment has been confirmed. Your ad will be published shortly.
        You will receive a confirmation once your listing goes live.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button asChild className="bg-foreground text-background hover:bg-foreground/90">
          <Link href="/post">Post Another Ad</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/browse">Browse Ads</Link>
        </Button>
      </div>
    </div>
  )
}
