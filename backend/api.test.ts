// Runs against a real Postgres when DATABASE_URL is set (see backend/schema.sql); skipped otherwise.
import { describe, expect, it } from 'vitest'
import api from './api'

declare const process: { env: Record<string, string | undefined> }
import type { Guest, Household } from '../shared/types'

const call = async (path: string, body?: unknown) => {
  const r = await api(new Request(`http://x/api${path}`, body === undefined ? {} : { method: 'POST', body: JSON.stringify(body) }))
  return { status: r.status, body: await r.json() }
}
const family = (id: string, n: number) => ({
  type: 'household/add',
  household: { id, name: `Family ${id}`, side: 'BRIDE', city: '', primaryContactId: `${id}_g1`, invitation: 'NOT_SENT' } satisfies Household,
  guests: Array.from({ length: n }, (_, i): Guest => ({ id: `${id}_g${i + 1}`, householdId: id, firstName: `P${i}`, lastName: 'X', type: 'ADULT', side: 'BRIDE', relationship: '', tags: [], rsvp: 'PENDING', attendance: {}, stay: { needs: 'UNSURE' }, travel: {} })),
})

describe.skipIf(!process.env.DATABASE_URL)('api', () => {
  it('saves a wedding, scopes guest links, and keeps replies', async () => {
    const created = await call('/weddings', { type: 'wedding/create', brideName: 'Asha Rao', groomName: 'Dev Shah', city: 'Pune', venueName: '', startDate: '2027-02-10', endDate: '2027-02-11', functions: ['Haldi', 'Wedding'] })
    expect(created.status).toBe(200)
    const { token } = created.body
    expect(token).toHaveLength(24)
    expect(created.body.data.guests).toEqual([])

    const a = `ha${token.slice(0, 12)}`, b = `hb${token.slice(0, 12)}`
    await call(`/w/${token}`, family(a, 2))
    await call(`/w/${token}`, family(b, 1))
    expect((await call(`/w/${token}`)).body.households).toHaveLength(2)

    // Family A's link sees only family A.
    const view = await call(`/g/${a}`)
    expect(view.body.households.map((h: Household) => h.id)).toEqual([a])
    expect(view.body.guests).toHaveLength(2)
    expect(view.body.audit).toEqual([])

    // ...can answer for itself...
    const reply = view.body.guests.map((g: Guest) => ({ ...g, rsvp: 'YES' }))
    expect((await call(`/g/${a}`, { type: 'guest/respond', householdId: a, guests: reply })).status).toBe(200)
    // ...but not for family B, and can't do host things.
    const bGuest = (await call(`/w/${token}`)).body.guests.find((g: Guest) => g.householdId === b)
    expect((await call(`/g/${a}`, { type: 'guest/respond', householdId: a, guests: [{ ...bGuest, householdId: a }] })).status).toBe(400)
    expect((await call(`/g/${a}`, { type: 'invitation/state', householdId: b, state: 'DECLINED' })).status).toBe(400)
    expect((await call(`/w/${token}`, { type: 'reset' })).status).toBe(400)
    expect((await call(`/w/${token}`, family('h123', 1))).status).toBe(400) // guessable guest link

    const host = (await call(`/w/${token}`)).body
    expect(host.guests.filter((g: Guest) => g.rsvp === 'YES')).toHaveLength(2)
    expect(host.households.find((h: Household) => h.id === a).invitation).toBe('SUBMITTED')
    expect((await call('/w/not-a-real-token')).status).toBe(404)
    expect((await call('/weddings', { type: 'wedding/create', brideName: '' })).status).toBe(400)
  })
})
