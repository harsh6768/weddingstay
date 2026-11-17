// The couple's side: create a wedding, read it, change it. Business rules live here; no HTTP, no SQL.
import { sampleData } from '../../shared/sample'
import { newId, reducer, type Action } from '../../shared/reducer'
import type { WeddingData } from '../../shared/types'
import { AppError } from '../errors'
import * as weddings from '../repositories/weddingRepository'
import type { User } from '../auth'
import * as team from '../repositories/teamRepository'
import { seesFamily, validateCoupleAction, validateHelperAction, type CreateWedding } from '../validators/actions'
import { membership } from './teamService'

// shortcut: no rate limit on creating weddings; add one if spam shows up.
export async function createWedding(input: CreateWedding, user: User | null): Promise<{ token: string; data: WeddingData }> {
  const id = crypto.randomUUID()
  const token = newId() + newId() // ~120 random bits: this is the couple's private link
  const created = reducer(sampleData, input)
  const data = { ...created, wedding: { ...created.wedding, id } }
  await weddings.insert(id, token, data)
  if (user) await team.addMember(id, user, user.name, 'OWNER', null) // signed in: it's in their account straight away
  return { token, data }
}

async function byToken(token: string) {
  const row = await weddings.findByManageToken(token)
  if (!row) throw new AppError(404, 'This link doesn’t open a wedding.')
  return row
}

export const getWedding = async (token: string) => (await byToken(token)).data

export async function changeWedding(token: string, a: Action): Promise<WeddingData> {
  validateCoupleAction(a)
  const row = await byToken(token)
  return weddings.update(row.id, (d) => reducer(d, a))
}

// Signed in with Google: the couple sees everything; a helper sees only their side's families.
type Side = team.HelperSide

export function helperView(d: WeddingData, side: Side): WeddingData {
  if (!side) return d
  const households = d.households.filter((h) => seesFamily(side, h.side))
  const ids = new Set(households.map((h) => h.id))
  return { ...d, members: [], audit: [], households, guests: d.guests.filter((g) => ids.has(g.householdId)), allocations: d.allocations.filter((a) => ids.has(a.householdId)) }
}

export async function getAsMember(id: string, user: User): Promise<WeddingData> {
  const m = await membership(id, user)
  const row = await weddings.findById(id)
  if (!row) throw new AppError(404, 'This wedding isn’t in your account.')
  return m.role === 'OWNER' ? row.data : helperView(row.data, m.side)
}

export async function changeAsMember(id: string, user: User, a: Action): Promise<WeddingData> {
  validateCoupleAction(a)
  const m = await membership(id, user)
  // Checked inside the lock, against the wedding as it is right now.
  const data = await weddings.update(id, (d) => reducer(d, m.role === 'OWNER' ? a : validateHelperAction(d, m.side, a)))
  return m.role === 'OWNER' ? data : helperView(data, m.side)
}
