"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Clock,
  FileText,
  CheckCircle,
  Check,
  Minus,
  Plus,
  MapPin,
  Star,
  Receipt,
} from "lucide-react"
import { createBooking } from "@/app/actions/book"

type AvailSlot = { day: string; slots: string[] }
type Service = { name: string; price: number; unit: string }

interface Handyman {
  id: string
  name: string
  trade: string
  city: string
  hourly_rate: number
  rating: number
  verified: boolean
  initials: string
  color: string
  availability: AvailSlot[]
  services: Service[]
}

const DAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const DAY_FULL = [
  "Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday",
]
const MONTH_SHORT = [
  "Jan","Feb","Mar","Apr","May","Jun",
  "Jul","Aug","Sep","Oct","Nov","Dec",
]
const MONTH_FULL = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
]

function fmtShort(d: Date) {
  return `${DAY_SHORT[d.getDay()]} ${d.getDate()} ${MONTH_SHORT[d.getMonth()]}`
}
function fmtFull(d: Date) {
  return `${DAY_FULL[d.getDay()]}, ${d.getDate()} ${MONTH_FULL[d.getMonth()]}`
}

const STEPS = [
  { n: 1, label: "Date & time", icon: CalendarDays },
  { n: 2, label: "Job details", icon: FileText },
  { n: 3, label: "Confirm", icon: CheckCircle },
]

export function BookingFlow({ handyman }: { handyman: Handyman }) {
  const [step, setStep] = useState<1 | 2 | 3 | "done">(1)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [hours, setHours] = useState(2)
  const [description, setDescription] = useState("")
  const [customerName, setCustomerName] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [bookingRef, setBookingRef] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const availMap = useMemo(
    () =>
      Object.fromEntries(
        (handyman.availability ?? []).map((a) => [a.day, a.slots])
      ),
    [handyman.availability]
  )

  const dates = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return Array.from({ length: 14 }, (_, i) => {
      const d = new Date(today)
      d.setDate(today.getDate() + i + 1)
      return d
    })
  }, [])

  const slotsForDate = (d: Date) => availMap[DAY_SHORT[d.getDay()]] ?? []

  const servicePrice = handyman.hourly_rate * hours
  const commission = Math.round(servicePrice * 0.1 * 100) / 100
  const handymanBonus = Math.round(servicePrice * 0.03 * 100) / 100
  const total = servicePrice + commission

  function selectDate(d: Date) {
    setSelectedDate(d)
    setSelectedSlot(null)
  }

  // ── Confirmation screen ────────────────────────────────────────────────────
  if (step === "done") {
    return (
      <main className="flex flex-1 items-start justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-lg">
          <div className="rounded-2xl border bg-card p-8 text-center">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle className="size-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">Booking requested!</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {handyman.name} will confirm within 2 hours.
            </p>

            <div className="mt-4 inline-block rounded-full border bg-muted px-4 py-1 font-mono text-sm font-semibold tracking-wider">
              {bookingRef}
            </div>

            <div className="mt-6 rounded-xl border bg-muted/40 p-4 text-left text-sm">
              <div className="flex items-center gap-3 pb-3 border-b">
                <div
                  className="flex size-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white"
                  style={{ backgroundColor: handyman.color }}
                >
                  {handyman.initials}
                </div>
                <div>
                  <p className="font-semibold">{handyman.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {handyman.trade} · {handyman.city}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex flex-col gap-1.5 text-muted-foreground">
                <p className="flex items-center gap-2">
                  <CalendarDays className="size-3.5 shrink-0" />
                  {selectedDate ? fmtFull(selectedDate) : ""}
                </p>
                <p className="flex items-center gap-2">
                  <Clock className="size-3.5 shrink-0" />
                  {selectedSlot}
                </p>
                <p className="flex items-center gap-2">
                  <FileText className="size-3.5 shrink-0" />
                  <span className="truncate">{description}</span>
                </p>
              </div>
            </div>

            {/* Price recap */}
            <div className="mt-4 rounded-xl border p-4 text-left text-sm">
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">
                  Labour ({hours} hr{hours !== 1 ? "s" : ""} × €
                  {handyman.hourly_rate})
                </span>
                <span>€{servicePrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">
                  Platform fee (10%)
                </span>
                <span>€{commission.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t pt-2 font-semibold">
                <span>Total</span>
                <span>€{total.toFixed(2)}</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {handyman.name.split(" ")[0]} also earns a €
                {handymanBonus.toFixed(2)} HandyBook loyalty bonus on this job.
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-2">
              {bookingRef && (
                <Link
                  href={`/invoices/${bookingRef}`}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  <Receipt className="size-4" />
                  View invoice
                </Link>
              )}
              <Link
                href="/login"
                className="inline-flex w-full items-center justify-center rounded-lg border border-border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
              >
                Sign in to manage your booking
              </Link>
              <Link
                href="/"
                className="inline-flex w-full items-center justify-center rounded-lg border border-border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
              >
                Back to home
              </Link>
            </div>
          </div>
        </div>
      </main>
    )
  }

  // ── Main flow ──────────────────────────────────────────────────────────────
  return (
    <main className="flex-1 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-2xl">
        {/* Back */}
        <Link
          href={`/pros/${handyman.id}`}
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to profile
        </Link>

        {/* Step progress */}
        <div className="mb-8 flex items-center gap-2">
          {STEPS.map(({ n, label, icon: Icon }, idx) => {
            const active = step === n
            const done = typeof step === "number" && step > n
            return (
              <div key={n} className="flex items-center gap-2">
                <div
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : done
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {done ? (
                    <Check className="size-3" />
                  ) : (
                    <Icon className="size-3" />
                  )}
                  {label}
                </div>
                {idx < STEPS.length - 1 && (
                  <div
                    className={`h-px w-6 transition-colors ${
                      done ? "bg-primary/40" : "bg-border"
                    }`}
                  />
                )}
              </div>
            )
          })}
        </div>

        {/* Pro mini-card */}
        <div className="mb-6 flex items-center gap-3 rounded-xl border bg-card px-4 py-3">
          <div
            className="flex size-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white"
            style={{ backgroundColor: handyman.color }}
          >
            {handyman.initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">{handyman.name}</p>
            <p className="text-xs text-muted-foreground">
              {handyman.trade} · {handyman.city}
            </p>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <Star className="size-3.5 fill-primary text-primary" />
            <span className="font-medium">{handyman.rating}</span>
          </div>
        </div>

        {/* ── Step 1: Date & Time ─────────────────────────────────────────── */}
        {step === 1 && (
          <div className="flex flex-col gap-6">
            <div className="rounded-xl border bg-card p-6">
              <h2 className="mb-4 text-base font-semibold">Select a date</h2>
              <div className="grid grid-cols-7 gap-1.5">
                {dates.map((d) => {
                  const available = slotsForDate(d).length > 0
                  const selected =
                    selectedDate?.toDateString() === d.toDateString()
                  return (
                    <button
                      key={d.toISOString()}
                      disabled={!available}
                      onClick={() => selectDate(d)}
                      className={`flex flex-col items-center rounded-xl border py-2.5 text-center transition-colors disabled:cursor-not-allowed disabled:opacity-35 ${
                        selected
                          ? "border-primary bg-primary text-primary-foreground"
                          : available
                            ? "hover:border-primary/40 hover:bg-primary/5"
                            : ""
                      }`}
                    >
                      <span className="text-xs font-medium">
                        {DAY_SHORT[d.getDay()]}
                      </span>
                      <span className="text-lg font-bold leading-tight">
                        {d.getDate()}
                      </span>
                      <span className="text-xs">
                        {MONTH_SHORT[d.getMonth()]}
                      </span>
                      {available && !selected && (
                        <span className="mt-1 size-1 rounded-full bg-primary" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {selectedDate && (
              <div className="rounded-xl border bg-card p-6">
                <h2 className="mb-4 text-base font-semibold">
                  Available slots on {fmtShort(selectedDate)}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {slotsForDate(selectedDate).map((slot) => (
                    <button
                      key={slot}
                      onClick={() => setSelectedSlot(slot)}
                      className={`flex items-center gap-1.5 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                        selectedSlot === slot
                          ? "border-primary bg-primary text-primary-foreground"
                          : "hover:border-primary/40 hover:bg-primary/5"
                      }`}
                    >
                      <Clock className="size-3.5" />
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              disabled={!selectedDate || !selectedSlot}
              onClick={() => setStep(2)}
              className="inline-flex items-center justify-center gap-2 self-end rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continue
              <ArrowRight className="size-4" />
            </button>
          </div>
        )}

        {/* ── Step 2: Job details ─────────────────────────────────────────── */}
        {step === 2 && (
          <div className="flex flex-col gap-6">
            <div className="rounded-xl border bg-card p-6">
              <h2 className="mb-5 text-base font-semibold">Job details</h2>

              {/* Contact details */}
              <div className="mb-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="customerName"
                    className="mb-1.5 block text-sm font-medium"
                  >
                    Your name
                    <span className="text-destructive"> *</span>
                  </label>
                  <input
                    id="customerName"
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Jane Smith"
                    className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>
                <div>
                  <label
                    htmlFor="customerEmail"
                    className="mb-1.5 block text-sm font-medium"
                  >
                    Email for confirmation
                    <span className="text-destructive"> *</span>
                  </label>
                  <input
                    id="customerEmail"
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="jane@example.com"
                    className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
                  />
                </div>
              </div>

              {/* Duration */}
              <div className="mb-5">
                <p className="mb-3 text-sm font-medium">Estimated duration</p>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setHours((h) => Math.max(1, h - 1))}
                    className="flex size-9 items-center justify-center rounded-lg border transition-colors hover:bg-muted disabled:opacity-40"
                    disabled={hours <= 1}
                  >
                    <Minus className="size-4" />
                  </button>
                  <span className="w-16 text-center text-xl font-bold">
                    {hours} hr{hours !== 1 ? "s" : ""}
                  </span>
                  <button
                    onClick={() => setHours((h) => Math.min(8, h + 1))}
                    className="flex size-9 items-center justify-center rounded-lg border transition-colors hover:bg-muted disabled:opacity-40"
                    disabled={hours >= 8}
                  >
                    <Plus className="size-4" />
                  </button>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  You&apos;ll only be charged for the actual time worked.
                </p>
              </div>

              {/* Description */}
              <div>
                <label
                  htmlFor="description"
                  className="mb-1.5 block text-sm font-medium"
                >
                  Describe what needs doing
                  <span className="text-destructive"> *</span>
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="e.g. Leaking pipe under the kitchen sink, also need the stopcock checked…"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring resize-none"
                />
              </div>
            </div>

            {/* Live price preview */}
            <div className="rounded-xl border bg-muted/40 p-4 text-sm">
              <p className="mb-2 font-medium">Price estimate</p>
              <div className="flex justify-between text-muted-foreground">
                <span>
                  {hours} hr{hours !== 1 ? "s" : ""} × €{handyman.hourly_rate}
                </span>
                <span>€{servicePrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Platform fee (10%)</span>
                <span>€{commission.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t pt-2 font-semibold">
                <span>Estimated total</span>
                <span>€{total.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-3 self-end">
              <button
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
              >
                <ArrowLeft className="size-4" />
                Back
              </button>
              <button
                disabled={
                  !description.trim() ||
                  !customerName.trim() ||
                  !customerEmail.includes("@")
                }
                onClick={() => setStep(3)}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Review booking
                <ArrowRight className="size-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Review & confirm ────────────────────────────────────── */}
        {step === 3 && (
          <div className="flex flex-col gap-6">
            <div className="rounded-xl border bg-card p-6">
              <h2 className="mb-5 text-base font-semibold">
                Review your booking
              </h2>

              {/* Summary rows */}
              <dl className="divide-y text-sm">
                <div className="flex justify-between py-3">
                  <dt className="text-muted-foreground">Tradesperson</dt>
                  <dd className="font-medium">{handyman.name}</dd>
                </div>
                <div className="flex justify-between py-3">
                  <dt className="flex items-center gap-1.5 text-muted-foreground">
                    <MapPin className="size-3.5" />
                    Location
                  </dt>
                  <dd className="font-medium">{handyman.city}</dd>
                </div>
                <div className="flex justify-between py-3">
                  <dt className="flex items-center gap-1.5 text-muted-foreground">
                    <CalendarDays className="size-3.5" />
                    Date
                  </dt>
                  <dd className="font-medium">
                    {selectedDate ? fmtFull(selectedDate) : ""}
                  </dd>
                </div>
                <div className="flex justify-between py-3">
                  <dt className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="size-3.5" />
                    Time slot
                  </dt>
                  <dd className="font-medium">{selectedSlot}</dd>
                </div>
                <div className="flex justify-between py-3">
                  <dt className="text-muted-foreground">Duration</dt>
                  <dd className="font-medium">
                    {hours} hr{hours !== 1 ? "s" : ""} (estimated)
                  </dd>
                </div>
                <div className="py-3">
                  <dt className="mb-1 text-muted-foreground">Description</dt>
                  <dd className="text-foreground">{description}</dd>
                </div>
              </dl>
            </div>

            {/* Price breakdown */}
            <div className="rounded-xl border bg-card p-6">
              <h2 className="mb-4 text-base font-semibold">
                Price breakdown
              </h2>
              <div className="divide-y text-sm">
                <div className="flex justify-between py-3">
                  <span className="text-muted-foreground">
                    Labour ({hours} hr{hours !== 1 ? "s" : ""} ×
                    €{handyman.hourly_rate}/hr)
                  </span>
                  <span>€{servicePrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="text-muted-foreground">
                    HandyBook platform fee (10%)
                  </span>
                  <span>€{commission.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-3 font-semibold">
                  <span>Total due</span>
                  <span>€{total.toFixed(2)}</span>
                </div>
              </div>
              <p className="mt-3 rounded-lg bg-accent/5 px-3 py-2 text-xs text-muted-foreground">
                Of the platform fee, €{handymanBonus.toFixed(2)} goes directly
                back to {handyman.name.split(" ")[0]} as a HandyBook loyalty
                bonus.
              </p>
            </div>

            {submitError && (
              <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
                {submitError}
              </p>
            )}

            <div className="flex gap-3 self-end">
              <button
                onClick={() => setStep(2)}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-40"
              >
                <ArrowLeft className="size-4" />
                Back
              </button>
              <button
                disabled={isSubmitting}
                onClick={async () => {
                  setIsSubmitting(true)
                  setSubmitError(null)
                  const result = await createBooking({
                    handyman_id: handyman.id,
                    customer_name: customerName,
                    customer_email: customerEmail,
                    selected_date: selectedDate
                      ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`
                      : "",
                    selected_slot: selectedSlot ?? "",
                    hours,
                    description,
                    hourly_rate: handyman.hourly_rate,
                    service_price: servicePrice,
                    commission,
                    handyman_bonus: handymanBonus,
                    total,
                  })
                  if ("error" in result) {
                    setSubmitError(result.error)
                    setIsSubmitting(false)
                  } else {
                    setBookingRef(result.bookingRef)
                    setStep("done")
                  }
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Check className="size-4" />
                {isSubmitting ? "Confirming…" : "Confirm booking"}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
