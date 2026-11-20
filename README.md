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

For **Google sign-in**, also put these in `.env.local` (they're public, and already in `.env.example`):

```
VITE_SUPABASE_URL=https://sztprfjtncfmftvsvpuc.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_6z7kwbXFvO3DqRGXizUkQA_Bwd5mRBb
```

Google must be switched on in Supabase first (see [Google sign-in setup](#google-sign-in-setup)). Without these two lines everything else works; the sign-in buttons just say it isn't set up.

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
    weddingController.ts      couple's endpoints (private link or signed in)
    teamController.ts         signed-in people: my weddings, helpers, invite links
    guestController.ts        a family's guest-link endpoints
    docsController.ts         Swagger UI + OpenAPI
  services/                 business rules, no HTTP and no SQL
    weddingService.ts         create / read / change a wedding; what a helper may see
    teamService.ts            my weddings, save to account, invites, join, remove helper
    guestService.ts           what a family may see, sending its reply
  validators/actions.ts     what each kind of link (and a helper) is allowed to send, sizes of families and hotels
  validators/team.ts        invite name and side, the shape of codes and links
  repositories/             data access, the only place with SQL
    weddingRepository.ts      weddings table
    teamRepository.ts         members and invites tables
  auth.ts                   checks the Google sign-in token (Supabase Auth) on each request
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
| POST | `/w/<token>/claim` | signed in + private link | save the wedding to my Google account (as owner) |
| GET | `/me/weddings` | signed in | weddings in my account, with my role |
| GET / POST | `/weddings/<id>` | owner or helper | read / change the wedding (helpers: their side only) |
| GET | `/weddings/<id>/team` | owner or helper | who's helping, and open invites |
| POST | `/weddings/<id>/invites` | owner | make a one-time invite link for a helper |
| DELETE | `/weddings/<id>/invites/<code>` | owner | cancel an invite |
| DELETE | `/weddings/<id>/members/<member id>` | owner | remove a helper (a personal link stops working) |
| GET / POST | `/join/<code>` | anyone / signed in | read an invite / join as a helper |
| POST | `/join/<code>/link` | anyone with the invite | join without signing in; returns a personal link |
| GET / POST | `/h/<link>` | a helper's personal link | read / change the wedding (their side only) |
| GET | `/h/<link>/team` | a helper's personal link | who's helping |
| GET / POST | `/g/<family id>` | one family | read its invite / send its reply |
| GET | `/docs`, `/openapi.json` | developers | Swagger UI and the spec |

Signed-in calls send `Authorization: Bearer <Supabase access token>`; `auth.ts` checks it against Supabase's public keys (or `SUPABASE_JWT_SECRET` for older projects). Each wedding is one row in the `weddings` table (`backend/schema.sql`); `members` says who else can open it (with Google, or a helper's personal link), and `invites` holds the helpers' one-time links. Every change is an action applied by `shared/reducer.ts` inside a locked transaction, the same rules the app uses on screen.

## Database (Supabase)

The database already exists; you don't need to create anything.

| | |
| --- | --- |
| Supabase project | `weddingstay` (ref `sztprfjtncfmftvsvpuc`), org "Your Tool Kit", free plan |
| Region | `ap-south-1` (Mumbai) |
| Tables | `weddings`, `members`, `invites`, all from `backend/schema.sql` |
| App's login | role `weddingstay_api` (only this role can use the tables) |
| Connection | Transaction pooler, port `6543` |

`DATABASE_URL` looks like this (the password is shared privately, never commit it):

```
DATABASE_URL=postgresql://weddingstay_api.sztprfjtncfmftvsvpuc:<password>@aws-1-ap-south-1.pooler.supabase.com:6543/postgres
```

If it can't connect, copy the host from Supabase → weddingstay → **Connect** → **Transaction pooler** (it may be `aws-0-...` instead of `aws-1-...`). Supabase's public API keys can't read the table: row level security is on and only `weddingstay_api` has a policy.

To look at saved data: Supabase → weddingstay → **Table editor** → `weddings`. Each row is one wedding; `data` holds everything (families, guests, hotels, rooms).

## Google sign-in setup

Only the couple and their helpers sign in, and only if they want to. Guests never do; they keep their WhatsApp link. A helper who doesn't want to sign in taps **Continue without signing in** on their invite and gets a personal link instead. Signing in is optional for the couple too: a wedding made without an account still opens with its wedding link, and **Settings → Save with Google** links it later.

### How it works

Supabase Auth sits between Google and the app. Google never talks to WeddingStay directly.

1. The user taps **Continue with Google**. The app (`frontend/lib/auth.ts`) calls Supabase's `signInWithOAuth` with the PKCE flow, and remembers which page to come back to.
2. Supabase sends the user to Google, using the Client ID and secret saved in Supabase.
3. Google sends the user back to **Supabase**, at `https://sztprfjtncfmftvsvpuc.supabase.co/auth/v1/callback`.
4. Supabase sends the user back to **the site's home page** with `?code=…` in the address. The app swaps that code for a session (`AuthReturn` in `frontend/pages/Account.tsx`), cleans the address and opens the page they started from. The code comes in the query string, not the `#`, so the app's `#/…` pages are untouched and no `/auth` page is needed.
5. Each API call sends `Authorization: Bearer <access token>`. `backend/auth.ts` checks the token itself against Supabase's public keys (or `SUPABASE_JWT_SECRET`), so there's no extra "exchange the token" call and no separate session. The API lives on the same Netlify site, so no API URL setting is needed either.

### One-time setup (about 10 minutes)

**1. Google Cloud Console**
- WeddingStay's OAuth client lives in Google Cloud project `placestest-301006`: [open its Credentials page](https://console.cloud.google.com/apis/credentials?project=placestest-301006). Edit the existing client there instead of making a new one.
- Create a project (e.g. "WeddingStay") → **APIs & Services → OAuth consent screen**: External, app name "WeddingStay", your email. Publish it when you go live, or only test users you add can sign in.
- **Credentials → Create credentials → OAuth client ID** → type *Web application*, name "WeddingStay". Use its own client rather than one from another app, so people see "WeddingStay" on Google's screen.
- Authorized JavaScript origins: `http://localhost:5173` (and `https://weddingstay6768.netlify.app` when going live).
- Authorized redirect URI: `https://sztprfjtncfmftvsvpuc.supabase.co/auth/v1/callback`. This is Supabase's address, **not** the site's.
- Copy the **Client ID** and **Client secret**. The secret goes only into Supabase: never in `.env`, the repo or chat.

**2. Supabase → weddingstay → Authentication → Sign In / Providers → Google**
- Turn it on and paste the Client ID and secret.

**3. Supabase → Authentication → URL Configuration**

| | Testing on your laptop | Live site |
|---|---|---|
| Site URL | `http://localhost:5173` | `https://weddingstay6768.netlify.app` |
| Redirect URLs | `http://localhost:5173/**` | add `https://weddingstay6768.netlify.app/**` (keep the localhost one) |

**4. Tables:** run `backend/schema.sql` once in Supabase → **SQL editor** (safe to run again). Already done on 2026-11-20.

**5. Your laptop:** put `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env.local` (see step 2 of [Run it on your computer](#run-it-on-your-computer)), then restart `npm run dev`. Vite reads them only when it starts.

**6. Live site:** see [Deploy on Netlify](#deploy-on-netlify). The page's two `VITE_` values come from `.env.production` in the repo; Netlify needs `DATABASE_URL` and `VITE_SUPABASE_URL` for the API.

### Check it works

1. Open the site → **Log in** → **Continue with Google**.
2. Pick your Google account. You should come back to the same site (not localhost when testing the live one) and land on **My weddings**.
3. In DevTools → Network, calls to `/api/me/weddings` should answer 200.

### If something goes wrong

| What you see | Why | Fix |
|---|---|---|
| Google says **redirect_uri_mismatch** | The Google client doesn't have Supabase's callback | Add `https://sztprfjtncfmftvsvpuc.supabase.co/auth/v1/callback` as the redirect URI |
| Google says **Missing client_id** / "provider is not enabled" | Google isn't switched on in Supabase, or the ID is empty | Step 2 above |
| The live site sends you back to **localhost** | Supabase Site URL is still localhost, or the live address isn't in Redirect URLs | Step 3, live column |
| Sign-in buttons say sign-in **isn't set up** | `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` missing | Laptop: add them to `.env.local` and restart `npm run dev`. Live site: check `.env.production` is committed |
| Back on the site but the app says **Please sign in again** | The API couldn't check the token (older Supabase projects sign with a shared secret) | Put Supabase → Settings → JWT Keys → *Legacy JWT secret* in `SUPABASE_JWT_SECRET` (server-only, never `VITE_`) |
| Only some Google accounts can sign in | The consent screen is still in *Testing* | Publish it, or add those accounts as test users |
| You come back but the API answers 503 | `DATABASE_URL` isn't set | Add it to `.env.local` or Netlify |

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
| Sharma family (Jaipur) | Bride's | Ramesh Sharma | 94140 11223 | 3 | 0 |
| Mehta family (Ahmedabad) | Groom's | Kiran Mehta | 98250 44556 | 2 | 2 |
| Iyer family (Chennai) | Both | Lakshmi Iyer | 98400 77889 | 2 | 0 |
| Khanna family (Pune) | Groom's | Vikram Khanna | 98220 33445 | 3 | 0 |

Expect: 7 families, 20 people. **Reload the page**: they're still there (saved in Supabase).

**3. Send an invite** → on Gupta family tap **Send invite**. WhatsApp opens with a message containing their guest link (`…/#/g/h…`). The family moves to "Not replied".

**4. Reply as a guest** → open that guest link in a private/incognito window (a guest's phone):
- "Yes, all 2 of us are coming" → Next
- Do you need a room? **Yes please**, arriving 11 Feb 2027, leaving 15 Feb 2027 → Next
- **Send our reply** → "Dhanyavaad"

Back in the couple's window, reload: Gupta family shows "2 of 2 coming" and needs a room. Then try these replies:

| Family | Reply |
| --- | --- |
| Verma | 2 coming, 1 not; room 12 to 14 Feb |
| Mehta | all 4 coming; room 11 to 14 Feb |
| Kapoor | coming; no room (staying with relatives) |
| Sharma | coming; no room (local) |
| Iyer | not coming |

**5. Import Google Form replies** → Guests → **Import from Google Form**. Upload `test-data/sample-rsvps.csv`, pick **Bride's**:
- Expect 4 coming (8 people), 1 not coming (Karan Singh)
- Meera Nair "needs a quick look" (leaving date before arrival): pick 14 Feb as the other date
- **Add 5 families** → you see people staying each night

**6. Add a hotel** → Rooms → **Add a hotel**

| Hotel name | Phone | Distance | Room type | Rooms | People per room |
| --- | --- | --- | --- | --- | --- |
| Hotel Lake Palace | 94140 00000 | 10 min | Deluxe room | 5 | 3 |
| | | | Suite (tap "Another room type") | 2 | 4 |
| Amber Heritage Inn | 94141 55660 | 20 min | Standard room | 6 | 2 |
| | | | Family room | 2 | 5 |

**7. Give rooms** → Rooms → **Give a room**: Gupta → Hotel Lake Palace / Deluxe room; Verma and Mehta → Amber Heritage Inn / Family room. Then move it through **Room given → Hotel confirmed → Family told**.

**7b. Family phoned instead of replying** → Rooms → **Give a room to any family** → pick **Khanna** (no reply yet) → tick who's staying, set 12 to 14 Feb → **Next: pick a room** → Hotel Lake Palace / Suite. History shows "Reply noted for Khanna family" by You.

**8. Guest sees their stay** → reopen the Gupta guest link and tap "See your stay and schedule": the hotel, dates and functions appear only after "Family told".

**8b. Google sign-in and helpers** (needs [Google sign-in setup](#google-sign-in-setup))
- Open `#/register` → **Continue with Google** → you land on **My weddings**.
- Add a wedding while signed out: after **Create our wedding** you see **Save with Google**. Tap it: you come back signed in and the wedding is in My weddings. Or tap **Skip for now**: you get the wedding link, and the app shows a "Save your wedding with Google" banner until you do (Later hides it).
- If you made your wedding with a private link: open it, go to Settings → **Save with Google**. It now shows in My weddings, on any phone.
- Settings → Who's helping → **Add a family member**: "Sunita (Mummy)", **Bride's side** → **Make their invite link** → **Send invite on WhatsApp**. She shows as "Invite sent, not joined yet".
- Open that `#/join/…` link in another browser (or a private window) signed in with a different Google account → **Join and open the wedding**. She sees only bride's side families (and ones for both sides), can reply for them and give rooms, but can't touch groom's side families, functions or the invite design.
- Back as the couple, reload Settings: she's listed with **Remove**. Remove her, and her My weddings no longer opens it.
- The same invite link can't be used twice.
- Invite "Vikram bhaiya" for **Groom's side**, open his link in a private window and tap **Continue without signing in**. He sees "You're in" with his personal link (`#/h/…`), then only groom's side families. Reload: it still opens. Add a family: only Groom's and Both are offered. Functions has no Add button for him.
- As the couple, his row says "Uses a personal link". Remove him: his link stops working and he sees "Your helper link isn't working any more".
- Checks: the invite name must be 1 to 60 letters; a family's WhatsApp number must be a 10-digit Indian mobile; family names up to 80 letters.

**9. Other checks**
- Open the private link in another browser: the same wedding opens.
- Settings shows your private link with "Send it to myself on WhatsApp".
- Guests → Change invite design → pick a design → the guest link uses it.
- `#/demo` still shows the sample wedding (Ananya & Rohan) and saves nothing.
- http://localhost:5173/api/docs lets you call the API directly (Swagger).

## Deploy on Netlify

The live site is https://weddingstay6768.netlify.app. **GitHub Actions builds it, not Netlify** (`.github/workflows/deploy.yml`): on every push to `main` it installs, runs the tests, builds `dist/` and uploads it to Netlify together with the API function (`backend/functions`). Pull requests get the tests and build only.

That split decides where each setting lives:

| Setting | Where | Why |
|---|---|---|
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (web page) | `.env.production` in the repo | Vite bakes them into the page while GitHub builds it. They're public, so committing them is fine. |
| `DATABASE_URL` | Netlify environment variables | Secret. The API reads it on Netlify while running. |
| `VITE_SUPABASE_URL` (API) | Netlify environment variables | The API uses it to check Google sign-in tokens. |
| `SUPABASE_JWT_SECRET` | Netlify environment variables, only if needed | Secret. Only for the "Please sign in again" case in [Google sign-in setup](#if-something-goes-wrong). |
| `NETLIFY_SITE_ID`, `NETLIFY_AUTH_TOKEN` | GitHub → Settings → Secrets and variables → Actions | Lets GitHub upload to Netlify. Already set (2026-11-11). |

### One-time setup

**1. Connect GitHub to Netlify** (already done for this site)
1. Netlify → **Add new site → Deploy manually** (or `npx netlify-cli sites:create`), then copy the **Site ID** from Site configuration → General.
2. Netlify → **User settings → Applications → Personal access tokens** → create a token.
3. GitHub → **Settings → Secrets and variables → Actions** → add `NETLIFY_SITE_ID` and `NETLIFY_AUTH_TOKEN`.
4. Don't also link the repo in Netlify's own Git settings, or every push deploys twice.

**2. Netlify environment variables** → your site → **Site configuration → Environment variables → Add a variable**. Scope: *Functions* (or all), same value for every context:

| Key | Value |
|---|---|
| `DATABASE_URL` | Supabase → weddingstay → **Connect** → **Transaction pooler** string for `weddingstay_api` (port 6543), with its password. Mark it **secret**. |
| `VITE_SUPABASE_URL` | `https://sztprfjtncfmftvsvpuc.supabase.co` |
| `SUPABASE_JWT_SECRET` | Leave out unless sign-in says "Please sign in again". |

**3. Supabase and Google, for the live address** (see [Google sign-in setup](#google-sign-in-setup))
- Supabase → Authentication → **URL Configuration**: Site URL `https://weddingstay6768.netlify.app`, and add `https://weddingstay6768.netlify.app/**` to Redirect URLs (keep `http://localhost:5173/**` for testing).
- [Google Cloud → Credentials](https://console.cloud.google.com/apis/credentials?project=placestest-301006) → the WeddingStay OAuth client → add `https://weddingstay6768.netlify.app` to **Authorized JavaScript origins**.
- Google Cloud → **OAuth consent screen** → **Publish app**, so any Google account can sign in.

**4. Deploy:** merge into `main`, or GitHub → **Actions → Test and deploy → Run workflow**. Netlify env changes also need a new deploy before the API sees them.

### Check the live site

1. GitHub → Actions → the latest **Test and deploy** run is green.
2. Open https://weddingstay6768.netlify.app/api/docs. The API page should load. If it doesn't, the function wasn't deployed: check the Actions log.
3. **Log in → Continue with Google** → you come back to `weddingstay6768.netlify.app` (not localhost) and see **My weddings**.
4. **Add your wedding**, reload the page, and it's still there. An error here usually means `DATABASE_URL` is missing or wrong.

### If something goes wrong on the live site

| What you see | Fix |
|---|---|
| API answers 503 "No database is set up" | Add `DATABASE_URL` in Netlify, then redeploy |
| 503 "Google sign-in isn't set up" from the API | Add `VITE_SUPABASE_URL` in Netlify, then redeploy |
| Sign-in buttons say it **isn't set up** | `.env.production` is missing from the commit that was deployed |
| Google sends you back to **localhost** | Supabase Site URL / Redirect URLs (step 3) |
| Database "password authentication failed" or "Tenant not found" | Copy the pooler string again from Supabase → Connect (the host may be `aws-0-…` or `aws-1-…`) |
| A change doesn't show up | Check the Actions run finished, then hard-refresh |

`netlify.toml` holds the cache and security headers and points Netlify at `backend/functions`. Pages use `#/…` addresses, so no redirect rules are needed.

## Features

### For the couple (private link `#/w/<token>`)

**Start a wedding** (`/start`)
- Three short steps: names, city, venue and dates, then which functions (Mehendi, Haldi, Sangeet, Wedding and so on).
- Right after saving, the app asks the couple to **Save with Google** (one big button) so they can open the wedding on any phone with nothing to remember. **Skip for now** shows their **wedding link** instead (the private link). Anyone with it can manage the wedding, like a Google Doc shared by link, so the app nudges them to copy it or WhatsApp it to themselves.
- The link is remembered on that browser. On another phone, open the link again, or sign in with Google.
- Signed in with Google before starting? The wedding goes straight into **My weddings**.

**Sign in with Google** (`/login`, `/register`, `/me`)
- One button, "Continue with Google". No passwords.
- **My weddings** lists every wedding you own or help with. Sign out from there or from Settings.

**Guests** (`/app/guests`)
- Add a family: name, whose side, main contact, WhatsApp number, number of adults and kids. Names can stay blank because the family fills them in when they reply.
- **Send invite** opens WhatsApp with a ready message and the family's own link, and marks the invite as sent.
- Send to many families one after another, and remind those who haven't replied.
- **See what they see** opens the family's guest page.
- **Import from Google Form**: upload the form's CSV (or paste the Google Sheet link). The app matches columns, groups people into families, flags rows that need a quick look (such as a leaving date before arrival), then adds them all in one go.
- **Change the invite design**: six designs (Marigold Classic, Ivory Minimal, Midnight Deco, Sage Garden, Rani Pop, Desert Arch).

**Functions** (`/app/functions`)
- Add a function with its day, time and venue, and switch each one on or off for guests. Guests say which ones they're coming to, and the home page shows headcount per function.

**Rooms** (`/app/rooms`)
- **Hotels**: add a hotel (phone, distance, check-in and check-out) with its room types, number of rooms and people per room.
- **Need a room**: families who asked for a room, with their people and dates. **Give a room** picks a room type, shows how many are free for those nights, and who stays in it. It checks extra beds, room capacity and free rooms for every night.
- **Give a room to any family**: for families who **phoned or told you in person** instead of replying. Pick the family, tick who's staying, set arriving and leaving dates, then pick the room. The family is marked as coming and needing a room, and the history records "Reply noted for … family" by you.
- **Room given**: move each room through *Room given → Hotel confirmed → Family told*. **Send room details** sends the family their hotel on WhatsApp, and only then does their guest page show it.
- **Send list** sends each hotel its guest list on WhatsApp.

**Home** (`/app`)
- Headcount, who's coming to what, rooms needed against rooms booked per night, families still to reply, and a short setup checklist.

**Settings** (`/app/settings`)
- Your private link, with copy and "Send it to myself on WhatsApp". On a laptop it also shows an **"Open on your phone" QR code**: scan it with the phone camera and the wedding opens there (no sign-in). Helpers' personal links get the same QR. On `npm run dev` the QR holds a `localhost` address, so test it on your phone only after deploying (or run `npm run dev -- --host` and open the laptop's network address).
- Wedding details (couple, city, dates, when replies close), the invite design, and start a new wedding.
- **Save with Google** (when opened with the wedding link): links the wedding to your Google account. Until they do, a small banner in the app reminds them ("Save your wedding with Google so you never lose it", with Later to hide it).
- **Who's helping** (when signed in): the couple invites parents, siblings or cousins with a one-time WhatsApp link (`/join/<code>`, valid 14 days). They pick a side: bride's, groom's or everyone. The helper either signs in with Google (recommended: works on any phone) or taps **Continue without signing in** and gets a personal link (`#/h/<link>`) saved on that phone, with a nudge to WhatsApp it to themselves. Either way they see only that side's families (plus those shared by both), can reply on families' behalf, add families on their side and give rooms. Only the couple can change functions and the invite design, invite or remove helpers; those buttons are hidden for helpers. Removing a helper turns their personal link off. Up to 30 helpers and open invites per wedding. The demo shows a sample list.
- *Preview only for now:* "Edit wedding details" isn't saved yet.

### For each family (guest link `#/g/<familyId>`)
- No login. The link only works for that family, and it can only change that family's own reply.
- Three steps: who's coming to which function, travel (arrival time, flight or train number) and whether they need a room with dates.
- They can come back and edit the reply until the deadline.
- After the couple taps "Family told", **See your stay and schedule** shows their hotel, dates, check-in times and the functions.

### Demo (`#/demo`)
- A sample wedding (Ananya & Rohan, Udaipur, 32 families, 3 hotels) to click around. Nothing is saved. All names are invented (`shared/sample.ts`).

### How data is kept safe
- A helper's personal link is about 120 random bits, works only for that helper's side, and stops working when the couple removes them.
- Every form is checked on screen and again on the server (names, phone numbers, family and hotel sizes, invite sides).
- Google sign-in is checked on the server for every call (signed token from Supabase Auth). A wedding you're not part of answers "not found".
- One database row per wedding. The private link is about 120 bits of randomness, and family links are 12 random characters.
- The server checks every change: the couple's link can't do demo-only actions, and a guest link can only rewrite people already in its own family. Only the couple can note a reply on a family's behalf.
- Supabase's public keys can't read the table (row-level security). Only the app's own database user can.

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

- **WhatsApp OTP and phone-number login** (planned): sign in with a 6-digit code instead of Google, the easiest login for Indian families. Needs a WhatsApp Business (Meta) account for WhatsApp codes, or DLT registration plus an SMS provider such as MSG91 for SMS codes. Supabase supports phone login, so the backend change is small.
- Installable app (PWA: "Add to Home Screen"), then Play Store / App Store via Capacitor if couples ask for it.
- Edit wedding details in Settings.
