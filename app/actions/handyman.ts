"use server"

import { headers } from "next/headers"
import { createClient } from "@/lib/supabase/server"

export type ServiceItem = {
  name: string
  price: number
  unit: string
}

export type AvailabilitySlot = {
  day: string
  slots: string[]
}

export type HandymanProfileInput = {
  email: string
  password: string
  name: string
  city: string
  phone: string
  trade: string
  hourlyRate: number
  yearsExperience: number
  bio: string
  tags: string[]
  certifications: string[]
  services: ServiceItem[]
  availability: AvailabilitySlot[]
}

type ActionResult = { error: string } | { message: string }

export async function createHandymanProfile(
  data: HandymanProfileInput
): Promise<ActionResult> {
  const supabase = await createClient()
  const headersList = await headers()
  const origin = headersList.get("origin") ?? "http://localhost:3000"

  // 1. Create the auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: { role: "handyman" },
    },
  })

  if (authError) return { error: authError.message }
  if (!authData.user) return { error: "Failed to create account. Please try again." }

  // 2. Derive avatar initials and a colour
  const nameParts = data.name.trim().split(/\s+/)
  const initials =
    nameParts.length >= 2
      ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
      : nameParts[0].slice(0, 2).toUpperCase()

  const palette = [
    "#4A6FA5", "#3A8FA0", "#D4872E", "#2E5F8A",
    "#2E7D52", "#8B4A6B", "#5C4A2E", "#2E6B8B",
    "#6B2E8B", "#8B2E2E", "#3D7A2E", "#5A1E8B",
  ]
  const color = palette[Math.floor(Math.random() * palette.length)]

  // 3. Insert the handyman profile row
  const { error: dbError } = await supabase.from("handymen").insert({
    user_id: authData.user.id,
    name: data.name,
    trade: data.trade,
    city: data.city,
    hourly_rate: data.hourlyRate,
    years_experience: data.yearsExperience,
    bio: data.bio || "",
    tags: data.tags,
    certifications: data.certifications,
    services: data.services,
    availability: data.availability,
    initials,
    color,
    phone: data.phone || null,
    verified: false,
    available_today: false,
    rating: 0,
    review_count: 0,
  })

  if (dbError) return { error: dbError.message }

  return {
    message:
      "Your profile is live on HandyBook! Check your email to confirm your account so homeowners can book you.",
  }
}
