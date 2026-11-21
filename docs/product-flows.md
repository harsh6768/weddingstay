# Product flows

What each person does in WeddingStay, step by step, from the couple setting up their wedding to a family seeing their hotel room. Screens are named as they appear in the app.

## The whole journey on one page

```mermaid
flowchart TB
  subgraph Couple
    A1[Add your wedding<br/>names, city, dates, functions] --> A2{Save with Google?}
    A2 -- yes --> A3[In My weddings<br/>opens on any phone]
    A2 -- Skip for now --> A4[Wedding link<br/>copy or WhatsApp to self]
    A3 & A4 --> A5[Add families<br/>by hand or import a Google Form]
    A5 --> A6[Send invite on WhatsApp<br/>each family gets its own link]
    A9[Add hotels<br/>room types, rooms held] --> A10
    A8[See replies, headcount<br/>rooms needed per night] --> A10[Give rooms]
    A10 --> A11[Room given → Hotel confirmed → Family told]
    A11 --> A12[Send room details on WhatsApp<br/>send hotel its guest list]
  end

  subgraph Family
    B1[Open their link<br/>no login] --> B2[Who's coming to which function]
    B2 --> B3[Travel: arrival, train or flight]
    B3 --> B4[Need a room? dates]
    B4 --> B5[Submitted, can edit until the deadline]
    B6[See your stay and schedule<br/>hotel, dates, functions]
  end

  subgraph Helpers
    C1[Get a one-time invite on WhatsApp] --> C2{Sign in with Google?}
    C2 -- yes --> C3[Joins with Google]
    C2 -- no --> C4[Gets a personal link]
    C3 & C4 --> C5[Their side's families only:<br/>add, note replies, give rooms]
  end

  A6 --> B1
  B5 --> A8
  A12 --> B6
  A3 -- Who's helping → Invite --> C1
  C5 --> A8
```

## 1. The couple starts a wedding

```mermaid
sequenceDiagram
  actor C as Couple
  participant W as Web app
  participant A as API
  participant DB as Postgres

  C->>W: Home → Add your wedding (/start)
  C->>W: Step 1 names · Step 2 city, venue, dates · Step 3 functions
  W->>A: POST /api/weddings (wedding/create)
  A->>DB: insert weddings (id, manage_token, data)
  alt already signed in with Google
    A->>DB: insert members (role OWNER)
    A-->>W: token
    W->>C: My weddings
  else not signed in
    A-->>W: token
    W->>C: "Save with Google" (main button) or "Skip for now"
    alt Save with Google
      C->>W: Google sign-in, comes back with ?claim=1
      W->>A: POST /api/w/{token}/claim
      A->>DB: insert members (role OWNER)
    else Skip for now
      W->>C: Wedding link + Copy + "Send it to myself on WhatsApp" + QR on laptops
      W->>C: A "Save your wedding with Google" banner until they do
    end
  end
```

- The wedding link is like a Google Doc shared by link: anyone who has it can manage the wedding. That's why the app pushes **Save with Google** first.
- On a laptop, the **Open on your phone** QR code opens the same wedding on the phone. Signed-in people get a QR of the login page instead, which holds no secret.

## 2. Adding families and sending invites

1. **Guests → Add a family**: family name, whose side (bride's, groom's, both), main contact, WhatsApp number (10-digit Indian mobile), and how many adults and kids. Names can be left blank, because the family fills them in.
2. Or **Import from Google Form**: upload the CSV or paste the Sheet link. The app matches columns, groups rows into families, and flags rows to check (for example a leaving date before arrival). Then it adds them all at once.
3. **Send invite** opens WhatsApp with a ready message and the family's own link `#/g/{familyId}`, and marks the invite as **Sent**.
4. Families who haven't replied can be reminded the same way.

Invite states for each family:

```mermaid
stateDiagram-v2
  [*] --> NOT_SENT: family added
  NOT_SENT --> SENT: Send invite (WhatsApp)
  SENT --> SUBMITTED: family replies
  NOT_SENT --> SUBMITTED: couple notes a reply (family phoned)
  SUBMITTED --> UPDATED: family edits the reply
  UPDATED --> UPDATED: edits again
```

## 3. A family replies (guest side)

```mermaid
sequenceDiagram
  actor F as Family
  participant W as Web app
  participant A as API

  F->>W: Taps the link in WhatsApp (#/g/{familyId})
  W->>A: GET /api/g/{familyId}
  A-->>W: Only this family, functions switched on, their rooms once sent
  F->>W: Step 1 who's coming, and to which function
  F->>W: Step 2 travel: arrival date and time, train or flight number
  F->>W: Step 3 need a room? check-in and check-out
  W->>A: POST /api/g/{familyId} (guest/respond)
  A->>A: Only people already in this family may change
  A-->>W: Saved. "You can edit until {deadline}"
```

- No login, no app to install. The link works only for that family.
- If a family phones instead, the couple uses **Give a room to any family** (or notes their reply). The history says "Reply noted for ... family" by the couple.

## 4. Hotels and rooms

```mermaid
flowchart LR
  H[Add hotel<br/>contact, distance, check-in/out] --> RT[Room types<br/>people per room, extra beds, rate]
  RT --> BL[Rooms held per night<br/>a room block]
  NR[Families who need a room<br/>from replies] --> GR[Give a room<br/>pick room type, who stays, dates]
  BL --> GR
  GR --> CHK{Checks every night:<br/>free rooms, capacity, extra beds}
  CHK -- ok --> AL[Room given]
  CHK -- problem --> WARN[Warning shown<br/>couple can give it anyway]
  AL --> HC[Hotel confirmed] --> FT[Family told<br/>stay details shown on their page]
```

- Stays count nights: check-in is included and check-out isn't. 10 Dec → 12 Dec means the nights of 10 and 11 Dec.
- **Home** shows rooms needed against rooms held for each night, so shortages show up early.
- **Send list** sends each hotel its guest list on WhatsApp.
- A family sees its hotel only after **Family told** (`publishedToGuest`).

Room states:

```mermaid
stateDiagram-v2
  [*] --> ASSIGNED: Give a room
  ASSIGNED --> SENT_TO_HOTEL
  SENT_TO_HOTEL --> HOTEL_CONFIRMED
  ASSIGNED --> HOTEL_CONFIRMED
  HOTEL_CONFIRMED --> GUEST_NOTIFIED: Family told (send room details)
  ASSIGNED --> [*]: removed
```

## 5. Helpers (parents, siblings, cousins)

```mermaid
sequenceDiagram
  actor C as Couple (signed in)
  participant A as API
  actor H as Helper

  C->>A: Settings → Who's helping → Invite (name, side)
  A-->>C: One-time link /join/{code} (14 days)
  C->>H: Sends it on WhatsApp
  H->>A: Opens #/join/{code}: "Help plan Priya & Rahul's wedding"
  alt Continue with Google (recommended)
    H->>A: POST /api/join/{code} (signed in)
    A->>A: invite used, members row (HELPER, side, user_id)
    Note over H: Wedding in My weddings, on any phone
  else Continue without signing in
    H->>A: POST /api/join/{code}/link
    A->>A: invite used, members row (HELPER, side, link_token)
    A-->>H: Personal link #/h/{link}, saved on this phone
    Note over H: Asked to WhatsApp it to themselves
  end
  C->>A: Remove helper → their access and personal link stop working
```

What a helper can and can't do:

| Can | Can't |
|---|---|
| See families on their side and families for both sides | See the other side's families |
| Add families on their side | Add or switch on functions |
| Note replies for those families | Change the invite design |
| Give rooms to those families | Invite or remove helpers |

Limits: up to 30 helpers and open invites per wedding. An invite works once.

## 6. Opening the wedding again later

```mermaid
flowchart TB
  O[Open the site] --> M{Signed in with Google?}
  M -- yes --> MW[My weddings → tap the wedding]
  M -- no --> L{Has a link saved on this phone?}
  L -- wedding link --> CW[Couple's wedding]
  L -- personal link --> HW[Helper's side of the wedding]
  L -- none --> HOME[Home page: Log in, Add your wedding, Try the demo]
  NEW[New phone] --> Q{How?}
  Q -- Google --> MW
  Q -- link from WhatsApp --> CW
  Q -- QR from the laptop --> CW
```

## 7. Demo

`#/demo` opens a sample wedding (Ananya & Rohan, Udaipur, 32 families, 3 hotels) in the browser only. Nothing is saved, and every name is made up (`shared/sample.ts`). Settings shows a sample team.

## Not built yet

- Login with WhatsApp or phone OTP (needs WhatsApp Business verification, or DLT plus an SMS provider)
- Editing wedding details after creating the wedding (the screen is a preview for now)
- Automatic WhatsApp reminders (today the couple sends them from their own phone)
- An installable phone app (PWA or Capacitor)
