"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { createHandymanProfile } from "@/app/actions/handyman"
import type { ServiceItem, AvailabilitySlot } from "@/app/actions/handyman"

// ── Types ─────────────────────────────────────────────────────────────────────

type ServiceRow = { id: string; name: string; price: string; unit: string }
type SlotRow = { id: string; start: string; end: string }
type DaySchedule = { day: string; active: boolean; slots: SlotRow[] }

// ── Constants ─────────────────────────────────────────────────────────────────

const TRADES = [
  "Carpenter", "Cleaner", "Electrician", "Gardener", "Handyman",
  "HVAC", "Locksmith", "Painter", "Plumber", "Roofer", "Tiler", "Other",
]

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

const TRADE_CERTS: Record<string, string[]> = {
  Plumber:      ["Gas Safe Registered", "WRAS Approved", "NVQ Level 2 Plumbing", "NVQ Level 3 Plumbing", "City & Guilds"],
  Electrician:  ["NICEIC Approved", "NAPIT Registered", "18th Edition Wiring Regs", "ECS Card", "City & Guilds"],
  HVAC:         ["F-Gas Certified (Cat 1)", "REFCOM Registered", "Gas Safe Registered", "NVQ Level 2 HVAC", "CSCS Card"],
  Carpenter:    ["City & Guilds Carpentry", "NVQ Level 2 Carpentry", "NVQ Level 3 Joinery", "CSCS Card"],
  Painter:      ["City & Guilds Decorating", "NVQ Level 2 Painting", "NVQ Level 3 Decorating", "CSCS Card"],
  Roofer:       ["NFRC Registered", "City & Guilds Roofing", "NVQ Level 2 Roofing", "CSCS Card"],
  Tiler:        ["CTDA Registered", "NVQ Level 2 Tiling", "BAL Certified Tiler"],
  Locksmith:    ["DBS Checked", "MLA Approved", "CRB Checked"],
  Cleaner:      ["DBS Checked", "City & Guilds Cleaning", "ISSA Certified"],
  Gardener:     ["RHS Level 2", "RHS Level 3", "Lantra Certified", "PA1/PA6 Spraying Cert"],
  Handyman:     ["CSCS Card", "DBS Checked", "City & Guilds Multi-Trade"],
  Other:        ["DBS Checked", "CSCS Card"],
}

const TRADE_DEFAULT_SERVICES: Record<string, Omit<ServiceRow, "id">[]> = {
  Plumber:     [{ name: "Call-out / inspection", price: "50", unit: "fixed" }, { name: "Labour", price: "65", unit: "hr" }, { name: "Emergency (same-day)", price: "95", unit: "hr" }],
  Electrician: [{ name: "Initial assessment", price: "60", unit: "fixed" }, { name: "Labour", price: "75", unit: "hr" }],
  HVAC:        [{ name: "System survey", price: "80", unit: "fixed" }, { name: "Labour", price: "80", unit: "hr" }],
  Carpenter:   [{ name: "Consultation & quote", price: "0", unit: "fixed" }, { name: "Labour", price: "70", unit: "hr" }],
  Painter:     [{ name: "Labour", price: "55", unit: "hr" }, { name: "Interior painting (per m²)", price: "12", unit: "m²" }],
  Roofer:      [{ name: "Roof inspection & quote", price: "0", unit: "fixed" }, { name: "Labour", price: "85", unit: "hr" }],
  Tiler:       [{ name: "Consultation & measure", price: "50", unit: "fixed" }, { name: "Labour (per m²)", price: "45", unit: "m²" }],
  Locksmith:   [{ name: "Emergency lockout", price: "80", unit: "fixed" }, { name: "Standard lock replacement", price: "120", unit: "fixed" }],
  Cleaner:     [{ name: "Hourly rate", price: "35", unit: "hr" }, { name: "Standard clean (2 hrs)", price: "65", unit: "fixed" }, { name: "Deep clean (half-day)", price: "120", unit: "fixed" }],
  Gardener:    [{ name: "Garden visit / survey", price: "0", unit: "fixed" }, { name: "Hourly maintenance", price: "40", unit: "hr" }],
  Handyman:    [{ name: "Hourly rate", price: "45", unit: "hr" }, { name: "Half-day (4 hrs)", price: "160", unit: "fixed" }, { name: "Full day (8 hrs)", price: "300", unit: "fixed" }],
  Other:       [{ name: "Labour", price: "50", unit: "hr" }],
}

const STEP_LABELS = ["Account", "Profile", "Skills & Certs", "Services", "Availability"]
const TOTAL_STEPS = 5

// ── Helper ────────────────────────────────────────────────────────────────────

function uid() {
  return Math.random().toString(36).slice(2, 9)
}

const inputCls =
  "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"

const labelCls = "block text-sm font-medium mb-1"

// ── Component ─────────────────────────────────────────────────────────────────

export default function HandymanSignupPage() {
  const [step, setStep] = useState(1)

  // Step 1 — Account
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  // Step 2 — Profile
  const [name, setName] = useState("")
  const [city, setCity] = useState("")
  const [phone, setPhone] = useState("")
  const [trade, setTrade] = useState("")
  const [hourlyRate, setHourlyRate] = useState("")
  const [yearsExperience, setYearsExperience] = useState("")
  const [bio, setBio] = useState("")

  // Step 3 — Skills & Certs
  const [tagInput, setTagInput] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [certifications, setCertifications] = useState<string[]>([])
  const [customCertInput, setCustomCertInput] = useState("")

  // Step 4 — Services
  const [services, setServices] = useState<ServiceRow[]>([
    { id: uid(), name: "", price: "", unit: "hr" },
  ])

  // Step 5 — Availability
  const [availability, setAvailability] = useState<DaySchedule[]>(
    DAYS.map((day) => ({ day, active: false, slots: [] }))
  )

  // Global
  const [stepError, setStepError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [success, setSuccess] = useState(false)

  // ── Tag handlers ─────────────────────────────────────────────────────────

  function addTag() {
    const val = tagInput.trim()
    if (val && !tags.includes(val)) setTags((p) => [...p, val])
    setTagInput("")
  }

  function removeTag(t: string) {
    setTags((p) => p.filter((x) => x !== t))
  }

  // ── Cert handlers ─────────────────────────────────────────────────────────

  function toggleCert(cert: string) {
    setCertifications((p) =>
      p.includes(cert) ? p.filter((c) => c !== cert) : [...p, cert]
    )
  }

  function addCustomCert() {
    const val = customCertInput.trim()
    if (val && !certifications.includes(val)) setCertifications((p) => [...p, val])
    setCustomCertInput("")
  }

  // ── Service handlers ──────────────────────────────────────────────────────

  function addService() {
    setServices((p) => [...p, { id: uid(), name: "", price: "", unit: "hr" }])
  }

  function updateService(id: string, field: keyof Omit<ServiceRow, "id">, val: string) {
    setServices((p) => p.map((s) => (s.id === id ? { ...s, [field]: val } : s)))
  }

  function removeService(id: string) {
    setServices((p) => p.filter((s) => s.id !== id))
  }

  // ── Availability handlers ─────────────────────────────────────────────────

  function toggleDay(day: string) {
    setAvailability((p) =>
      p.map((d) =>
        d.day === day
          ? {
              ...d,
              active: !d.active,
              slots: d.active ? [] : [{ id: uid(), start: "09:00", end: "17:00" }],
            }
          : d
      )
    )
  }

  function addSlot(day: string) {
    setAvailability((p) =>
      p.map((d) =>
        d.day === day
          ? { ...d, slots: [...d.slots, { id: uid(), start: "09:00", end: "17:00" }] }
          : d
      )
    )
  }

  function updateSlot(day: string, slotId: string, field: "start" | "end", val: string) {
    setAvailability((p) =>
      p.map((d) =>
        d.day === day
          ? { ...d, slots: d.slots.map((s) => (s.id === slotId ? { ...s, [field]: val } : s)) }
          : d
      )
    )
  }

  function removeSlot(day: string, slotId: string) {
    setAvailability((p) =>
      p.map((d) =>
        d.day === day ? { ...d, slots: d.slots.filter((s) => s.id !== slotId) } : d
      )
    )
  }

  // When trade changes, pre-populate services
  function handleTradeChange(newTrade: string) {
    setTrade(newTrade)
    const defaults = TRADE_DEFAULT_SERVICES[newTrade]
    if (defaults) setServices(defaults.map((s) => ({ ...s, id: uid() })))
  }

  // ── Validation ────────────────────────────────────────────────────────────

  function validate(): boolean {
    setStepError(null)

    if (step === 1) {
      if (!email || !password || !confirmPassword) {
        setStepError("All fields are required.")
        return false
      }
      if (password.length < 8) {
        setStepError("Password must be at least 8 characters.")
        return false
      }
      if (password !== confirmPassword) {
        setStepError("Passwords do not match.")
        return false
      }
    }

    if (step === 2) {
      if (!name.trim() || !city.trim() || !trade || !hourlyRate || !yearsExperience) {
        setStepError("Name, city, trade, hourly rate, and years of experience are required.")
        return false
      }
      if (isNaN(Number(hourlyRate)) || Number(hourlyRate) <= 0) {
        setStepError("Enter a valid hourly rate.")
        return false
      }
      if (isNaN(Number(yearsExperience)) || Number(yearsExperience) < 0) {
        setStepError("Enter valid years of experience.")
        return false
      }
    }

    if (step === 4) {
      if (services.length === 0) {
        setStepError("Add at least one service.")
        return false
      }
      if (services.some((s) => !s.name.trim())) {
        setStepError("Fill in all service names.")
        return false
      }
    }

    return true
  }

  function handleNext() {
    if (!validate()) return
    setStep((p) => p + 1)
  }

  function handleBack() {
    setStepError(null)
    setStep((p) => p - 1)
  }

  // ── Submit ────────────────────────────────────────────────────────────────

  function handleSubmit() {
    if (!validate()) return

    const avail: AvailabilitySlot[] = availability
      .filter((d) => d.active && d.slots.length > 0)
      .map((d) => ({
        day: d.day,
        slots: d.slots.map((s) => `${s.start}–${s.end}`),
      }))

    const svcs: ServiceItem[] = services
      .filter((s) => s.name.trim())
      .map((s) => ({
        name: s.name.trim(),
        price: Number(s.price) || 0,
        unit: s.unit,
      }))

    startTransition(async () => {
      const result = await createHandymanProfile({
        email,
        password,
        name: name.trim(),
        city: city.trim(),
        phone,
        trade,
        hourlyRate: Number(hourlyRate),
        yearsExperience: Number(yearsExperience),
        bio: bio.trim(),
        tags,
        certifications,
        services: svcs,
        availability: avail,
      })

      if ("error" in result) {
        setStepError(result.error)
      } else {
        setSuccess(true)
      }
    })
  }

  // ── Success screen ────────────────────────────────────────────────────────

  if (success) {
    return (
      <div className="w-full max-w-lg rounded-xl border border-border bg-card p-10 shadow-sm text-center">
        <div className="mb-4 text-5xl">🎉</div>
        <h2 className="mb-2 text-xl font-semibold">You're on HandyBook!</h2>
        <p className="mb-6 text-sm text-muted-foreground leading-relaxed">
          Check your email to confirm your account. Your profile is now live — homeowners
          in your area can find and book you straight away.
        </p>
        <Link href="/login">
          <Button size="lg" className="w-full">Sign in to your dashboard</Button>
        </Link>
      </div>
    )
  }

  // ── Progress bar ──────────────────────────────────────────────────────────

  return (
    <div className="w-full max-w-xl rounded-xl border border-border bg-card p-8 shadow-sm">
      {/* Progress */}
      <div className="mb-7">
        <div className="flex gap-1 mb-2.5">
          {STEP_LABELS.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i + 1 <= step ? "bg-primary" : "bg-border"
              }`}
            />
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Step {step} of {TOTAL_STEPS} —{" "}
          <span className="font-medium text-foreground">{STEP_LABELS[step - 1]}</span>
        </p>
      </div>

      {/* ── Step 1: Account ───────────────────────────────────────────────── */}
      {step === 1 && (
        <div className="flex flex-col gap-4">
          <div className="mb-1">
            <h2 className="text-lg font-semibold">Create your account</h2>
            <p className="text-sm text-muted-foreground mt-0.5">You'll use these to log in.</p>
          </div>

          <div>
            <label htmlFor="email" className={labelCls}>Email address</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputCls}
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className={labelCls}>Password</label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputCls}
              placeholder="Min. 8 characters"
            />
          </div>

          <div>
            <label htmlFor="confirm" className={labelCls}>Confirm password</label>
            <input
              id="confirm"
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputCls}
              placeholder="Repeat your password"
            />
          </div>
        </div>
      )}

      {/* ── Step 2: Profile ───────────────────────────────────────────────── */}
      {step === 2 && (
        <div className="flex flex-col gap-4">
          <div className="mb-1">
            <h2 className="text-lg font-semibold">Your details</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              This is what homeowners see on your profile.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className={labelCls}>Full name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputCls}
                placeholder="e.g. Marco van den Berg"
              />
            </div>

            <div>
              <label className={labelCls}>City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className={inputCls}
                placeholder="e.g. Amsterdam"
              />
            </div>

            <div>
              <label className={labelCls}>Phone (optional)</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={inputCls}
                placeholder="+31 6 ..."
              />
            </div>

            <div>
              <label className={labelCls}>Primary trade</label>
              <select
                value={trade}
                onChange={(e) => handleTradeChange(e.target.value)}
                className={inputCls}
              >
                <option value="" disabled>Select trade…</option>
                {TRADES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelCls}>Hourly rate (€)</label>
              <input
                type="number"
                min="1"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                className={inputCls}
                placeholder="e.g. 65"
              />
            </div>

            <div>
              <label className={labelCls}>Years of experience</label>
              <input
                type="number"
                min="0"
                value={yearsExperience}
                onChange={(e) => setYearsExperience(e.target.value)}
                className={inputCls}
                placeholder="e.g. 8"
              />
            </div>
          </div>

          <div>
            <label className={labelCls}>
              About you{" "}
              <span className="text-muted-foreground font-normal">
                ({bio.length}/300)
              </span>
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, 300))}
              rows={4}
              className={inputCls}
              placeholder="Tell homeowners about your experience, specialisms, and what makes you stand out…"
            />
          </div>
        </div>
      )}

      {/* ── Step 3: Skills & Certifications ──────────────────────────────── */}
      {step === 3 && (
        <div className="flex flex-col gap-6">
          <div className="mb-1">
            <h2 className="text-lg font-semibold">Skills &amp; certifications</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              These appear as tags on your profile and help homeowners find you.
            </p>
          </div>

          {/* Skills tags */}
          <div>
            <label className={labelCls}>Skills / specialisms</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") { e.preventDefault(); addTag() }
                }}
                className={inputCls}
                placeholder="e.g. Boiler repair, Drain clearing…"
              />
              <Button type="button" variant="outline" size="sm" onClick={addTag} className="shrink-0">
                Add
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-0.5 text-primary/60 hover:text-primary leading-none"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Certifications */}
          <div>
            <label className={labelCls}>Certifications &amp; qualifications</label>

            {/* Preset options for the chosen trade */}
            {trade && TRADE_CERTS[trade] && (
              <div className="flex flex-wrap gap-2 mb-3">
                {TRADE_CERTS[trade].map((cert) => (
                  <button
                    key={cert}
                    type="button"
                    onClick={() => toggleCert(cert)}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                      certifications.includes(cert)
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    {certifications.includes(cert) ? "✓ " : ""}{cert}
                  </button>
                ))}
              </div>
            )}

            {/* Custom cert */}
            <div className="flex gap-2">
              <input
                type="text"
                value={customCertInput}
                onChange={(e) => setCustomCertInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") { e.preventDefault(); addCustomCert() }
                }}
                className={inputCls}
                placeholder="Add a certification not listed above…"
              />
              <Button type="button" variant="outline" size="sm" onClick={addCustomCert} className="shrink-0">
                Add
              </Button>
            </div>

            {/* Show any custom certs that aren't in the preset list */}
            {certifications.filter((c) => !TRADE_CERTS[trade]?.includes(c)).length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {certifications
                  .filter((c) => !TRADE_CERTS[trade]?.includes(c))
                  .map((cert) => (
                    <span
                      key={cert}
                      className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/5 px-2.5 py-0.5 text-xs font-medium text-primary"
                    >
                      {cert}
                      <button
                        type="button"
                        onClick={() => toggleCert(cert)}
                        className="ml-0.5 text-primary/60 hover:text-primary leading-none"
                      >
                        ×
                      </button>
                    </span>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Step 4: Services & Pricing ────────────────────────────────────── */}
      {step === 4 && (
        <div className="flex flex-col gap-4">
          <div className="mb-1">
            <h2 className="text-lg font-semibold">Services &amp; pricing</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              List what you offer so homeowners know exactly what to expect.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            {/* Header row */}
            <div className="grid grid-cols-[1fr_90px_90px_32px] gap-2 text-xs font-medium text-muted-foreground px-1">
              <span>Service</span>
              <span>Price (€)</span>
              <span>Unit</span>
              <span />
            </div>

            {services.map((svc) => (
              <div key={svc.id} className="grid grid-cols-[1fr_90px_90px_32px] gap-2 items-center">
                <input
                  type="text"
                  value={svc.name}
                  onChange={(e) => updateService(svc.id, "name", e.target.value)}
                  className={inputCls}
                  placeholder="e.g. Labour"
                />
                <input
                  type="number"
                  min="0"
                  value={svc.price}
                  onChange={(e) => updateService(svc.id, "price", e.target.value)}
                  className={inputCls}
                  placeholder="0"
                />
                <select
                  value={svc.unit}
                  onChange={(e) => updateService(svc.id, "unit", e.target.value)}
                  className={inputCls}
                >
                  <option value="hr">/ hr</option>
                  <option value="fixed">fixed</option>
                  <option value="from">from</option>
                  <option value="m²">/ m²</option>
                  <option value="m">/ m</option>
                </select>
                <button
                  type="button"
                  onClick={() => removeService(svc.id)}
                  disabled={services.length === 1}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-30"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <Button type="button" variant="outline" size="sm" onClick={addService} className="self-start">
            + Add service
          </Button>
        </div>
      )}

      {/* ── Step 5: Availability ──────────────────────────────────────────── */}
      {step === 5 && (
        <div className="flex flex-col gap-5">
          <div className="mb-1">
            <h2 className="text-lg font-semibold">Your availability</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Toggle the days you work and set your time slots.
            </p>
          </div>

          {/* Day toggle buttons */}
          <div className="flex gap-2 flex-wrap">
            {availability.map(({ day, active }) => (
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(day)}
                className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                  active
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-background text-muted-foreground hover:border-primary/40"
                }`}
              >
                {day}
              </button>
            ))}
          </div>

          {/* Slots per active day */}
          <div className="flex flex-col gap-4">
            {availability
              .filter((d) => d.active)
              .map(({ day, slots }) => (
                <div key={day} className="rounded-lg border border-border p-3">
                  <p className="text-sm font-medium mb-2">{day}</p>
                  <div className="flex flex-col gap-2">
                    {slots.map((slot) => (
                      <div key={slot.id} className="flex items-center gap-2">
                        <input
                          type="time"
                          value={slot.start}
                          onChange={(e) => updateSlot(day, slot.id, "start", e.target.value)}
                          className="h-8 rounded-lg border border-input bg-background px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                        />
                        <span className="text-muted-foreground text-sm">to</span>
                        <input
                          type="time"
                          value={slot.end}
                          onChange={(e) => updateSlot(day, slot.id, "end", e.target.value)}
                          className="h-8 rounded-lg border border-input bg-background px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
                        />
                        <button
                          type="button"
                          onClick={() => removeSlot(day, slot.id)}
                          className="ml-auto flex h-7 w-7 items-center justify-center rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => addSlot(day)}
                    className="mt-2 text-xs text-primary hover:underline"
                  >
                    + Add slot
                  </button>
                </div>
              ))}

            {availability.every((d) => !d.active) && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Select the days you're available above.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Error */}
      {stepError && (
        <p className="mt-4 text-sm text-destructive">{stepError}</p>
      )}

      {/* Navigation */}
      <div className="mt-7 flex gap-3">
        {step > 1 ? (
          <Button variant="outline" onClick={handleBack} className="flex-1">
            Back
          </Button>
        ) : (
          <Link href="/signup" className="flex-1">
            <Button variant="outline" className="w-full">Back</Button>
          </Link>
        )}

        {step < TOTAL_STEPS ? (
          <Button onClick={handleNext} className="flex-1">
            Continue
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={isPending} className="flex-1">
            {isPending ? "Creating profile…" : "Create profile"}
          </Button>
        )}
      </div>

      {/* Footer */}
      <p className="mt-5 text-center text-xs text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-foreground hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
