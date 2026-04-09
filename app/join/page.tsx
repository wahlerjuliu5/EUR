import { BookCheck } from "lucide-react"
import Link from "next/link"
import { Nav } from "@/components/nav"
import { HandymanForm } from "./handyman-form"

export const metadata = {
  title: "Join as a Tradesperson — HandyBook",
  description:
    "Create your HandyBook profile and start receiving bookings from local homeowners.",
}

export default function JoinPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Nav />

      {/* Hero banner */}
      <div className="border-b bg-muted/40 px-6 py-8">
        <div className="mx-auto max-w-xl">
          <div className="flex items-center gap-2 text-primary">
            <BookCheck className="size-5" />
            <span className="text-sm font-semibold uppercase tracking-widest">
              For Tradespeople
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-bold">
            Join HandyBook and grow your business
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Free to join. Keep 100% of your rate. Earn a 3% loyalty bonus on
            every job.
          </p>
          <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
            {[
              "No monthly fee",
              "Your own public profile",
              "Real-time booking requests",
              "Digital invoicing",
            ].map((f) => (
              <span
                key={f}
                className="flex items-center gap-1 rounded-full border bg-card px-3 py-1"
              >
                <span className="size-1.5 rounded-full bg-primary" />
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>

      <HandymanForm />

      <footer className="mt-auto border-t bg-muted/40 px-6 py-6">
        <div className="mx-auto flex max-w-xl flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© 2026 HandyBook. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/login" className="hover:text-foreground">
              Sign in
            </Link>
            <Link href="/signup" className="hover:text-foreground">
              Homeowner signup
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
