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

## Deploy on Netlify

`netlify.toml` is set up: Netlify runs `npm run build` and publishes `dist/`. In Netlify choose **Add new site → Import an existing project → GitHub → harsh6768/weddingstay**, keep the detected settings, and deploy. Every push to `main` redeploys. Routes use `#/…` URLs, so no redirect rules are needed.

## What's in the prototype

| Area | Screens |
| --- | --- |
| Couple dashboard | Overview (headcount, rooms needed vs held per night, conflicts, setup checklist), Guests (filters, family drawer, import flow), Invitations (WhatsApp share, reminders), Functions, Settings (team and access) |
| Accommodation | Hotels and night-wise inventory, Guest requirements, Room allocation with live validation, Rooming lists and publishing to guests |
| Guest link (no login) | `/g/<household>` RSVP form per person and per function, travel, stay; confirmation; `/g/<household>/stay` stay details |

Sample wedding: Ananya & Rohan, Udaipur, 11 to 13 Dec 2026, 32 families, 3 hotels. All names and bookings are invented (`src/data/sample.ts`).

## Layout

```
src/
  data/types.ts         types that mirror docs/schema.prisma
  data/sample.ts        deterministic sample wedding
  lib/accommodation.ts  night-wise availability + conflict detection (pure, server-ready)
  lib/dates.ts          date-only helpers; check-in included, check-out excluded
  store.tsx             in-memory store; actions map to the planned API
  pages/                one file per screen
docs/schema.prisma      draft PostgreSQL schema for the backend milestones
```

## Rules carried from the product blueprint

- A room assigned in WeddingStay is never shown as booked until the hotel has confirmed it.
- Only HELD and CONFIRMED room blocks count as available inventory; PLANNED and REQUESTED are shown separately.
- Each person is a separate guest record, even when one family member answers for the household.
- Changes warn; nothing reassigns another family automatically.

## Next

Backend APIs and the database (Next.js route handlers or a separate API, PostgreSQL + Prisma) once the screens are signed off.
