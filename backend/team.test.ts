// Google sign-in, helpers and invite links. Runs against a real Postgres when DATABASE_URL is set; skipped otherwise.
// Tokens are signed here with a test secret, the way Supabase signs them with HS256.
import { SignJWT } from 'jose'
import { describe, expect, it } from 'vitest'
import type { Guest, Household } from '../shared/types'

declare const process: { env: Record<string, string | undefined> }
process.env.VITE_SUPABASE_URL = 'http://supabase.test'
process.env.SUPABASE_JWT_SECRET = 'test-secret-test-secret-test-secret!'
const { default: api } = await import('./api')

const tokenFor = (id: string, name: string) => new SignJWT({ email: `${name}@example.com`, user_metadata: { full_name: name } })
  .setProtectedHeader({ alg: 'HS256' }).setSubject(id).setIssuer('http://supabase.test/auth/v1').setAudience('authenticated').setExpirationTime('1h')
  .sign(new TextEncoder().encode(process.env.SUPABASE_JWT_SECRET))

const as = (jwt: string | null) => async (method: string, path: string, body?: unknown) => {
  const headers: Record<string, string> = jwt ? { authorization: `Bearer ${jwt}` } : {}
  const r = await api(new Request(`http://x/api${path}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) }))
  return { status: r.status, body: await r.json() }
}
const family = (id: string, side: Household['side']) => ({
  type: 'household/add',
  household: { id, name: `Family ${id}`, side, city: '', primaryContactId: `${id}_g1`, invitation: 'NOT_SENT' } satisfies Household,
  guests: [{ id: `${id}_g1`, householdId: id, firstName: 'P', lastName: 'X', type: 'ADULT', side, relationship: '', tags: [], rsvp: 'PENDING', attendance: {}, stay: { needs: 'UNSURE' }, travel: {} } satisfies Guest],
})

describe.skipIf(!process.env.DATABASE_URL)('google sign-in and helpers', () => {
  it('links weddings to accounts, invites a helper, and keeps them to their side', async () => {
    const n = Math.random().toString(36).slice(2, 10)
    const couple = as(await tokenFor(crypto.randomUUID(), 'Priya'))
    const mummy = as(await tokenFor(crypto.randomUUID(), 'Mummy'))
    const stranger = as(await tokenFor(crypto.randomUUID(), 'Stranger'))
    const anon = as(null)

    // Signed in when creating: the wedding is in "My weddings".
    const created = await couple('POST', '/weddings', { type: 'wedding/create', brideName: 'Priya', groomName: 'Arjun', city: 'Jaipur', venueName: '', startDate: '2027-02-12', endDate: '2027-02-14', functions: ['Wedding'] })
    expect(created.status).toBe(200)
    const id = created.body.data.wedding.id
    expect((await couple('GET', '/me/weddings')).body.map((w: { id: string }) => w.id)).toContain(id)

    const bride = `hbride${n}xx`, groom = `hgroom${n}xx`, both = `hboth0${n}xx`
    for (const [f, side] of [[bride, 'BRIDE'], [groom, 'GROOM'], [both, 'MUTUAL']] as const) expect((await couple('POST', `/weddings/${id}`, family(f, side))).status).toBe(200)

    // Others can't open it, and bad tokens are refused.
    expect((await stranger('GET', `/weddings/${id}`)).status).toBe(404)
    expect((await anon('GET', `/weddings/${id}`)).status).toBe(401)
    expect((await as('not-a-token')('GET', '/me/weddings')).status).toBe(401)
    expect((await stranger('POST', `/weddings/${id}/invites`, { name: 'X' })).status).toBe(404)

    // Invites are checked.
    expect((await couple('POST', `/weddings/${id}/invites`, { name: '  ' })).status).toBe(400)
    expect((await couple('POST', `/weddings/${id}/invites`, { name: 'x'.repeat(61) })).status).toBe(400)
    expect((await couple('POST', `/weddings/${id}/invites`, { name: 'Ok', side: 'MUTUAL' })).status).toBe(400)
    expect((await anon('GET', '/join/short')).status).toBe(404)

    // The couple invites the bride's mother for the bride's side.
    const { code } = (await couple('POST', `/weddings/${id}/invites`, { name: 'Sunita (bride’s mother)', side: 'BRIDE' })).body
    expect(code).toHaveLength(24)
    expect((await anon('GET', `/join/${code}`)).body).toMatchObject({ weddingName: 'Priya & Arjun', side: 'BRIDE' })
    expect((await anon('POST', `/join/${code}`)).status).toBe(401)
    expect((await mummy('POST', `/join/${code}`)).body).toEqual({ id })
    expect((await stranger('POST', `/join/${code}`)).status).toBe(404) // used once

    // She sees the bride's side and shared families only, and can work on them.
    const view = (await mummy('GET', `/weddings/${id}`)).body
    expect(view.households.map((h: Household) => h.id).sort()).toEqual([both, bride].sort())
    expect(view.audit).toEqual([])
    const g = view.guests.find((x: Guest) => x.householdId === bride)
    expect((await mummy('POST', `/weddings/${id}`, { type: 'guest/respond', householdId: bride, guests: [{ ...g, rsvp: 'YES' }], byCouple: true })).status).toBe(200)
    expect((await mummy('POST', `/weddings/${id}`, family(`hnew00${n}xx`, 'BRIDE'))).status).toBe(200)

    // ...but not the groom's side, nor the couple's things.
    expect((await mummy('POST', `/weddings/${id}`, { type: 'invitation/state', householdId: groom, state: 'SENT' })).status).toBe(403)
    expect((await mummy('POST', `/weddings/${id}`, family(`hnew11${n}xx`, 'GROOM'))).status).toBe(403)
    const groomGuest = { id: `${groom}_g1`, householdId: bride, firstName: 'Taken', lastName: '', type: 'ADULT', side: 'BRIDE', relationship: '', tags: [], rsvp: 'NO', attendance: {}, stay: { needs: 'NO' }, travel: {} }
    expect((await mummy('POST', `/weddings/${id}`, { type: 'guest/respond', householdId: bride, guests: [groomGuest] })).status).toBe(403)
    expect((await mummy('POST', `/weddings/${id}`, { type: 'wedding/template', id: 'x' })).status).toBe(403)
    expect((await mummy('POST', `/weddings/${id}/invites`, { name: 'X' })).status).toBe(403)

    // The team: the couple sees everyone, then removes her.
    const t = (await couple('GET', `/weddings/${id}/team`)).body
    expect(t.members.map((m: { role: string }) => m.role)).toEqual(['OWNER', 'HELPER'])
    const helperId = t.members[1].id
    expect((await couple('DELETE', `/weddings/${id}/members/${t.members[0].id}`)).status).toBe(404) // owners can't be removed
    expect((await couple('DELETE', `/weddings/${id}/members/${helperId}`)).status).toBe(200)
    expect((await mummy('GET', `/weddings/${id}`)).status).toBe(404)

    // A helper who doesn't want to sign in joins with a personal link instead.
    const { code: c2 } = (await couple('POST', `/weddings/${id}/invites`, { name: 'Vikram bhaiya', side: 'GROOM' })).body
    const { link } = (await anon('POST', `/join/${c2}/link`)).body
    expect(link).toHaveLength(24)
    expect((await anon('POST', `/join/${c2}/link`)).status).toBe(404) // used once
    const hv = (await anon('GET', `/h/${link}`)).body
    expect(hv.households.map((h: Household) => h.id).sort()).toEqual([both, groom].sort())
    expect((await anon('POST', `/h/${link}`, { type: 'invitation/state', householdId: groom, state: 'SENT' })).status).toBe(200)
    expect((await anon('POST', `/h/${link}`, { type: 'invitation/state', householdId: bride, state: 'SENT' })).status).toBe(403)
    expect((await anon('GET', `/h/${link}/team`)).body.me).toMatchObject({ role: 'HELPER', side: 'GROOM', signedIn: false })
    expect((await anon('GET', `/h/${'a'.repeat(24)}`)).status).toBe(404)
    const vikram = (await couple('GET', `/weddings/${id}/team`)).body.members.find((m: { name: string }) => m.name === 'Vikram bhaiya')
    expect((await couple('DELETE', `/weddings/${id}/members/${vikram.id}`)).status).toBe(200)
    expect((await anon('GET', `/h/${link}`)).status).toBe(404) // removing them turns the link off

    // Whoever has the private link can save the wedding to their account.
    expect((await stranger('POST', `/w/${created.body.token}/claim`)).body).toEqual({ id })
    expect((await stranger('GET', `/weddings/${id}`)).status).toBe(200)
  })
})
