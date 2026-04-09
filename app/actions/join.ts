"use server"

import { createClient } from "@/lib/supabase/server"

const COLORS = [
  "#4A6FA5", "#D4872E", "#2E7D52", "#8B4A6B", "#5C4A2E",
  "#2E6B8B", "#3D7A2E", "#6B2E8B", "#8B2E2E", "#4A7B8B",
  "#7B6B2E", "#3A8FA0", "#C07028", "#2D8A6A", "#7A3A5A",
]

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2)
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return parts[0].slice(0, 2).toUpperCase()
}

function pickColor(name: string) {
  let hash = 0
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) % COLORS.length
  return COLORS[Math.abs(hash)]
}

export interface JoinPayload {
  name: string
  email: string
  password: string
  trade: string
  city: string
  hourly_rate: number
  years_experience: number
  bio: string
  tags: string[]
  availability: { day: string; slots: string[] }[]
  services: { name: string; price: number; unit: string }[]
}

export async function joinAsHandyman(
  payload: JoinPayload
): Promise<{ error: string } | { success: true }> {
  const supabase = await createClient()

  // 1. Create auth user
  const { error: authError } = await supabase.auth.signUp({
    email: payload.email,
    password: payload.password,
    options: {
      data: { role: "handyman", name: payload.name },
    },
  })

  if (authError) return { error: authError.message }

  // 2. Insert handyman profile (INSERT policy allows anon inserts)
  const { error: dbError } = await supabase.from("handymen").insert({
    name: payload.name,
    trade: payload.trade,
    city: payload.city,
    hourly_rate: payload.hourly_rate,
    years_experience: payload.years_experience,
    bio: payload.bio,
    tags: payload.tags,
    availability: payload.availability,
    services: payload.services,
    initials: getInitials(payload.name),
    color: pickColor(payload.name),
    verified: false,
    available_today: false,
    rating: 0,
    review_count: 0,
  })

  if (dbError)
    return {
      error: `Account created but profile save failed: ${dbError.message}`,
    }

  return { success: true }
}
