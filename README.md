# HandyBook

**HandyBook** is a marketplace that connects homeowners with vetted local tradespeople — plumbers, electricians, carpenters, cleaners, and more. Homeowners can search by trade and city, browse profiles with real pricing, and book a slot directly. Tradespeople sign up with a full professional profile so they appear in search results from day one.

---

## Why HandyBook?

Finding a trustworthy tradesperson is still surprisingly hard. Most platforms either bury pricing or require signing up just to see a quote. HandyBook shows hourly rates, services, certifications, and availability upfront — no surprises.

**For homeowners:**
- Search by trade and city
- See verified ratings, certifications, and exact pricing before booking
- Book a time slot in a few clicks

**For tradespeople:**
- One-time profile setup (trade, skills, certifications, services, availability)
- Show up in local search results immediately
- Manage bookings from a single dashboard

---

## Tech stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Framework   | Next.js 16 (App Router)             |
| Language    | TypeScript                          |
| Styling     | Tailwind CSS v4                     |
| UI          | shadcn/ui (Base UI + Nova style)    |
| Auth & DB   | Supabase (Auth + Postgres)          |
| Icons       | Lucide React                        |

---

## Getting started

### 1. Clone and install

```bash
git clone <repo-url>
cd EUR
npm install
```

### 2. Set up environment variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Both values are in your Supabase project under **Settings → API**.

### 3. Set up the database

In the **Supabase SQL Editor**, run the files in order:

```
supabase/seed.sql                        ← creates tables + seeds 20 demo tradespeople
supabase/migrations/001_handyman_signup.sql  ← adds columns needed for tradesperson signup
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Key routes

| Route                   | Description                                      |
|-------------------------|--------------------------------------------------|
| `/`                     | Homepage                                         |
| `/search`               | Search and filter tradespeople                   |
| `/pros/[id]`            | Tradesperson profile page                        |
| `/pros/[id]/book`       | Multi-step booking flow                          |
| `/signup`               | Homeowner signup                                 |
| `/signup/handyman`      | 5-step tradesperson signup with full profile     |
| `/login`                | Sign in                                          |

---

## Tradesperson signup flow

Tradespeople go through a 5-step onboarding form at `/signup/handyman`:

1. **Account** — email and password
2. **Profile** — name, city, trade, hourly rate, years of experience, bio
3. **Skills & Certifications** — skill tags + trade-specific cert badges (e.g. Gas Safe, NICEIC)
4. **Services & Pricing** — list of services with prices and units (hr / fixed / m²)
5. **Availability** — weekly schedule with custom time slots per day

On submit, a Supabase Auth account is created and a profile row is inserted into the `handymen` table. The tradesperson appears in search results immediately after confirming their email.

---

## Scripts

```bash
npm run dev      # development server (http://localhost:3000)
npm run build    # production build
npm run start    # serve production build
npm run lint     # ESLint
```
