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

/** A helper for one side sees that side's families and those shared by both. null = the whole wedding. */
export const seesFamily = (side: 'BRIDE' | 'GROOM' | null, familySide: string) => !side || familySide === side || familySide === 'MUTUAL'

// Helpers add guests and give rooms; the couple keeps the functions and the invite design.
const ownerOnly = new Set<string>(['function/add', 'function/publish', 'wedding/template'])

/** What a signed-in helper may change: only families on their side. */
export function validateHelperAction(d: WeddingData, side: 'BRIDE' | 'GROOM' | null, a: Action): Action {
  const no = () => new AppError(403, 'Only the couple can make that change.')
  if (ownerOnly.has(a.type)) throw no()
  const familyId =
    a.type === 'household/add' ? a.household.id
    : a.type === 'guest/respond' || a.type === 'invitation/state' || a.type === 'allocation/publish' ? a.householdId
    : a.type === 'allocation/add' ? a.allocation.householdId
    : a.type === 'allocation/remove' || a.type === 'allocation/status' ? d.allocations.find((x) => x.id === a.id)?.householdId
    : undefined
  if (a.type === 'hotel/add') return a
  if (!familyId) throw no()
  const owner = (gid: string) => d.guests.find((g) => g.id === gid)?.householdId
  if (a.type === 'household/add') {
    // A new family on their own side, with new people only.
    if (!seesFamily(side, a.household.side) || d.households.some((h) => h.id === familyId) || !a.guests.every((g) => g.householdId === familyId && !owner(g.id))) throw no()
    return a
  }
  const family = d.households.find((h) => h.id === familyId)
  if (!family || !seesFamily(side, family.side)) throw no()
  // A reply may only touch that family's own people (or add new ones to it).
  if (a.type === 'guest/respond' && !a.guests.every((g) => g.householdId === familyId && (owner(g.id) ?? familyId) === familyId)) throw no()
  return a
}
