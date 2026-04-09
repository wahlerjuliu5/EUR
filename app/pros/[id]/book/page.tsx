import { notFound } from "next/navigation"
import { Nav } from "@/components/nav"
import { createClient } from "@/lib/supabase/server"
import { BookingFlow } from "./booking-flow"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase
    .from("handymen")
    .select("name, trade")
    .eq("id", id)
    .single()
  if (!data) return { title: "Book — HandyBook" }
  return { title: `Book ${data.name} · ${data.trade} — HandyBook` }
}

export default async function BookPage({
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

  return (
    <div className="flex min-h-screen flex-col">
      <Nav />
      <BookingFlow handyman={data} />
    </div>
  )
}
