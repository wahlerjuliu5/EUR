-- FixItNow seed: run this once in the Supabase Dashboard → SQL Editor

-- 1. Handymen table
create table if not exists public.handymen (
  id            uuid        default gen_random_uuid() primary key,
  name          text        not null,
  trade         text        not null,
  bio           text,
  hourly_rate   integer     not null,
  city          text        not null,
  rating        numeric(3,2) not null default 0,
  review_count  integer     not null default 0,
  verified      boolean     not null default false,
  available_today boolean   not null default true,
  tags          text[]      not null default '{}',
  initials      text        not null,
  color         text        not null,
  created_at    timestamptz not null default now()
);

-- 2. Row-level security: public can read, nobody can write via anon key
alter table public.handymen enable row level security;

drop policy if exists "Public read" on public.handymen;
create policy "Public read"
  on public.handymen for select
  using (true);

-- 3. Seed data
insert into public.handymen
  (name, trade, bio, hourly_rate, city, rating, review_count, verified, available_today, tags, initials, color)
values
  (
    'Mehmet Yilmaz', 'Plumber',
    '15 years of plumbing experience. Specialises in emergency call-outs, boiler installations, and leak repairs.',
    65, 'Amsterdam', 4.9, 87, true, true,
    array['Leaks', 'Installation', 'Boiler'], 'MY', '#2563eb'
  ),
  (
    'Jan de Vries', 'Electrician',
    'Certified electrician with expertise in residential wiring, fuse box upgrades, and EV charger installation.',
    75, 'Rotterdam', 4.8, 124, true, false,
    array['Wiring', 'Fuse box', 'EV charger'], 'JV', '#059669'
  ),
  (
    'Sophie Bakker', 'Painter',
    'Professional painter offering interior, exterior, and restoration work. Meticulous finish, always on time.',
    45, 'Amsterdam', 4.7, 56, true, true,
    array['Interior', 'Exterior', 'Restoration'], 'SB', '#9333ea'
  ),
  (
    'Lars Hendriks', 'Handyman',
    'Versatile handyman available for flat-pack assembly, general repairs, TV mounting, and more.',
    55, 'Utrecht', 4.6, 203, true, true,
    array['Assembly', 'Repairs', 'Mounting'], 'LH', '#ea580c'
  ),
  (
    'Fatima El Amrani', 'Plumber',
    'Emergency plumber available same-day. Expert in boiler servicing, blocked drains, and bathroom installs.',
    70, 'Amsterdam', 5.0, 31, true, true,
    array['Emergency', 'Boiler', 'Drains'], 'FA', '#e11d48'
  ),
  (
    'Pieter Smits', 'Carpenter',
    'Custom carpentry: doors, flooring, built-in shelving, and bespoke furniture. Free quotes available.',
    60, 'Den Haag', 4.8, 78, false, false,
    array['Doors', 'Flooring', 'Custom'], 'PS', '#d97706'
  ),
  (
    'Aisha Okonkwo', 'Electrician',
    'Fully qualified electrician. Smart home installations, lighting design, and annual safety inspections.',
    80, 'Amsterdam', 4.9, 45, true, true,
    array['Smart home', 'Lighting', 'Inspections'], 'AO', '#7c3aed'
  ),
  (
    'Daan Visser', 'HVAC',
    'Heating and cooling specialist. Air-con installs, heat pump servicing, and ventilation repairs.',
    90, 'Rotterdam', 4.7, 62, true, false,
    array['Air-con', 'Heat pump', 'Ventilation'], 'DV', '#0891b2'
  ),
  (
    'Lena Müller', 'Cleaner',
    'Professional end-of-tenancy and deep cleaning. Brings all equipment and eco-friendly products.',
    35, 'Utrecht', 4.8, 189, true, true,
    array['Deep clean', 'End-of-tenancy', 'Eco'], 'LM', '#be185d'
  ),
  (
    'Ravi Sharma', 'Gardener',
    'Garden design and maintenance. Lawn care, hedge trimming, planting schemes, and seasonal tidy-ups.',
    40, 'Den Haag', 4.6, 77, true, true,
    array['Lawn care', 'Hedge trimming', 'Planting'], 'RS', '#15803d'
  );
