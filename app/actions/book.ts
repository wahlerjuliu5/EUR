"use server"

import { createClient } from "@/lib/supabase/server"

export interface BookingPayload {
  handyman_id: string
  customer_name: string
  customer_email: string
  selected_date: string // ISO date "2026-04-14"
  selected_slot: string // e.g. "08:00–17:00"
  hours: number
  description: string
  hourly_rate: number
  service_price: number
  commission: number
  handyman_bonus: number
  total: number
}

export async function createBooking(
  payload: BookingPayload
): Promise<{ bookingRef: string } | { error: string }> {
  const supabase = await createClient()

  const bookingRef =
    "HB-" + Math.random().toString(36).slice(2, 8).toUpperCase()

  const { error } = await supabase
    .from("bookings")
    .insert({ booking_ref: bookingRef, ...payload })

  if (error) return { error: error.message }
  return { bookingRef }
}
