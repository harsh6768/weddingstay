// Checks on what each kind of link may send. Throws AppError(400) when something isn't allowed.
import type { Action } from '../../shared/reducer'
import type { Guest, WeddingData } from '../../shared/types'
import { AppError } from '../errors'

export type CreateWedding = Extract<Action, { type: 'wedding/create' }>

const isStr = (v: unknown, max = 120): v is string => typeof v === 'string' && v.length <= max
const isDate = (v: unknown) => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v)

// Everything a couple can do, except starting over (that's a new wedding) and the demo-only reset.
const coupleActions = new Set<string>(['allocation/add', 'allocation/remove', 'allocation/status', 'allocation/publish', 'invitation/state', 'function/publish', 'wedding/template', 'guest/respond', 'household/add', 'function/add', 'hotel/add'])

export function validateCreate(a: Action): CreateWedding {
  if (a.type !== 'wedding/create' || ![a.brideName, a.groomName, a.city].every((v) => isStr(v) && v.trim()) || !isStr(a.venueName) || !isDate(a.startDate) || !isDate(a.endDate)
    || !Array.isArray(a.functions) || !a.functions.length || a.functions.length > 20 || !a.functions.every((f) => isStr(f, 60))) throw new AppError(400, 'Please fill in all the details.')
  return a
}

export function validateCoupleAction(a: Action): Action {
  if (!coupleActions.has(a.type)) throw new AppError(400, 'That change isn’t allowed.')
  // A family's id is their guest link, so it must be hard to guess (see newId).
  if (a.type === 'household/add' && !(isStr(a.household?.id, 40) && a.household.id.length >= 12)) throw new AppError(400, 'That change isn’t allowed.')
  return a
}

/** A guest may only rewrite the people already in their own family. */
export function validateGuestReply(d: WeddingData, familyId: string, a: Action): Action {
  const mine = new Set(d.guests.filter((g) => g.householdId === familyId).map((g) => g.id))
  const ok = a.type === 'guest/respond' && !a.byCouple && a.householdId === familyId && Array.isArray(a.guests) && a.guests.length <= 40
    && a.guests.every((g: Guest) => g && mine.has(g.id) && g.householdId === familyId)
  if (!ok) throw new AppError(400, 'That reply couldn’t be saved.')
  return a
}
