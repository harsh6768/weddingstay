// The whole backend: one Netlify Function behind /api/*.
// There are no accounts. Two kinds of secret link open a wedding:
//   /api/w/<manage token>   the couple's private link: read and change everything
//   /api/g/<household id>   one family's guest link: read their invite, send their own reply
// Each wedding is one row; changes run the app's own reducer inside a locked transaction.
import postgres from 'postgres'
import { sampleData } from '../data/sample'
import type { Guest, WeddingData } from '../data/types'
import { newId, reducer, type Action } from '../lib/reducer'

declare const process: { env: Record<string, string | undefined> }
const sql = postgres(process.env.DATABASE_URL ?? '', { prepare: false, max: 1, idle_timeout: 20 })

// Everything a couple can do, except starting over (that's a new wedding) and the demo-only reset.
const hostActions = new Set<string>(['allocation/add', 'allocation/remove', 'allocation/status', 'allocation/publish', 'invitation/state', 'function/publish', 'wedding/template', 'guest/respond', 'household/add', 'function/add', 'hotel/add'])
const MAX_BODY = 300_000

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } })
const fail = (status: number, error: string) => json({ error }, status)
const isStr = (v: unknown, max = 120): v is string => typeof v === 'string' && v.length <= max
const isDate = (v: unknown) => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)

async function readAction(req: Request): Promise<Action | null> {
  const text = await req.text()
  if (text.length > MAX_BODY) return null
  try {
    const a = JSON.parse(text)
    return a && typeof a.type === 'string' ? a : null
  } catch { return null }
}

/** What a family's link may see: their own people, the published schedule, and their own rooms. */
export function guestView(d: WeddingData, householdId: string): WeddingData {
  const allocations = d.allocations.filter((a) => a.householdId === householdId)
  const shown = allocations.filter((a) => a.publishedToGuest)
  return {
    ...d,
    members: [], audit: [], blocks: [],
    functions: d.functions.filter((f) => f.isPublished),
    households: d.households.filter((h) => h.id === householdId),
    guests: d.guests.filter((g) => g.householdId === householdId),
    allocations,
    hotels: d.hotels.filter((h) => shown.some((a) => a.hotelId === h.id)),
    roomTypes: d.roomTypes.filter((r) => shown.some((a) => a.roomTypeId === r.id)),
  }
}

/** A guest may only rewrite the people already in their own family. */
export function guestReplyOk(d: WeddingData, householdId: string, a: Action): boolean {
  if (a.type !== 'guest/respond' || a.householdId !== householdId || !Array.isArray(a.guests) || a.guests.length > 40) return false
  const mine = new Set(d.guests.filter((g) => g.householdId === householdId).map((g) => g.id))
  return a.guests.every((g: Guest) => g && mine.has(g.id) && g.householdId === householdId)
}

const change = (id: string, a: Action) => sql.begin(async (tx) => {
  const [row] = await tx`select data from weddings where id = ${id} for update`
  const data = reducer(row.data as WeddingData, a)
  await tx`update weddings set data = ${tx.json(data as never)}, updated_at = now() where id = ${id}`
  return data
})

export default async function api(req: Request): Promise<Response> {
  const [, , kind, key] = new URL(req.url).pathname.split('/')
  try {
    // Start a new wedding. shortcut: no rate limit on creating weddings; add one if spam shows up.
    if (kind === 'weddings' && req.method === 'POST') {
      const a = await readAction(req)
      if (a?.type !== 'wedding/create' || ![a.brideName, a.groomName, a.city].every((v) => isStr(v) && v.trim()) || !isStr(a.venueName) || !isDate(a.startDate) || !isDate(a.endDate)
        || !Array.isArray(a.functions) || !a.functions.length || a.functions.length > 20 || !a.functions.every((f) => isStr(f, 60))) return fail(400, 'Please fill in all the details.')
      const id = crypto.randomUUID()
      const token = newId() + newId() // ~120 random bits
      const created = reducer(sampleData, a)
      const data = { ...created, wedding: { ...created.wedding, id } }
      await sql`insert into weddings (id, manage_token, data) values (${id}, ${token}, ${sql.json(data as never)})`
      return json({ token, data })
    }

    if (kind === 'w' && key) {
      const [row] = await sql`select id, data from weddings where manage_token = ${key}`
      if (!row) return fail(404, 'This link doesn’t open a wedding.')
      if (req.method === 'GET') return json(row.data)
      const a = await readAction(req)
      if (!a || !hostActions.has(a.type)) return fail(400, 'That change isn’t allowed.')
      // A family's id is their guest link, so it must be hard to guess (see newId).
      if (a.type === 'household/add' && !(isStr(a.household?.id, 40) && a.household.id.length >= 12)) return fail(400, 'That change isn’t allowed.')
      return json(await change(row.id, a))
    }

    if (kind === 'g' && key) {
      const [row] = await sql`select id, data from weddings where data->'households' @> ${sql.json([{ id: key }])} limit 1`
      if (!row) return fail(404, 'This invite link is no longer active.')
      if (req.method === 'GET') return json(guestView(row.data as WeddingData, key))
      const a = await readAction(req)
      if (!a || !guestReplyOk(row.data as WeddingData, key, a)) return fail(400, 'That reply couldn’t be saved.')
      return json(guestView(await change(row.id, a), key))
    }

    return fail(404, 'Not found')
  } catch (e) {
    console.error(e)
    return fail(500, 'Something went wrong. Please try again.')
  }
}
