"use client"

import { useState } from "react"
import Link from "next/link"
import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { signUp } from "@/app/actions/auth"

export default function SignupPage() {
  const [role, setRole] = useState<"client" | "handyman">("client")
  const [state, action, pending] = useActionState(signUp, null)

  if (state && "message" in state) {
    return (
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-8 shadow-sm text-center">
        <div className="mb-4 text-3xl">📬</div>
        <h2 className="mb-2 text-lg font-semibold">Check your email</h2>
        <p className="text-sm text-muted-foreground">{state.message}</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm rounded-xl border border-border bg-card p-8 shadow-sm">
      <h1 className="mb-1 text-xl font-semibold">Create an account</h1>
      <p className="mb-6 text-sm text-muted-foreground">Join HandyBook today</p>

      {/* Role selection */}
      <div className="mb-6 flex flex-col gap-1.5">
        <p className="text-sm font-medium">I am a…</p>
        <div className="grid grid-cols-2 gap-2">
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-input px-3 py-2.5 text-sm transition-colors has-checked:border-primary has-checked:bg-primary/5">
            <input
              type="radio"
              name="role_ui"
              value="client"
              checked={role === "client"}
              onChange={() => setRole("client")}
              className="accent-primary"
            />
            Homeowner
          </label>
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-input px-3 py-2.5 text-sm transition-colors has-checked:border-primary has-checked:bg-primary/5">
            <input
              type="radio"
              name="role_ui"
              value="handyman"
              checked={role === "handyman"}
              onChange={() => setRole("handyman")}
              className="accent-primary"
            />
            Tradesperson
          </label>
        </div>
      </div>

      {role === "handyman" ? (
        /* Tradesperson path — redirect to full profile setup */
        <div className="flex flex-col gap-4">
          <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm">
            <p className="font-medium text-foreground mb-1">Set up your professional profile</p>
            <p className="text-muted-foreground leading-relaxed">
              We'll walk you through your trade, certifications, services, and availability — so homeowners can find and book you.
            </p>
          </div>
          <Link href="/signup/handyman">
            <Button size="lg" className="w-full">Get started as a tradesperson</Button>
          </Link>
        </div>
      ) : (
        /* Homeowner path — simple email + password */
        <form action={action} className="flex flex-col gap-4">
          <input type="hidden" name="role" value="client" />

          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="h-9 rounded-lg border border-input bg-background px-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
              placeholder="you@example.com"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-medium">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              className="h-9 rounded-lg border border-input bg-background px-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
              placeholder="Min. 8 characters"
            />
          </div>

          {"error" in (state ?? {}) && (
            <p className="text-sm text-destructive">
              {(state as { error: string }).error}
            </p>
          )}

          <Button type="submit" disabled={pending} className="mt-2 w-full">
            {pending ? "Creating account…" : "Create account"}
          </Button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-foreground hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}
