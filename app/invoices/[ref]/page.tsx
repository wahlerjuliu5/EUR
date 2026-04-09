import { notFound } from "next/navigation"
import Link from "next/link"
import { BookCheck, Star, BadgeCheck } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { PrintButton } from "./print-button"

const MONTH_FULL = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
]
const DAY_FULL = [
  "Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday",
]

function fmtDate(isoDate: string) {
  // isoDate is "YYYY-MM-DD"; parse without timezone shift
  const [y, m, d] = isoDate.split("-").map(Number)
  const date = new Date(y, m - 1, d)
  return `${DAY_FULL[date.getDay()]}, ${d} ${MONTH_FULL[m - 1]} ${y}`
}

function fmtCreated(ts: string) {
  const d = new Date(ts)
  return `${d.getDate()} ${MONTH_FULL[d.getMonth()]} ${d.getFullYear()}`
}

const STATUS_STYLES: Record<string, string> = {
  pending:   "bg-amber-50 text-amber-700 border-amber-200",
  confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  completed: "bg-green-50 text-green-700 border-green-200",
}

export default async function InvoicePage({
  params,
}: {
  params: Promise<{ ref: string }>
}) {
  const { ref } = await params
  const supabase = await createClient()

  const { data: booking } = await supabase
    .from("bookings")
    .select("*, handymen(*)")
    .eq("booking_ref", ref)
    .single()

  if (!booking) notFound()

  const h = booking.handymen as Record<string, unknown>
  const statusStyle =
    STATUS_STYLES[booking.status] ?? "bg-muted text-muted-foreground border-border"

  return (
    <>
      {/* Print-only global styles */}
      <style>{`
        @media print {
          .print\\:hidden { display: none !important; }
          body { font-size: 12pt; }
        }
      `}</style>

      <div className="min-h-screen bg-muted/30 px-4 py-10 print:bg-white print:p-0">
        {/* Top bar */}
        <div className="mx-auto mb-6 flex max-w-2xl items-center justify-between print:hidden">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm font-semibold text-foreground"
          >
            <BookCheck className="size-4 text-primary" />
            HandyBook
          </Link>
          <PrintButton />
        </div>

        {/* Invoice card */}
        <div className="mx-auto max-w-2xl rounded-2xl border bg-card shadow-sm print:shadow-none print:rounded-none print:border-0">
          {/* Header */}
          <div className="border-b px-8 py-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-1.5 text-primary">
                  <BookCheck className="size-5" />
                  <span className="text-base font-bold">HandyBook</span>
                </div>
                <p className="mt-3 text-2xl font-bold tracking-tight">
                  Invoice
                </p>
                <p className="mt-0.5 font-mono text-sm text-muted-foreground">
                  {booking.booking_ref}
                </p>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                <p>
                  <span className="font-medium text-foreground">Issued:</span>{" "}
                  {fmtCreated(booking.created_at)}
                </p>
                <p className="mt-1">
                  <span className="font-medium text-foreground">Job date:</span>{" "}
                  {fmtDate(booking.selected_date)}
                </p>
                <div className="mt-3 flex justify-end">
                  <span
                    className={`inline-block rounded-full border px-3 py-0.5 text-xs font-semibold capitalize ${statusStyle}`}
                  >
                    {booking.status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Parties */}
          <div className="grid grid-cols-2 gap-6 border-b px-8 py-6 text-sm">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Bill To
              </p>
              <p className="font-semibold">{booking.customer_name}</p>
              <p className="text-muted-foreground">{booking.customer_email}</p>
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Service Provider
              </p>
              <div className="flex items-center gap-2">
                <div
                  className="flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
                  style={{ backgroundColor: h.color as string }}
                >
                  {h.initials as string}
                </div>
                <div>
                  <p className="font-semibold leading-tight">
                    {h.name as string}
                    {h.verified && (
                      <BadgeCheck className="ml-1 inline size-3.5 text-primary" />
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {h.trade as string} · {h.city as string}
                  </p>
                </div>
              </div>
              <div className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
                <Star className="size-3 fill-primary text-primary" />
                {(h.rating as number).toFixed(1)} · {h.review_count as number}{" "}
                reviews
              </div>
            </div>
          </div>

          {/* Job details */}
          <div className="border-b px-8 py-6 text-sm">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Job Details
            </p>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-2">
              <div>
                <dt className="text-muted-foreground">Date</dt>
                <dd className="font-medium">{fmtDate(booking.selected_date)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Time slot</dt>
                <dd className="font-medium">{booking.selected_slot}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Estimated duration</dt>
                <dd className="font-medium">
                  {booking.hours} hr{booking.hours !== 1 ? "s" : ""}
                </dd>
              </div>
            </dl>
            <div className="mt-3">
              <p className="text-muted-foreground">Description</p>
              <p className="mt-0.5 font-medium">{booking.description}</p>
            </div>
          </div>

          {/* Line items */}
          <div className="px-8 py-6">
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Price Breakdown
            </p>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="pb-2 font-medium">Description</th>
                  <th className="pb-2 text-center font-medium">Qty</th>
                  <th className="pb-2 text-right font-medium">Unit price</th>
                  <th className="pb-2 text-right font-medium">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                <tr>
                  <td className="py-3">
                    Labour —{" "}
                    <span className="text-muted-foreground">
                      {h.trade as string}
                    </span>
                  </td>
                  <td className="py-3 text-center text-muted-foreground">
                    {booking.hours} hr{booking.hours !== 1 ? "s" : ""}
                  </td>
                  <td className="py-3 text-right text-muted-foreground">
                    €{Number(booking.hourly_rate).toFixed(2)}
                  </td>
                  <td className="py-3 text-right font-medium">
                    €{Number(booking.service_price).toFixed(2)}
                  </td>
                </tr>
                <tr>
                  <td className="py-3 text-muted-foreground">
                    Platform service fee (10%)
                  </td>
                  <td className="py-3" />
                  <td className="py-3" />
                  <td className="py-3 text-right font-medium">
                    €{Number(booking.commission).toFixed(2)}
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="border-t">
                  <td
                    colSpan={3}
                    className="pt-4 text-base font-bold"
                  >
                    Total due
                  </td>
                  <td className="pt-4 text-right text-base font-bold">
                    €{Number(booking.total).toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>

            <p className="mt-4 rounded-lg bg-muted/60 px-4 py-3 text-xs text-muted-foreground">
              €{Number(booking.handyman_bonus).toFixed(2)} loyalty bonus is
              credited to{" "}
              <span className="font-medium text-foreground">
                {(h.name as string).split(" ")[0]}
              </span>{" "}
              upon job completion — HandyBook&apos;s way of rewarding
              tradespeople who deliver great work.
            </p>
          </div>

          {/* Footer */}
          <div className="rounded-b-2xl border-t bg-muted/30 px-8 py-4 text-center text-xs text-muted-foreground print:rounded-none">
            HandyBook · handybook.com · support@handybook.com
          </div>
        </div>
      </div>
    </>
  )
}
