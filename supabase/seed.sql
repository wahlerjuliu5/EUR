-- HandyBook seed — run this in the Supabase SQL Editor
-- Safe to re-run: drops and recreates everything cleanly

-- ── 1. Teardown ──────────────────────────────────────────────────────────────
DROP VIEW  IF EXISTS v_handyman_search CASCADE;
DROP TABLE IF EXISTS handymen CASCADE;

-- ── 2. Handymen table ────────────────────────────────────────────────────────
CREATE TABLE handymen (
  id               uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  name             text          NOT NULL,
  trade            text          NOT NULL,
  city             text          NOT NULL,
  hourly_rate      numeric(10,2) NOT NULL,
  rating           numeric(3,2)  DEFAULT 0,
  review_count     int           DEFAULT 0,
  verified         boolean       DEFAULT false,
  available_today  boolean       DEFAULT true,
  tags             text[]        DEFAULT '{}',
  initials         text,
  color            text,
  bio              text,
  years_experience int           DEFAULT 0,
  availability     jsonb         DEFAULT '[]',
  services         jsonb         DEFAULT '[]',
  created_at       timestamptz   DEFAULT now()
);

ALTER TABLE handymen ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_handymen" ON handymen;
CREATE POLICY "public_read_handymen"
  ON handymen FOR SELECT USING (true);

-- ── 3. Search view ───────────────────────────────────────────────────────────
CREATE OR REPLACE VIEW v_handyman_search AS
  SELECT id, name, trade, city, hourly_rate,
         rating, review_count, verified, available_today,
         tags, initials, color, bio, years_experience
  FROM handymen;

-- ── 4. Seed data ─────────────────────────────────────────────────────────────
INSERT INTO handymen
  (name, trade, city, hourly_rate, rating, review_count, verified,
   available_today, tags, initials, color, bio, years_experience,
   availability, services)
VALUES

-- ── Plumbers ────────────────────────────────────────────────────────────────
(
  'Marco van den Berg', 'Plumber', 'Amsterdam',
  65, 4.9, 142, true, true,
  ARRAY['Leak repair', 'Boilers', 'Drain clearing'],
  'MB', '#4A6FA5',
  'Certified master plumber with 12 years in residential plumbing across the greater Amsterdam area. Specialises in emergency call-outs, boiler installation, and bathroom renovations. All work guaranteed for 12 months.',
  12,
  '[{"day":"Mon","slots":["08:00–12:00","14:00–17:00"]},{"day":"Tue","slots":["08:00–12:00"]},{"day":"Thu","slots":["09:00–17:00"]},{"day":"Fri","slots":["08:00–13:00"]}]'::jsonb,
  '[{"name":"Call-out / inspection","price":50,"unit":"fixed"},{"name":"Labour","price":65,"unit":"hr"},{"name":"Emergency (same-day)","price":95,"unit":"hr"},{"name":"Boiler service","price":120,"unit":"fixed"}]'::jsonb
),
(
  'Elena van Dijk', 'Plumber', 'Amsterdam',
  70, 4.7, 89, true, false,
  ARRAY['Bathroom fit-out', 'Radiators', 'Pipe lagging'],
  'EV', '#3A8FA0',
  'Specialist in full bathroom installations and central heating upgrades. Meticulous, tidy, and always leaves the site cleaner than she found it. Offers free video call estimates.',
  10,
  '[{"day":"Mon","slots":["09:00–17:00"]},{"day":"Wed","slots":["09:00–17:00"]},{"day":"Fri","slots":["09:00–13:00"]}]'::jsonb,
  '[{"name":"Assessment","price":0,"unit":"fixed"},{"name":"Labour","price":70,"unit":"hr"},{"name":"Radiator replacement","price":220,"unit":"fixed"},{"name":"Full bathroom fit-out","price":1200,"unit":"from"}]'::jsonb
),
(
  'Remy Dubois', 'Plumber', 'Rotterdam',
  60, 4.6, 71, true, true,
  ARRAY['Blocked drains', 'Taps', 'Showers'],
  'RD', '#2E5F8A',
  'Fast and reliable plumber specialising in unblocking drains and replacing worn taps and shower units. Competitive rates for small jobs. Most call-outs resolved in under an hour.',
  6,
  '[{"day":"Mon","slots":["07:00–19:00"]},{"day":"Tue","slots":["07:00–19:00"]},{"day":"Wed","slots":["07:00–19:00"]},{"day":"Thu","slots":["07:00–19:00"]},{"day":"Fri","slots":["07:00–17:00"]}]'::jsonb,
  '[{"name":"Call-out","price":45,"unit":"fixed"},{"name":"Labour","price":60,"unit":"hr"},{"name":"Drain unblocking","price":85,"unit":"fixed"},{"name":"Tap replacement","price":95,"unit":"fixed"}]'::jsonb
),

-- ── Electricians ─────────────────────────────────────────────────────────────
(
  'Sophie Janssen', 'Electrician', 'Rotterdam',
  75, 4.8, 98, true, false,
  ARRAY['Rewiring', 'Fuse boards', 'EV chargers'],
  'SJ', '#D4872E',
  'Fully qualified electrician (NEC certified) with 9 years of domestic and light commercial experience. Specialises in full rewires, consumer unit upgrades, and EV charger installation. NICEIC approved contractor.',
  9,
  '[{"day":"Mon","slots":["09:00–17:00"]},{"day":"Wed","slots":["09:00–13:00"]},{"day":"Fri","slots":["09:00–17:00"]}]'::jsonb,
  '[{"name":"Initial assessment","price":60,"unit":"fixed"},{"name":"Labour","price":75,"unit":"hr"},{"name":"Consumer unit upgrade","price":550,"unit":"fixed"},{"name":"EV charger installation","price":350,"unit":"fixed"}]'::jsonb
),
(
  'Yusuf Demir', 'Electrician', 'Utrecht',
  80, 4.7, 55, true, true,
  ARRAY['Smart home', 'Solar', 'Lighting design'],
  'YD', '#C07028',
  'Smart home and renewable energy specialist. Certified Philips Hue, Sonos, and solar panel installer. Helps homeowners cut energy bills while upgrading their lighting and automation systems.',
  8,
  '[{"day":"Tue","slots":["09:00–17:00"]},{"day":"Thu","slots":["09:00–17:00"]},{"day":"Sat","slots":["10:00–15:00"]}]'::jsonb,
  '[{"name":"Consultation","price":0,"unit":"fixed"},{"name":"Labour","price":80,"unit":"hr"},{"name":"Smart lighting (per room)","price":180,"unit":"fixed"},{"name":"Solar panel survey","price":100,"unit":"fixed"}]'::jsonb
),

-- ── Handymen ─────────────────────────────────────────────────────────────────
(
  'Luca Rossi', 'Handyman', 'Utrecht',
  45, 4.7, 204, true, true,
  ARRAY['Flat-pack', 'TV mounting', 'Odd jobs'],
  'LR', '#2E7D52',
  'Reliable and friendly handyman available throughout Utrecht. From flat-pack assembly to minor plumbing fixes — no job too small. Over 200 five-star reviews. Brings all tools; just tell me what needs doing.',
  7,
  '[{"day":"Mon","slots":["08:00–18:00"]},{"day":"Tue","slots":["08:00–18:00"]},{"day":"Wed","slots":["08:00–18:00"]},{"day":"Thu","slots":["08:00–18:00"]},{"day":"Fri","slots":["08:00–16:00"]}]'::jsonb,
  '[{"name":"Hourly rate","price":45,"unit":"hr"},{"name":"Half-day (4 hrs)","price":160,"unit":"fixed"},{"name":"Full day (8 hrs)","price":300,"unit":"fixed"},{"name":"TV mounting","price":80,"unit":"fixed"}]'::jsonb
),
(
  'Anna Kowalski', 'Handyman', 'Rotterdam',
  42, 4.8, 137, true, true,
  ARRAY['Shelving', 'Door repairs', 'Painting touch-ups'],
  'AK', '#3D6B47',
  'Versatile and detail-oriented handyman covering Rotterdam. Particularly popular for shelf installations, door adjustments, and small painting touch-ups. Friendly, punctual, and fully insured.',
  5,
  '[{"day":"Mon","slots":["09:00–17:00"]},{"day":"Tue","slots":["09:00–17:00"]},{"day":"Wed","slots":["09:00–17:00"]},{"day":"Thu","slots":["09:00–17:00"]}]'::jsonb,
  '[{"name":"Hourly rate","price":42,"unit":"hr"},{"name":"Half-day","price":150,"unit":"fixed"},{"name":"Shelf installation (per shelf)","price":35,"unit":"fixed"},{"name":"Door adjustment","price":65,"unit":"fixed"}]'::jsonb
),
(
  'Ibrahim Hassan', 'Handyman', 'Amsterdam',
  48, 4.6, 93, false, true,
  ARRAY['Tiling', 'Grouting', 'Minor plumbing'],
  'IH', '#2D8A6A',
  'Experienced handyman with a strong background in tiling, grouting, and minor plumbing repairs. Available evenings and weekends. Known for clean finishes and transparent pricing.',
  9,
  '[{"day":"Wed","slots":["16:00–20:00"]},{"day":"Thu","slots":["16:00–20:00"]},{"day":"Sat","slots":["09:00–17:00"]},{"day":"Sun","slots":["10:00–16:00"]}]'::jsonb,
  '[{"name":"Hourly rate","price":48,"unit":"hr"},{"name":"Grouting (per m²)","price":18,"unit":"m²"},{"name":"Minor plumbing call-out","price":55,"unit":"fixed"},{"name":"Full day","price":320,"unit":"fixed"}]'::jsonb
),

-- ── Painters ─────────────────────────────────────────────────────────────────
(
  'Amira El Fassi', 'Painter', 'Amsterdam',
  55, 4.9, 87, true, true,
  ARRAY['Interior', 'Exterior', 'Feature walls'],
  'AE', '#8B4A6B',
  'Award-winning decorator with an eye for colour and a meticulous finish. Specialises in high-end interior decoration, bespoke feature walls, and exterior work. All surfaces properly prepared; premium paints used as standard.',
  11,
  '[{"day":"Tue","slots":["08:00–17:00"]},{"day":"Wed","slots":["08:00–17:00"]},{"day":"Thu","slots":["08:00–17:00"]}]'::jsonb,
  '[{"name":"Labour","price":55,"unit":"hr"},{"name":"Interior painting (per m²)","price":12,"unit":"m²"},{"name":"Feature wall","price":150,"unit":"fixed"},{"name":"Full room (paint + labour)","price":320,"unit":"fixed"}]'::jsonb
),
(
  'Tobias Klein', 'Painter', 'Rotterdam',
  58, 4.7, 60, true, false,
  ARRAY['Exterior', 'Woodwork', 'Anti-damp coatings'],
  'TK', '#7A3A5A',
  'Exterior specialist with particular expertise in weatherproof coatings, woodwork painting, and anti-damp treatments. Trusted by property managers and landlords across Rotterdam for annual maintenance contracts.',
  12,
  '[{"day":"Mon","slots":["07:30–16:00"]},{"day":"Tue","slots":["07:30–16:00"]},{"day":"Fri","slots":["07:30–13:00"]}]'::jsonb,
  '[{"name":"Labour","price":58,"unit":"hr"},{"name":"Exterior wall (per m²)","price":14,"unit":"m²"},{"name":"Window frame set","price":120,"unit":"fixed"},{"name":"Full exterior repaint","price":800,"unit":"from"}]'::jsonb
),

-- ── Carpenters ───────────────────────────────────────────────────────────────
(
  'Pieter de Groot', 'Carpenter', 'Den Haag',
  70, 4.6, 63, true, false,
  ARRAY['Bespoke joinery', 'Doors', 'Decking'],
  'PG', '#5C4A2E',
  'Traditional craftsman with 15 years producing bespoke fitted furniture, hardwood decking, and architectural joinery. Every piece made to measure. Free initial consultation and quote. Lead time typically 2–4 weeks.',
  15,
  '[{"day":"Thu","slots":["08:00–17:00"]},{"day":"Fri","slots":["08:00–17:00"]}]'::jsonb,
  '[{"name":"Consultation & quote","price":0,"unit":"fixed"},{"name":"Labour","price":70,"unit":"hr"},{"name":"Door fitting (per door)","price":180,"unit":"fixed"},{"name":"Decking (per m²)","price":95,"unit":"m²"}]'::jsonb
),
(
  'Hans Müller', 'Carpenter', 'Rotterdam',
  65, 4.5, 48, false, true,
  ARRAY['Fitted wardrobes', 'Staircases', 'Loft boarding'],
  'HM', '#4A3A1E',
  'Structural carpenter specialising in fitted storage, staircase repairs, and loft conversions. Practical and efficient — most wardrobe projects completed in a single day. Free home visit available.',
  11,
  '[{"day":"Mon","slots":["08:00–16:00"]},{"day":"Tue","slots":["08:00–16:00"]},{"day":"Fri","slots":["08:00–13:00"]}]'::jsonb,
  '[{"name":"Home visit & measure","price":0,"unit":"fixed"},{"name":"Labour","price":65,"unit":"hr"},{"name":"Fitted wardrobe (basic)","price":350,"unit":"from"},{"name":"Loft boarding (per m²)","price":40,"unit":"m²"}]'::jsonb
),

-- ── Cleaners ─────────────────────────────────────────────────────────────────
(
  'Fatima Bouali', 'Cleaner', 'Amsterdam',
  35, 5.0, 311, true, true,
  ARRAY['Deep clean', 'End-of-tenancy', 'Weekly'],
  'FB', '#2E6B8B',
  'Professional cleaner trusted by over 300 families in Amsterdam. Uses eco-friendly, allergen-free products. Perfect record for end-of-tenancy cleans that secure full deposit returns. All equipment provided.',
  6,
  '[{"day":"Mon","slots":["08:00–13:00","14:00–18:00"]},{"day":"Tue","slots":["08:00–18:00"]},{"day":"Wed","slots":["08:00–18:00"]},{"day":"Thu","slots":["08:00–18:00"]},{"day":"Fri","slots":["08:00–16:00"]},{"day":"Sat","slots":["09:00–14:00"]}]'::jsonb,
  '[{"name":"Hourly rate","price":35,"unit":"hr"},{"name":"Standard clean (2 hrs)","price":65,"unit":"fixed"},{"name":"Deep clean (half-day)","price":120,"unit":"fixed"},{"name":"End-of-tenancy","price":200,"unit":"fixed"}]'::jsonb
),
(
  'Sanne de Jong', 'Cleaner', 'Amsterdam',
  32, 4.9, 188, true, true,
  ARRAY['Regular maintenance', 'Office cleans', 'Post-build'],
  'SD', '#1E5A7A',
  'Efficient and thorough cleaner popular with young families and remote workers. Offers flexible weekly and fortnightly slots. Brings all eco-certified cleaning supplies. Consistently rated 5 stars for reliability.',
  4,
  '[{"day":"Tue","slots":["08:00–14:00"]},{"day":"Wed","slots":["08:00–18:00"]},{"day":"Thu","slots":["08:00–18:00"]},{"day":"Fri","slots":["08:00–18:00"]},{"day":"Sat","slots":["09:00–13:00"]}]'::jsonb,
  '[{"name":"Hourly rate","price":32,"unit":"hr"},{"name":"Weekly clean (2 hrs)","price":60,"unit":"fixed"},{"name":"Fortnightly deep clean","price":110,"unit":"fixed"},{"name":"Post-build clean","price":180,"unit":"fixed"}]'::jsonb
),
(
  'Priya Patel', 'Cleaner', 'Utrecht',
  38, 4.8, 102, true, false,
  ARRAY['Eco products', 'Oven clean', 'Move-in ready'],
  'PP', '#2A4A7A',
  'Meticulous cleaner specialising in move-in and move-out deep cleans across Utrecht. Uses only certified organic products — safe for children and pets. Oven and appliance deep-cleaning a speciality.',
  5,
  '[{"day":"Mon","slots":["09:00–17:00"]},{"day":"Tue","slots":["09:00–17:00"]},{"day":"Wed","slots":["09:00–17:00"]},{"day":"Thu","slots":["09:00–17:00"]},{"day":"Fri","slots":["09:00–15:00"]}]'::jsonb,
  '[{"name":"Hourly rate","price":38,"unit":"hr"},{"name":"Move-out clean","price":175,"unit":"fixed"},{"name":"Oven deep-clean","price":70,"unit":"fixed"},{"name":"Full apartment (3 rooms)","price":220,"unit":"fixed"}]'::jsonb
),

-- ── Gardeners ────────────────────────────────────────────────────────────────
(
  'Jan Visser', 'Gardener', 'Eindhoven',
  40, 4.5, 52, false, true,
  ARRAY['Lawn care', 'Pruning', 'Landscaping'],
  'JV', '#3D7A2E',
  'Passionate horticulturalist offering full garden maintenance and landscape design across Eindhoven. RHS-qualified. Provides seasonal planting schemes, lawn renovation, and one-off tidy-ups. Free garden survey available.',
  8,
  '[{"day":"Mon","slots":["08:00–13:00"]},{"day":"Tue","slots":["08:00–13:00"]},{"day":"Fri","slots":["08:00–17:00"]},{"day":"Sat","slots":["09:00–15:00"]}]'::jsonb,
  '[{"name":"Garden visit / survey","price":0,"unit":"fixed"},{"name":"Hourly maintenance","price":40,"unit":"hr"},{"name":"Lawn mowing & edging","price":60,"unit":"fixed"},{"name":"Full seasonal tidy-up","price":180,"unit":"fixed"}]'::jsonb
),
(
  'Marta Santos', 'Gardener', 'Den Haag',
  38, 4.6, 67, true, true,
  ARRAY['Hedge trimming', 'Planting', 'Irrigation'],
  'MS', '#2E6A1E',
  'Garden designer and horticulturalist with a passion for low-maintenance planting schemes. Specialises in drought-resistant beds, automated irrigation, and seasonal colour. Works with budgets of all sizes.',
  7,
  '[{"day":"Mon","slots":["08:00–16:00"]},{"day":"Wed","slots":["08:00–16:00"]},{"day":"Sat","slots":["09:00–14:00"]}]'::jsonb,
  '[{"name":"Design consultation","price":50,"unit":"fixed"},{"name":"Hourly maintenance","price":38,"unit":"hr"},{"name":"Hedge trim (per metre)","price":8,"unit":"m"},{"name":"Irrigation system install","price":300,"unit":"from"}]'::jsonb
),

-- ── HVAC ─────────────────────────────────────────────────────────────────────
(
  'Yasmin Khoury', 'HVAC', 'Rotterdam',
  80, 4.8, 77, true, false,
  ARRAY['A/C install', 'Heat pumps', 'Servicing'],
  'YK', '#6B2E8B',
  'F-Gas certified HVAC engineer specialising in residential heat pump installation and air-conditioning systems. 10 years helping homeowners transition to energy-efficient heating. Full system surveys and manufacturer warranty support.',
  10,
  '[{"day":"Tue","slots":["08:00–17:00"]},{"day":"Thu","slots":["08:00–17:00"]}]'::jsonb,
  '[{"name":"System survey","price":80,"unit":"fixed"},{"name":"Labour","price":80,"unit":"hr"},{"name":"A/C installation (split unit)","price":950,"unit":"from"},{"name":"Air-to-water heat pump","price":2500,"unit":"from"}]'::jsonb
),
(
  'Felix Richter', 'HVAC', 'Amsterdam',
  85, 4.7, 41, true, false,
  ARRAY['Ventilation', 'Underfloor heating', 'Boiler upgrades'],
  'FR', '#5A1E8B',
  'Senior HVAC engineer focused on whole-home ventilation and underfloor heating systems. Works closely with architects and project managers on new builds and major renovations. All work to EN 15218 standard.',
  13,
  '[{"day":"Mon","slots":["08:00–17:00"]},{"day":"Thu","slots":["08:00–17:00"]},{"day":"Fri","slots":["08:00–13:00"]}]'::jsonb,
  '[{"name":"Initial survey","price":90,"unit":"fixed"},{"name":"Labour","price":85,"unit":"hr"},{"name":"Underfloor heating (per m²)","price":55,"unit":"m²"},{"name":"Whole-home ventilation","price":1800,"unit":"from"}]'::jsonb
),

-- ── Locksmiths ───────────────────────────────────────────────────────────────
(
  'Dirk Mulder', 'Locksmith', 'Amsterdam',
  60, 4.7, 129, true, true,
  ARRAY['Lockouts', 'Lock replacement', 'Security audit'],
  'DM', '#8B2E2E',
  'Emergency locksmith covering all of Amsterdam — average response time under 30 minutes. Master key systems, high-security lock upgrades, and full home security audits. CRB-checked, police-approved. Available 24/7.',
  14,
  '[{"day":"Mon","slots":["00:00–23:59"]},{"day":"Tue","slots":["00:00–23:59"]},{"day":"Wed","slots":["00:00–23:59"]},{"day":"Thu","slots":["00:00–23:59"]},{"day":"Fri","slots":["00:00–23:59"]},{"day":"Sat","slots":["00:00–23:59"]},{"day":"Sun","slots":["00:00–23:59"]}]'::jsonb,
  '[{"name":"Emergency lockout","price":80,"unit":"fixed"},{"name":"Standard lock replacement","price":120,"unit":"fixed"},{"name":"High-security lock upgrade","price":200,"unit":"fixed"},{"name":"Home security audit","price":150,"unit":"fixed"}]'::jsonb
),
(
  'Leila Ahmadi', 'Locksmith', 'Rotterdam',
  65, 4.8, 83, true, true,
  ARRAY['Safe installation', 'Smart locks', 'Key cutting'],
  'LA', '#6B1E1E',
  'Locksmith specialising in smart lock systems and home safe installation. Certified by all major manufacturers including Yale, Nuki, and Burg-Wächter. Also offers rapid-response lockout cover across Rotterdam.',
  8,
  '[{"day":"Mon","slots":["08:00–20:00"]},{"day":"Tue","slots":["08:00–20:00"]},{"day":"Wed","slots":["08:00–20:00"]},{"day":"Thu","slots":["08:00–20:00"]},{"day":"Fri","slots":["08:00–20:00"]},{"day":"Sat","slots":["09:00–17:00"]},{"day":"Sun","slots":["10:00–16:00"]}]'::jsonb,
  '[{"name":"Call-out","price":55,"unit":"fixed"},{"name":"Smart lock installation","price":180,"unit":"fixed"},{"name":"Home safe fitting","price":150,"unit":"fixed"},{"name":"Key duplication","price":15,"unit":"fixed"}]'::jsonb
),

-- ── Roofers ──────────────────────────────────────────────────────────────────
(
  'Nora Bakker', 'Roofer', 'Utrecht',
  85, 4.6, 44, true, false,
  ARRAY['Tile repair', 'Flat roofs', 'Gutters'],
  'NB', '#4A7B8B',
  'Experienced roofer with 13 years in residential roofing across Utrecht and surrounds. Handles everything from emergency tile replacement to full felt flat-roof installation. Free roof inspection included with all quotes.',
  13,
  '[{"day":"Mon","slots":["07:30–16:00"]},{"day":"Tue","slots":["07:30–16:00"]},{"day":"Wed","slots":["07:30–13:00"]}]'::jsonb,
  '[{"name":"Roof inspection & quote","price":0,"unit":"fixed"},{"name":"Labour","price":85,"unit":"hr"},{"name":"Tile repair (up to 5 tiles)","price":180,"unit":"fixed"},{"name":"Gutter clean & repair","price":120,"unit":"fixed"}]'::jsonb
),

-- ── Tilers ───────────────────────────────────────────────────────────────────
(
  'Carlos Ferreira', 'Tiler', 'Den Haag',
  65, 4.8, 91, true, true,
  ARRAY['Bathrooms', 'Floor tiles', 'Mosaic'],
  'CF', '#7B6B2E',
  'Specialist tiler with 9 years creating stunning bathroom and kitchen renovations across Den Haag. Skilled in large-format porcelain, natural stone, and bespoke mosaic. All work fully waterproofed and grouted to perfection.',
  9,
  '[{"day":"Mon","slots":["08:00–17:00"]},{"day":"Wed","slots":["08:00–17:00"]},{"day":"Thu","slots":["08:00–17:00"]},{"day":"Fri","slots":["08:00–15:00"]}]'::jsonb,
  '[{"name":"Consultation & measure","price":50,"unit":"fixed"},{"name":"Labour (per m²)","price":45,"unit":"m²"},{"name":"Bathroom re-tile (supply + fit)","price":800,"unit":"from"},{"name":"Mosaic feature panel","price":250,"unit":"from"}]'::jsonb
),
(
  'Jonas Berg', 'Tiler', 'Amsterdam',
  70, 4.7, 58, true, true,
  ARRAY['Large format', 'Wet rooms', 'Underfloor prep'],
  'JB', '#6A5A1E',
  'Expert in large-format porcelain tiles and wet room construction. Fully waterproofing-certified. Works on both residential and boutique commercial projects. Clean, fast, and detailed finish every time.',
  10,
  '[{"day":"Tue","slots":["08:00–17:00"]},{"day":"Thu","slots":["08:00–17:00"]},{"day":"Sat","slots":["09:00–15:00"]}]'::jsonb,
  '[{"name":"Survey & quote","price":0,"unit":"fixed"},{"name":"Labour (per m²)","price":50,"unit":"m²"},{"name":"Wet room installation","price":1200,"unit":"from"},{"name":"Tile removal & prep (per m²)","price":20,"unit":"m²"}]'::jsonb
);
