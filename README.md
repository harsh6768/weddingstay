# WeddingStay

Couple-first wedding guest and accommodation management for Indian weddings: one private link per family for RSVPs, travel and stay dates, then hotel rooms assigned night by night with conflict checks.

This repository currently holds the **front-end prototype with sample data**. There is no backend or database yet; everything runs in the browser and resets on reload.

## Run it

```bash
npm install
npm run dev          # http://localhost:5173
npm test             # allocation and availability logic
npm run build        # static site in dist/
npm run build:preview  # one self-contained HTML file in dist-preview/
```

Requires Node 20+.

### Saving real weddings

Without a database the app still runs as the sample demo. To save real weddings, run `backend/schema.sql` once on a Postgres database (we use Supabase), then put `DATABASE_URL` for the `weddingstay_api` role in `.env.local` (see `.env.example`) and run `npm run dev`: the app and its API both run at http://localhost:5173. With `DATABASE_URL` set, `npm test` also runs the API tests against it.

There are no accounts yet. Creating a wedding gives the couple a private link (`#/w/<token>`) that opens it; each family's guest link (`#/g/<id>`) can only send that family's reply. The server is one Netlify Function (`backend/api.ts`) that keeps each wedding as one row and runs the same reducer as the app (`shared/reducer.ts`).

## Deploy on Netlify

Pushes to `main` deploy automatically through GitHub Actions (`.github/workflows/deploy.yml`): it installs, runs the tests, builds, and publishes `dist/` to Netlify. Pull requests get the tests and build only.

One-time setup:

1. In Netlify, create an empty site (**Add new site → Deploy manually**, or `npx netlify-cli sites:create`), then copy its **Site ID** from Site configuration → General.
2. Create a personal access token under Netlify **User settings → Applications → Personal access tokens**.
3. In GitHub, **Settings → Secrets and variables → Actions**, add `NETLIFY_SITE_ID` and `NETLIFY_AUTH_TOKEN`.
4. In Netlify, **Site configuration → Environment variables**, add `DATABASE_URL` (the Supabase pooler connection string for `weddingstay_api`).
5. Re-run the latest "Test and deploy" run, or push to `main`.

`netlify.toml` holds the cache and security headers. Routes use `#/…` URLs, so no redirect rules are needed. Don't also link the repo in Netlify's own Git settings, or every push deploys twice.

## What's in the prototype

| Area | Screens |
| --- | --- |
| Couple dashboard | Overview (headcount, rooms needed vs held per night, conflicts, setup checklist), Guests (filters, family drawer, import flow), Invitations (WhatsApp share, reminders), Functions, Settings (team and access) |
| Accommodation | Hotels and night-wise inventory, Guest requirements, Room allocation with live validation, Rooming lists and publishing to guests |
| Guest link (no login) | `/g/<household>` RSVP form per person and per function, travel, stay; confirmation; `/g/<household>/stay` stay details |

Sample wedding: Ananya & Rohan, Udaipur, 11 to 13 Dec 2026, 32 families, 3 hotels. All names and bookings are invented (`shared/sample.ts`).

## Layout

```
frontend/               everything people see (React + Tailwind)
  pages/                one file per screen
  components/           shared UI, ornaments, invite designs
  lib/                  screen helpers (family, accommodation, stats)
  store.tsx             app state; sends each change to the API
backend/                everything on the server
  api.ts                the API: /api/weddings, /api/w/<token>, /api/g/<family>
  api.test.ts           API tests (run when DATABASE_URL is set)
  functions/api.mts     Netlify Function entry
  schema.sql            the database table (run once on Supabase)
  schema.prisma         older draft schema, for reference
shared/                 used by both sides
  reducer.ts            every change to a wedding (runs in the app and on the server)
  types.ts              the wedding data shape
  sample.ts             the sample wedding
  dates.ts, templates.ts
```

## Rules carried from the product blueprint

- A room assigned in WeddingStay is never shown as booked until the hotel has confirmed it.
- Only HELD and CONFIRMED room blocks count as available inventory; PLANNED and REQUESTED are shown separately.
- Each person is a separate guest record, even when one family member answers for the household.
- Changes warn; nothing reassigns another family automatically.

## Next

Accounts and login, so a couple can get back in without their private link.
