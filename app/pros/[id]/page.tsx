import { notFound } from "next/navigation"
import Link from "next/link"
import {
  MapPin,
  Star,
  Check,
  ArrowLeft,
  Clock,
  Briefcase,
  CalendarDays,
} from "lucide-react"
import { Nav } from "@/components/nav"
import { createClient } from "@/lib/supabase/server"

type AvailSlot = { day: string; slots: string[] }
type Service = { name: string; price: number; unit: string }

interface Handyman {
  id: string
  name: string
  trade: string
  city: string
  hourly_rate: number
  rating: number
  review_count: number
  verified: boolean
  available_today: boolean
  tags: string[]
  initials: string
  color: string
  bio: string
  years_experience: number
  availability: AvailSlot[]
  services: Service[]
}

const ALL_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from("handymen")
    .select("name, trade, city")
    .eq("id", id)
    .single()

  if (!data) return { title: "Tradesperson — HandyBook" }
  return {
    title: `${data.name} · ${data.trade} in ${data.city} — HandyBook`,
  }
}

export default async function ProPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("handymen")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !data) notFound()

  const h = data as Handyman
  const availMap = Object.fromEntries(
    (h.availability ?? []).map((a) => [a.day, a.slots])
  )

  const formatPrice = (s: Service) => {
    if (s.price === 0) return "Free"
    if (s.unit === "fixed") return `€${s.price}`
    if (s.unit === "from") return `from €${s.price}`
    return `€${s.price}/${s.unit}`
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Nav />

      <main className="flex-1 px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-5xl">
          {/* Back */}
          <Link
            href="/search"
            className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back to results
          </Link>

          {/* Profile header */}
          <div className="mb-8 flex flex-col gap-5 rounded-xl border bg-card p-6 sm:flex-row sm:items-start">
            {/* Avatar */}
            <div
              className="flex size-20 shrink-0 items-center justify-center rounded-2xl text-2xl font-bold text-white"
              style={{ backgroundColor: h.color }}
            >
              {h.initials}
            </div>

            <div className="flex-1">
              {/* Name + badges */}
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold">{h.name}</h1>
                {h.verified && (
                  <span className="flex items-center gap-1 rounded-full border border-primary/30 bg-primary/5 px-2.5 py-0.5 text-xs font-medium text-primary">
                    <Check className="size-3" />
                    Verified
                  </span>
                )}
              </div>

              {/* Trade + location */}
              <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{h.trade}</span>
                <span className="flex items-center gap-1">
                  <MapPin className="size-3.5" />
                  {h.city}
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase className="size-3.5" />
                  {h.years_experience} yrs experience
                </span>
                <span className="flex items-center gap-1.5">
                  <span
                    className={`size-1.5 rounded-full ${h.available_today ? "bg-emerald-500" : "bg-muted-foreground"}`}
                  />
                  {h.available_today ? "Available today" : "Available tomorrow"}
                </span>
              </div>

              {/* Rating */}
              <div className="mt-2 flex items-center gap-1.5 text-sm">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      className={`size-4 ${
                        i <= Math.round(h.rating)
                          ? "fill-primary text-primary"
                          : "fill-muted text-muted"
                      }`}
                    />
                  ))}
                </div>
                <span className="font-semibold">{h.rating}</span>
                <span className="text-muted-foreground">
                  ({h.review_count} reviews)
                </span>
              </div>

              {/* Tags */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {h.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* ── Left column ─────────────────────────────── */}
            <div className="flex flex-col gap-6 lg:col-span-2">
              {/* Bio */}
              <section className="rounded-xl border bg-card p-6">
                <h2 className="mb-3 text-base font-semibold">About</h2>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {h.bio}
                </p>
              </section>

              {/* Services & pricing */}
              <section className="rounded-xl border bg-card p-6">
                <div className="mb-4 flex items-center gap-2">
                  <Briefcase className="size-4 text-primary" />
                  <h2 className="text-base font-semibold">
                    Services &amp; Pricing
                  </h2>
                </div>
                <div className="divide-y">
                  {(h.services ?? []).map((s) => (
                    <div
                      key={s.name}
                      className="flex items-center justify-between py-3 text-sm"
                    >
                      <span>{s.name}</span>
                      <span className="font-semibold tabular-nums">
                        {formatPrice(s)}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Availability */}
              <section className="rounded-xl border bg-card p-6">
                <div className="mb-4 flex items-center gap-2">
                  <CalendarDays className="size-4 text-primary" />
                  <h2 className="text-base font-semibold">
                    Weekly Availability
                  </h2>
                </div>
                <div className="divide-y">
                  {ALL_DAYS.map((day) => {
                    const slots = availMap[day]
                    return (
                      <div
                        key={day}
                        className="flex items-center gap-4 py-3 text-sm"
                      >
                        <span className="w-8 shrink-0 font-medium">{day}</span>
                        {slots ? (
                          <div className="flex flex-wrap gap-1.5">
                            {slots.map((slot) => (
                              <span
                                key={slot}
                                className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                              >
                                {slot}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">
                            Unavailable
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </section>
            </div>

            {/* ── Booking sidebar ──────────────────────────── */}
            <div>
              <div className="sticky top-24 flex flex-col gap-4 rounded-xl border bg-card p-6">
                <div>
                  <p className="text-2xl font-bold">
                    €{h.hourly_rate}
                    <span className="text-sm font-normal text-muted-foreground">
                      /hr
                    </span>
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Starting rate
                  </p>
                </div>

                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Star className="size-4 fill-primary text-primary" />
                  <span className="font-medium text-foreground">
                    {h.rating}
                  </span>
                  <span>· {h.review_count} reviews</span>
                </div>

                <div className="flex items-center gap-1.5 text-sm">
                  <Clock className="size-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Usually responds within 2 hours
                  </span>
                </div>

                <Link
                  href={`/pros/${h.id}/book`}
                  className="mt-2 inline-flex w-full items-center justify-center rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Request a booking
                </Link>

                <p className="text-center text-xs text-muted-foreground">
                  You won&apos;t be charged until the job is confirmed.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-8 border-t bg-muted/40 px-6 py-6">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© 2026 HandyBook. All rights reserved.</p>
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
