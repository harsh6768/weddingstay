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

`.env.local` is never committed, and it wins over any `DATABASE_URL` already set in your shell. When `npm run dev` starts it prints `API database: …` so you can see which database it uses. A new database needs `backend/schema.sql` run on it once.

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

## Database (Supabase)

The database already exists; you don't need to create anything.

| | |
| --- | --- |
| Supabase project | `weddingstay` (ref `sztprfjtncfmftvsvpuc`), org "Your Tool Kit", free plan |
| Region | `ap-south-1` (Mumbai) |
| Table | `weddings`, created from `backend/schema.sql` |
| App's login | role `weddingstay_api` (can only read, add and update `weddings`) |
| Connection | Transaction pooler, port `6543` |

`DATABASE_URL` looks like this (the password is shared privately, never commit it):

```
DATABASE_URL=postgresql://weddingstay_api.sztprfjtncfmftvsvpuc:<password>@aws-1-ap-south-1.pooler.supabase.com:6543/postgres
```

If it can't connect, copy the host from Supabase → weddingstay → **Connect** → **Transaction pooler** (it may be `aws-0-...` instead of `aws-1-...`). Supabase's public API keys can't read the table: row level security is on and only `weddingstay_api` has a policy.

To look at saved data: Supabase → weddingstay → **Table editor** → `weddings`. Each row is one wedding; `data` holds everything (families, guests, hotels, rooms).

## Test every flow (sample data)

Start the app with `npm run dev` and open http://localhost:5173. Use a phone-sized browser window (DevTools → device toolbar) since most users are on phones. All names and numbers below are made up.

**1. Create the wedding** → tap **Add your wedding**

| Field | Value |
| --- | --- |
| Bride | Priya Sharma |
| Groom | Arjun Mehta |
| City | Jaipur |
| First function / Last function | 12 Feb 2027 / 14 Feb 2027 |
| Venue | Rambagh Palace |
| Functions | Mehendi, Haldi, Sangeet, Wedding |

Expect: "Your wedding is saved 🎉" with your private link. Copy the link somewhere: it's the only way back in on another browser.

**2. Add families** → Guests → **Add a family**

| Family name | Side | Send to | WhatsApp | Adults | Kids |
| --- | --- | --- | --- | --- | --- |
| Gupta family (Delhi) | Bride's | Sunil Gupta | 98765 43210 | 2 | 0 |
| Verma family (Lucknow) | Groom's | Neha Verma | 98111 22334 | 2 | 1 |
| Kapoor family (Mumbai) | Both | Rahul Kapoor | 99887 66554 | 1 | 0 |

Expect: 3 families, 7 people. **Reload the page**: they're still there (saved in Supabase).

**3. Send an invite** → on Gupta family tap **Send invite**. WhatsApp opens with a message containing their guest link (`…/#/g/h…`). The family moves to "Not replied".

**4. Reply as a guest** → open that guest link in a private/incognito window (a guest's phone):
- "Yes, all 2 of us are coming" → Next
- Do you need a room? **Yes please**, arriving 11 Feb 2027, leaving 15 Feb 2027 → Next
- **Send our reply** → "Dhanyavaad"

Back in the couple's window, reload: Gupta family shows "2 of 2 coming" and needs a room. Repeat for Verma family but answer **No** for one adult, and for Kapoor family **No, thanks** to the room.

**5. Import Google Form replies** → Guests → **Import from Google Form**. Upload `test-data/sample-rsvps.csv`, pick **Bride's**:
- Expect 4 coming (8 people), 1 not coming (Karan Singh)
- Meera Nair "needs a quick look" (leaving date before arrival): pick 14 Feb as the other date
- **Add 5 families** → you see people staying each night

**6. Add a hotel** → Rooms → **Add a hotel**

| Hotel name | Phone | Distance | Room type | Rooms | People per room |
| --- | --- | --- | --- | --- | --- |
| Hotel Lake Palace | 94140 00000 | 10 min | Deluxe room | 5 | 3 |
| | | | Suite (tap "Another room type") | 2 | 4 |

**7. Give rooms** → Rooms → on Gupta family tap **Give a room**, pick Hotel Lake Palace / Deluxe room, save. Then move it through **Room given → Hotel confirmed → Family told**.

**8. Guest sees their stay** → reopen the Gupta guest link and tap "See your stay and schedule": the hotel, dates and functions appear only after "Family told".

**9. Other checks**
- Open the private link in another browser: the same wedding opens.
- Settings shows your private link with "Send it to myself on WhatsApp".
- Guests → Change invite design → pick a design → the guest link uses it.
- `#/demo` still shows the sample wedding (Ananya & Rohan) and saves nothing.
- http://localhost:5173/api/docs lets you call the API directly (Swagger).

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
