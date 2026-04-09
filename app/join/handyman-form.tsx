"use client"

import { useState } from "react"
import Link from "next/link"
import {
  User, Mail, Lock, Briefcase, MapPin, Clock, FileText,
  CalendarDays, Euro, Plus, Trash2, ArrowRight, ArrowLeft,
  Check, CheckCircle, ChevronDown,
} from "lucide-react"
import { joinAsHandyman, type JoinPayload } from "@/app/actions/join"

const TRADES = [
  "Plumber","Electrician","Handyman","Painter","Carpenter",
  "Cleaner","Gardener","HVAC","Locksmith","Roofer","Tiler",
]

const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]

const TIMES: string[] = []
for (let h = 6; h <= 22; h++) {
  TIMES.push(`${String(h).padStart(2, "0")}:00`)
  if (h < 22) TIMES.push(`${String(h).padStart(2, "0")}:30`)
}

const UNITS = [
  { value: "hr",    label: "per hour" },
  { value: "fixed", label: "fixed price" },
  { value: "from",  label: "starting from" },
  { value: "m²",    label: "per m²" },
  { value: "m",     label: "per metre" },
]

interface DayRow { enabled: boolean; from: string; to: string }
interface ServiceRow { name: string; price: string; unit: string }

const STEPS = [
  { n: 1, label: "Account",      icon: User },
  { n: 2, label: "Trade",        icon: Briefcase },
  { n: 3, label: "About",        icon: FileText },
  { n: 4, label: "Availability", icon: CalendarDays },
  { n: 5, label: "Services",     icon: Euro },
]

const inputCls =
  "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"

const labelCls = "mb-1.5 block text-sm font-medium"

export function HandymanForm() {
  const [step, setStep]       = useState(1)
  const [done, setDone]       = useState(false)
  const [error, setError]     = useState("")
  const [pending, setPending] = useState(false)

  // Step 1
  const [name, setName]         = useState("")
  const [email, setEmail]       = useState("")
  const [password, setPassword] = useState("")

  // Step 2
  const [trade, setTrade]       = useState("")
  const [city, setCity]         = useState("")
  const [rate, setRate]         = useState("")
  const [years, setYears]       = useState("")

  // Step 3
  const [bio, setBio]         = useState("")
  const [tagsRaw, setTagsRaw] = useState("")

  // Step 4
  const [avail, setAvail] = useState<Record<string, DayRow>>(
    Object.fromEntries(
      DAYS.map((d) => [d, { enabled: false, from: "09:00", to: "17:00" }])
    )
  )

  // Step 5
  const [services, setServices] = useState<ServiceRow[]>([
    { name: "", price: "", unit: "hr" },
  ])

  // ── validation per step ───────────────────────────────────────────────────
  const canNext: Record<number, boolean> = {
    1: !!name.trim() && !!email.trim() && password.length >= 8,
    2: !!trade && !!city.trim() && !!rate && !!years,
    3: bio.trim().length >= 20,
    4: DAYS.some((d) => avail[d].enabled),
    5: services.some((s) => s.name.trim() && s.price),
  }

  // ── day availability helpers ──────────────────────────────────────────────
  function toggleDay(day: string) {
    setAvail((prev) => ({
      ...prev,
      [day]: { ...prev[day], enabled: !prev[day].enabled },
    }))
  }
  function setDayTime(day: string, field: "from" | "to", val: string) {
    setAvail((prev) => ({ ...prev, [day]: { ...prev[day], [field]: val } }))
  }

  // ── services helpers ──────────────────────────────────────────────────────
  function addService() {
    if (services.length < 6)
      setServices((s) => [...s, { name: "", price: "", unit: "hr" }])
  }
  function removeService(i: number) {
    setServices((s) => s.filter((_, idx) => idx !== i))
  }
  function updateService(i: number, field: keyof ServiceRow, val: string) {
    setServices((s) => s.map((row, idx) => (idx === i ? { ...row, [field]: val } : row)))
  }

  // ── submit ────────────────────────────────────────────────────────────────
  async function handleSubmit() {
    setPending(true)
    setError("")

    const tags = tagsRaw
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, 5)

    const availability = DAYS.filter((d) => avail[d].enabled).map((d) => ({
      day: d,
      slots: [`${avail[d].from}–${avail[d].to}`],
    }))

    const svcList = services
      .filter((s) => s.name.trim() && s.price)
      .map((s) => ({
        name: s.name.trim(),
        price: parseFloat(s.price),
        unit: s.unit,
      }))

    const payload: JoinPayload = {
      name: name.trim(),
      email: email.trim(),
      password,
      trade,
      city: city.trim(),
      hourly_rate: parseFloat(rate),
      years_experience: parseInt(years),
      bio: bio.trim(),
      tags,
      availability,
      services: svcList,
    }

    const result = await joinAsHandyman(payload)
    setPending(false)

    if ("error" in result) {
      setError(result.error)
    } else {
      setDone(true)
    }
  }

  // ── confirmation ──────────────────────────────────────────────────────────
  if (done) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-md rounded-2xl border bg-card p-10 text-center">
          <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-primary/10">
            <CheckCircle className="size-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">You&apos;re on HandyBook!</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Check your email to confirm your account. Your profile will appear
            in search results straight away.
          </p>
          <div className="mt-8 flex flex-col gap-3">
            <Link
              href="/search"
              className="inline-flex w-full items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              See your profile in search
            </Link>
            <Link
              href="/"
              className="inline-flex w-full items-center justify-center rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
            >
              Back to home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ── main flow ─────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-1 flex-col px-4 py-10 sm:px-6">
      <div className="mx-auto w-full max-w-xl">

        {/* Step pills */}
        <div className="mb-8 flex items-center gap-1 overflow-x-auto pb-1">
          {STEPS.map(({ n, label, icon: Icon }, idx) => {
            const active = step === n
            const done   = step > n
            return (
              <div key={n} className="flex items-center gap-1">
                <div
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : done
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {done ? <Check className="size-3" /> : <Icon className="size-3" />}
                  {label}
                </div>
                {idx < STEPS.length - 1 && (
                  <div className={`h-px w-4 shrink-0 ${done ? "bg-primary/30" : "bg-border"}`} />
                )}
              </div>
            )
          })}
        </div>

        {/* ── Step 1: Account ─────────────────────────────────────────── */}
        {step === 1 && (
          <div className="rounded-xl border bg-card p-6">
            <h2 className="mb-1 text-lg font-semibold">Create your account</h2>
            <p className="mb-6 text-sm text-muted-foreground">
              You&apos;ll use this to log in and manage your bookings.
            </p>
            <div className="flex flex-col gap-4">
              <div>
                <label className={labelCls}>Full name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text" value={name} onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Marco van den Berg"
                    className={`${inputCls} pl-9`}
                  />
                </div>
              </div>
              <div>
                <label className={labelCls}>Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className={`${inputCls} pl-9`}
                  />
                </div>
              </div>
              <div>
                <label className={labelCls}>Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    className={`${inputCls} pl-9`}
                  />
                </div>
                {password.length > 0 && password.length < 8 && (
                  <p className="mt-1 text-xs text-destructive">At least 8 characters required</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Step 2: Trade details ────────────────────────────────────── */}
        {step === 2 && (
          <div className="rounded-xl border bg-card p-6">
            <h2 className="mb-1 text-lg font-semibold">Your trade</h2>
            <p className="mb-6 text-sm text-muted-foreground">
              Tell clients what you do and where you work.
            </p>
            <div className="flex flex-col gap-4">
              <div>
                <label className={labelCls}>Trade</label>
                <div className="relative">
                  <select
                    value={trade} onChange={(e) => setTrade(e.target.value)}
                    className={`${inputCls} appearance-none pr-8`}
                  >
                    <option value="">Select your trade…</option>
                    {TRADES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>
              <div>
                <label className={labelCls}>City</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text" value={city} onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Amsterdam"
                    className={`${inputCls} pl-9`}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Hourly rate (€)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">€</span>
                    <input
                      type="number" min="10" max="500" value={rate}
                      onChange={(e) => setRate(e.target.value)}
                      placeholder="65"
                      className={`${inputCls} pl-7`}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Years of experience</label>
                  <input
                    type="number" min="0" max="60" value={years}
                    onChange={(e) => setYears(e.target.value)}
                    placeholder="5"
                    className={inputCls}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 3: About ────────────────────────────────────────────── */}
        {step === 3 && (
          <div className="rounded-xl border bg-card p-6">
            <h2 className="mb-1 text-lg font-semibold">About you</h2>
            <p className="mb-6 text-sm text-muted-foreground">
              A strong bio wins clients. Be specific about your speciality.
            </p>
            <div className="flex flex-col gap-4">
              <div>
                <label className={labelCls}>
                  Bio
                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                    ({bio.length}/400)
                  </span>
                </label>
                <textarea
                  value={bio} onChange={(e) => setBio(e.target.value.slice(0, 400))}
                  rows={5}
                  placeholder="e.g. Certified master plumber with 12 years in residential work across Amsterdam. I specialise in leak repairs, boiler installations, and full bathroom renovations…"
                  className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
                />
                {bio.trim().length > 0 && bio.trim().length < 20 && (
                  <p className="mt-1 text-xs text-destructive">Please write at least 20 characters</p>
                )}
              </div>
              <div>
                <label className={labelCls}>Skills / tags</label>
                <input
                  type="text" value={tagsRaw} onChange={(e) => setTagsRaw(e.target.value)}
                  placeholder="e.g. Leak repair, Boilers, Emergency call-outs"
                  className={inputCls}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Comma-separated, up to 5. These appear as chips on your profile.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 4: Availability ─────────────────────────────────────── */}
        {step === 4 && (
          <div className="rounded-xl border bg-card p-6">
            <h2 className="mb-1 text-lg font-semibold">Your availability</h2>
            <p className="mb-6 text-sm text-muted-foreground">
              Toggle the days you&apos;re available and set your working hours.
            </p>
            <div className="flex flex-col divide-y">
              {DAYS.map((day) => {
                const row = avail[day]
                return (
                  <div key={day} className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center">
                    <button
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`flex w-24 shrink-0 items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                        row.enabled
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {row.enabled && <Check className="size-3.5" />}
                      {day}
                    </button>
                    {row.enabled ? (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="size-4 shrink-0 text-muted-foreground" />
                        <select
                          value={row.from}
                          onChange={(e) => setDayTime(day, "from", e.target.value)}
                          className="rounded-lg border border-input bg-background px-2 py-1.5 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        >
                          {TIMES.map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <span className="text-muted-foreground">to</span>
                        <select
                          value={row.to}
                          onChange={(e) => setDayTime(day, "to", e.target.value)}
                          className="rounded-lg border border-input bg-background px-2 py-1.5 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        >
                          {TIMES.filter((t) => t > row.from).map((t) => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">Unavailable</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Step 5: Services ─────────────────────────────────────────── */}
        {step === 5 && (
          <div className="rounded-xl border bg-card p-6">
            <h2 className="mb-1 text-lg font-semibold">Services &amp; pricing</h2>
            <p className="mb-6 text-sm text-muted-foreground">
              List what you offer so clients know what to expect.
            </p>
            <div className="flex flex-col gap-3">
              {services.map((svc, i) => (
                <div key={i} className="flex items-start gap-2 rounded-lg border bg-muted/30 p-3">
                  <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                    <input
                      type="text"
                      value={svc.name}
                      onChange={(e) => updateService(i, "name", e.target.value)}
                      placeholder="e.g. Boiler service"
                      className="h-9 flex-1 rounded-lg border border-input bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
                    />
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">€</span>
                        <input
                          type="number" min="0"
                          value={svc.price}
                          onChange={(e) => updateService(i, "price", e.target.value)}
                          placeholder="0"
                          className="h-9 w-24 rounded-lg border border-input bg-background pl-6 pr-2 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        />
                      </div>
                      <select
                        value={svc.unit}
                        onChange={(e) => updateService(i, "unit", e.target.value)}
                        className="h-9 rounded-lg border border-input bg-background px-2 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      >
                        {UNITS.map((u) => (
                          <option key={u.value} value={u.value}>{u.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeService(i)}
                    disabled={services.length === 1}
                    className="mt-0.5 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-30"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}

              {services.length < 6 && (
                <button
                  type="button"
                  onClick={addService}
                  className="flex items-center gap-2 rounded-lg border border-dashed px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                >
                  <Plus className="size-4" />
                  Add another service
                </button>
              )}
            </div>

            {error && (
              <p className="mt-4 rounded-lg bg-destructive/5 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="mt-5 flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep((s) => (s - 1) as typeof step)}
              className="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
            >
              <ArrowLeft className="size-4" />
              Back
            </button>
          ) : (
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
            >
              <ArrowLeft className="size-4" />
              Sign up instead
            </Link>
          )}

          {step < 5 ? (
            <button
              disabled={!canNext[step]}
              onClick={() => setStep((s) => (s + 1) as typeof step)}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Continue
              <ArrowRight className="size-4" />
            </button>
          ) : (
            <button
              disabled={!canNext[5] || pending}
              onClick={handleSubmit}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {pending ? "Creating profile…" : "Create my profile"}
              {!pending && <Check className="size-4" />}
            </button>
          )}
        </div>

        <p className="mt-5 text-center text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-foreground hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
