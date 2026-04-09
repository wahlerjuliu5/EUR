import Link from "next/link"
import { Search, MapPin, Star, Check, ArrowRight } from "lucide-react"
import { Nav } from "@/components/nav"
import { createClient } from "@/lib/supabase/server"

const TRADES = [
  "Plumber",
  "Electrician",
  "Handyman",
  "Painter",
  "Carpenter",
  "Cleaner",
  "Gardener",
  "HVAC",
]

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; city?: string }>
}) {
  const { q = "", city = "" } = await searchParams

  const supabase = await createClient()

  let query = supabase
    .from("handymen")
    .select("*")
    .order("rating", { ascending: false })

  if (q) query = query.ilike("trade", `%${q}%`)
  if (city) query = query.ilike("city", `%${city}%`)

  const { data, error } = await query
  const results = data ?? []

  return (
    <div className="flex min-h-screen flex-col">
      <Nav />

      {/* Compact search bar */}
      <div className="border-b bg-muted/40 px-6 py-4">
        <form
          action="/search"
          method="GET"
          className="mx-auto flex max-w-4xl gap-3"
        >
          <select
            name="q"
            defaultValue={q}
            className="rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All trades</option>
            {TRADES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <div className="relative flex-1">
            <MapPin className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              name="city"
              type="text"
              defaultValue={city}
              placeholder="City"
              className="w-full rounded-lg border bg-background py-2 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            <Search className="size-4" />
            Search
          </button>
        </form>
      </div>

      {/* Filter pills */}
      <div className="border-b px-6 py-3">
        <div className="mx-auto flex max-w-4xl gap-2 overflow-x-auto pb-0.5">
          <Link
            href={`/search${city ? `?city=${city}` : ""}`}
            className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
              !q
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            All
          </Link>
          {TRADES.map((t) => (
            <Link
              key={t}
              href={`/search?q=${t}${city ? `&city=${city}` : ""}`}
              className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
                q === t
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {t}
            </Link>
          ))}
        </div>
      </div>

      {/* Results */}
      <main className="flex-1 px-6 py-8">
        <div className="mx-auto max-w-4xl">
          {error ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-5 py-4 text-sm text-destructive">
              Could not load results — make sure you have run{" "}
              <code className="font-mono">supabase/seed.sql</code> in the
              Supabase SQL Editor.
            </div>
          ) : (
            <>
              <p className="mb-6 text-sm text-muted-foreground">
                {results.length} result{results.length !== 1 ? "s" : ""}
                {q ? ` for "${q}"` : ""}
                {city ? ` in ${city}` : ""}
              </p>

              {results.length === 0 ? (
                <div className="py-32 text-center">
                  <p className="text-lg font-medium">No results found</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Try a different trade or city.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {results.map((h) => (
                    <div
                      key={h.id}
                      className="flex flex-col gap-4 rounded-2xl border bg-card p-6 transition-shadow hover:shadow-md sm:flex-row sm:items-center"
                    >
                      {/* Avatar */}
                      <div
                        className="flex size-16 shrink-0 items-center justify-center rounded-2xl text-lg font-bold text-white"
                        style={{ backgroundColor: h.color }}
                      >
                        {h.initials}
                      </div>

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold">{h.name}</h3>
                          {h.verified && (
                            <span className="flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                              <Check className="size-3" />
                              Verified
                            </span>
                          )}
                          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                            {h.trade}
                          </span>
                        </div>

                        <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Star className="size-3.5 fill-yellow-400 text-yellow-400" />
                            {h.rating} ({h.review_count} reviews)
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="size-3.5" />
                            {h.city}
                          </span>
                          <span className="font-medium text-emerald-600">
                            Available {h.available_today ? "Today" : "Tomorrow"}
                          </span>
                        </div>

                        <div className="mt-2.5 flex flex-wrap gap-1.5">
                          {h.tags.map((tag: string) => (
                            <span
                              key={tag}
                              className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Price + CTA */}
                      <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                        <div className="sm:text-right">
                          <p className="text-xl font-bold">€{h.hourly_rate}/hr</p>
                          <p className="text-xs text-muted-foreground">
                            Starting rate
                          </p>
                        </div>
                        <Link
                          href="/login"
                          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                        >
                          Book now
                          <ArrowRight className="size-3.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <footer className="border-t bg-muted/40 px-6 py-6">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© 2026 FixItNow. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="transition-colors hover:text-foreground">
              Privacy
            </a>
            <a href="#" className="transition-colors hover:text-foreground">
              Terms
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
