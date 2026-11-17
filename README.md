# WeddingStay

Couple-first wedding guest and accommodation management for Indian weddings: one private link per family for RSVPs, travel and stay dates, then hotel rooms assigned night by night with conflict checks.

The app has a **frontend** (what people see, in `frontend/`) and a **backend** (the API and database, in `backend/`). Code both need lives in `shared/`. There are no accounts yet: creating a wedding gives the couple a private link (`#/w/<token>`), and each family gets a guest link (`#/g/<id>`) that can only send that family's reply.

## Run it on your computer

You need **Node 20 or newer** (`node -v` to check).

**1. Get the code and install**

```bash
git clone https://github.com/harsh6768/weddingstay
cd weddingstay
npm install
```

**2. Connect a database** (skip this to run only the sample demo)

Copy the example settings file:

```bash
cp .env.example .env.local
```

Open `.env.local` and set `DATABASE_URL` to one of these:

- **Supabase (the same database as the live site):** Supabase → weddingstay project → **Connect** → **Transaction pooler**. Copy that string, then change the user to `weddingstay_api.<project ref>` and the password to the `weddingstay_api` password.
- **Postgres on your Mac:** `brew install postgresql@16 && brew services start postgresql@16`, then run once:
  ```bash
  psql postgres -c "create role weddingstay_api login password 'dev'" \
               -c "create role anon" -c "create role authenticated" \
               -f backend/schema.sql
  ```
  and use `DATABASE_URL=postgres://weddingstay_api:dev@localhost:5432/postgres`.

`.env.local` is never committed. A new database needs `backend/schema.sql` run on it once.

**3. Start frontend and backend together**

```bash
npm run dev
```

Open http://localhost:5173. That one command serves the app and the API (`/api/...`), so there is nothing else to start. Tap **Add your wedding** to create a real one; without `DATABASE_URL` you get an error there, and the sample at `#/demo` still works.

**Other commands**

```bash
npm test               # logic tests; also the API tests when DATABASE_URL is set
npm run typecheck      # TypeScript check
npm run build          # production site in dist/ (the API is deployed as a Netlify Function)
npm run build:preview  # one self-contained HTML file of the demo in dist-preview/
```

### How the backend works

- **API docs:** with `npm run dev` running, open http://localhost:5173/api/docs (Swagger UI) to see and try every endpoint.
The backend is layered; each request goes down the layers and back:

```
backend/
  api.ts                    entry: finds the route, turns errors into responses
  routes.ts                 every endpoint: method + path -> controller
  controllers/              HTTP only: read the request, call a service, send JSON
    weddingController.ts      couple's endpoints
    guestController.ts        a family's guest-link endpoints
    docsController.ts         Swagger UI + OpenAPI
  services/                 business rules, no HTTP and no SQL
    weddingService.ts         create / read / change a wedding
    guestService.ts           what a family may see, sending its reply
  validators/actions.ts     what each kind of link is allowed to send
  repositories/             data access, the only place with SQL
    weddingRepository.ts
  db.ts                     database connection (DATABASE_URL)
  http.ts, errors.ts        response helpers, AppError (status + message)
  openapi.ts                the API description for /api/docs
  functions/api.mts         Netlify Function wrapper around api.ts
```

Endpoints (all under `/api`):

| Method | Path | Who | What |
| --- | --- | --- | --- |
| POST | `/weddings` | anyone | create a wedding, returns its private token |
| GET / POST | `/w/<token>` | the couple | read / change their wedding |
| GET / POST | `/g/<family id>` | one family | read its invite / send its reply |
| GET | `/docs`, `/openapi.json` | developers | Swagger UI and the spec |

Each wedding is one row in the `weddings` table (`backend/schema.sql`). Every change is an action applied by `shared/reducer.ts` inside a locked transaction, the same rules the app uses on screen.

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
