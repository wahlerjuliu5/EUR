import Link from "next/link"
import { Search, MapPin, Star, Shield, Clock, CheckCircle, Percent, HandCoins } from "lucide-react"
import { Nav } from "@/components/nav"

const CATEGORIES = [
  { label: "Plumber", emoji: "🔧" },
  { label: "Electrician", emoji: "⚡" },
  { label: "Handyman", emoji: "🔨" },
  { label: "Painter", emoji: "🎨" },
  { label: "Carpenter", emoji: "🪚" },
  { label: "Cleaner", emoji: "🧹" },
  { label: "Gardener", emoji: "🌱" },
  { label: "HVAC", emoji: "❄️" },
  { label: "Locksmith", emoji: "🔐" },
  { label: "Roofer", emoji: "🏠" },
  { label: "Tiler", emoji: "🪟" },
]

const STEPS = [
  {
    icon: Search,
    step: "1",
    title: "Search",
    desc: "Filter by trade, location, price, and availability to find your perfect match.",
  },
  {
    icon: Clock,
    step: "2",
    title: "Book instantly",
    desc: "Pick an available slot and confirm in seconds — no back-and-forth calls.",
  },
  {
    icon: Star,
    step: "3",
    title: "Get it done",
    desc: "Your tradesperson arrives, completes the job, and you receive a digital invoice.",
  },
]

const TRUST = [
  {
    icon: Shield,
    title: "Verified professionals",
    desc: "ID and trade certification checked before listing",
  },
  {
    icon: Star,
    title: "Genuine reviews",
    desc: "Only from verified, completed bookings",
  },
  {
    icon: Clock,
    title: "Real-time availability",
    desc: "Book for today or schedule weeks ahead",
  },
]


export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Nav />

      {/* Hero */}
      <section className="border-b px-6 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest text-primary">
            Trusted tradespeople, on demand
          </p>
          <h1 className="mb-4 text-5xl font-bold leading-tight tracking-tight sm:text-6xl">
            Book a tradesperson you can trust, instantly.
          </h1>
          <p className="mb-12 text-base text-muted-foreground">
            Find vetted plumbers, electricians, handymen and more — available
            near you, today.
          </p>

          <form
            action="/search"
            method="GET"
            className="mx-auto flex max-w-2xl flex-col gap-2 rounded-xl border bg-card p-2 shadow-sm sm:flex-row"
          >
            <select
              name="q"
              defaultValue=""
              className="flex-1 rounded-lg bg-muted px-4 py-2.5 text-sm text-foreground outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="" disabled>
                Select a trade
              </option>
              {CATEGORIES.map((c) => (
                <option key={c.label} value={c.label}>
                  {c.label}
                </option>
              ))}
            </select>

            <div className="relative flex-1">
              <MapPin className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                name="city"
                type="text"
                placeholder="City (e.g. Amsterdam)"
                className="w-full rounded-lg bg-muted py-2.5 pl-9 pr-4 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>

            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Search className="size-4" />
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b bg-muted/40">
        <div className="mx-auto flex max-w-5xl flex-wrap justify-center gap-x-16 gap-y-4 px-6 py-10 text-center">
          {[
            ["50,000+", "Vetted tradespeople"],
            ["500,000+", "Completed bookings"],
            ["4.8★", "Average rating"],
            ["< 3 min", "Average time to book"],
          ].map(([stat, label]) => (
            <div key={label}>
              <p className="text-3xl font-bold">{stat}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-2 text-center text-3xl font-bold tracking-tight">
            Browse by trade
          </h2>
          <p className="mb-10 text-center text-muted-foreground">
            From emergency repairs to full renovations.
          </p>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.label}
                href={`/search?q=${cat.label}`}
                className="flex flex-col items-center gap-2 rounded-xl border bg-card px-3 py-5 text-center transition-all hover:border-primary/40 hover:bg-muted/50 hover:shadow-sm"
              >
                <span className="text-3xl">{cat.emoji}</span>
                <span className="text-xs font-medium">{cat.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-y bg-muted/40 px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-2 text-center text-3xl font-bold tracking-tight">
            How it works
          </h2>
          <p className="mb-14 text-center text-muted-foreground">
            From search to signed invoice in minutes.
          </p>
          <div className="grid gap-10 sm:grid-cols-3">
            {STEPS.map(({ icon: Icon, step, title, desc }) => (
              <div
                key={step}
                className="flex flex-col items-center text-center"
              >
                <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <Icon className="size-5" />
                </div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Step {step}
                </p>
                <h3 className="mb-2 text-lg font-semibold">{title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-2 text-center text-3xl font-bold tracking-tight">
            Fair for everyone
          </h2>
          <p className="mb-12 text-center text-muted-foreground">
            No subscriptions. No hidden fees. Just a small commission that
            rewards everyone involved.
          </p>

          {/* Commission explainer */}
          <div className="mb-10 rounded-xl border bg-primary/5 p-6 text-center">
            <p className="text-sm font-medium uppercase tracking-widest text-primary">
              How the commission works
            </p>
            <p className="mt-3 text-4xl font-bold">10%</p>
            <p className="mt-1 text-muted-foreground">
              platform fee, added to the service price at checkout
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm">
              <span className="flex items-center gap-2 rounded-full border bg-card px-4 py-1.5">
                <span className="size-2 rounded-full bg-primary" />
                7% goes to HandyBook
              </span>
              <span className="flex items-center gap-2 rounded-full border bg-card px-4 py-1.5">
                <span className="size-2 rounded-full bg-accent" />
                3% goes back to the tradesperson as a loyalty bonus
              </span>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {/* Homeowner card */}
            <div className="flex flex-col gap-4 rounded-xl border bg-card p-6">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                  <Percent className="size-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Homeowners</p>
                  <p className="text-sm text-muted-foreground">
                    Pay the service price + 10%
                  </p>
                </div>
              </div>
              <ul className="flex flex-col gap-2.5 text-sm">
                {[
                  "Browse and book any verified pro for free",
                  "10% platform fee added transparently at checkout",
                  "Full price breakdown shown before you confirm",
                  "Secure payments and digital invoices included",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 size-4 shrink-0 text-primary" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="mt-auto inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Get started — it&apos;s free
              </Link>
            </div>

            {/* Tradesperson card */}
            <div className="flex flex-col gap-4 rounded-xl border bg-card p-6">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-accent/10">
                  <HandCoins className="size-5 text-accent" />
                </div>
                <div>
                  <p className="font-semibold">Tradespeople</p>
                  <p className="text-sm text-muted-foreground">
                    Always free — and you earn more
                  </p>
                </div>
              </div>
              <ul className="flex flex-col gap-2.5 text-sm">
                {[
                  "No monthly fee, no listing cost — ever",
                  "Keep 100% of your quoted rate",
                  "Earn a 3% loyalty bonus on every completed job",
                  "Bonus paid directly to your account monthly",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 size-4 shrink-0 text-accent" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="mt-auto inline-flex items-center justify-center rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
              >
                Join as a tradesperson
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="border-t bg-muted/40 px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-wrap justify-center gap-12">
            {TRUST.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-card">
                  <Icon className="size-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{title}</p>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t bg-muted/40 px-6 py-8">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© 2026 HandyBook. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="transition-colors hover:text-foreground">
              Privacy
            </a>
            <a href="#" className="transition-colors hover:text-foreground">
              Terms
            </a>
            <a href="#" className="transition-colors hover:text-foreground">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
