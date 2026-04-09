import Link from "next/link"
import { Search, MapPin, Star, Shield, Clock } from "lucide-react"
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
]

const STEPS = [
  {
    icon: Search,
    step: "1",
    title: "Search",
    desc: "Filter by trade, location, price, and availability to find your match.",
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
    desc: "ID + trade certification checked",
  },
  {
    icon: Star,
    title: "Genuine reviews",
    desc: "Only from completed bookings",
  },
  {
    icon: Clock,
    title: "Real-time availability",
    desc: "Book for today or schedule ahead",
  },
]

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Nav />

      {/* Hero */}
      <section className="bg-linear-to-br from-blue-800 to-blue-950 px-6 py-28 text-white">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="mb-4 text-5xl font-bold leading-tight tracking-tight sm:text-6xl">
            Book a trusted tradesperson,{" "}
            <span className="text-blue-300">instantly.</span>
          </h1>
          <p className="mb-12 text-lg text-blue-200">
            Find vetted plumbers, electricians, handymen and more — available
            near you, today.
          </p>

          <form
            action="/search"
            method="GET"
            className="mx-auto flex max-w-2xl flex-col gap-3 rounded-2xl bg-white p-3 shadow-2xl sm:flex-row"
          >
            <select
              name="q"
              defaultValue=""
              className="flex-1 rounded-xl bg-muted px-4 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full rounded-xl bg-muted py-3 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
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
          <h2 className="mb-2 text-center text-3xl font-bold">
            Browse by trade
          </h2>
          <p className="mb-10 text-center text-muted-foreground">
            From emergency repairs to full renovations.
          </p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.label}
                href={`/search?q=${cat.label}`}
                className="flex flex-col items-center gap-3 rounded-2xl border bg-card p-6 text-center transition-all hover:border-blue-300 hover:shadow-md"
              >
                <span className="text-4xl">{cat.emoji}</span>
                <span className="font-medium">{cat.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-muted/40 px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-2 text-center text-3xl font-bold">How it works</h2>
          <p className="mb-14 text-center text-muted-foreground">
            From search to signed invoice in minutes.
          </p>
          <div className="grid gap-10 sm:grid-cols-3">
            {STEPS.map(({ icon: Icon, step, title, desc }) => (
              <div key={step} className="flex flex-col items-center text-center">
                <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-blue-600 text-white">
                  <Icon className="size-6" />
                </div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-blue-600">
                  Step {step}
                </p>
                <h3 className="mb-2 text-xl font-semibold">{title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-wrap justify-center gap-12">
            {TRUST.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50">
                  <Icon className="size-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold">{title}</p>
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
          <p>© 2026 FixItNow. All rights reserved.</p>
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
