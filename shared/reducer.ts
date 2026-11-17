// The one place wedding data changes. Runs in the browser and, for saved weddings, on the server too,
// so both sides always agree on what an action does.
import { templateById } from './templates'
import { sampleData } from './sample'
import type { AllocationStatus, Guest, Hotel, Household, InvitationState, RoomAllocation, RoomBlock, RoomType, WeddingData, WeddingFunction } from './types'
import { addDays } from './dates'

/** Hard-to-guess id: guest links are /g/<household id>, so these must not be guessable. */
export const newId = (prefix = '') => prefix + Array.from(crypto.getRandomValues(new Uint8Array(12)), (b) => 'abcdefghijkmnpqrstuvwxyz23456789'[b % 32]).join('')

export type Action =
  | { type: 'allocation/add'; allocation: RoomAllocation; actor: string; note: string }
  | { type: 'allocation/remove'; id: string; actor: string; note: string }
  | { type: 'allocation/status'; id: string; status: AllocationStatus }
  | { type: 'allocation/publish'; householdId: string; published: boolean }
  | { type: 'invitation/state'; householdId: string; state: InvitationState }
  | { type: 'function/publish'; id: string; published: boolean }
  | { type: 'wedding/template'; id: string }
  | { type: 'guest/respond'; householdId: string; guests: Guest[]; /** The couple noted it (e.g. the family phoned), not the guest link. */ byCouple?: boolean }
  | { type: 'reset' }
  | { type: 'wedding/create'; brideName: string; groomName: string; city: string; venueName: string; startDate: string; endDate: string; functions: string[] }
  | { type: 'household/add'; household: Household; guests: Guest[] }
  | { type: 'function/add'; fn: WeddingFunction }
  | { type: 'hotel/add'; hotel: Hotel; roomTypes: RoomType[]; blocks: RoomBlock[] }

const now = () => new Date().toISOString()
const event = (actor: string, action: string, detail: string) => ({ id: `e${Math.random().toString(36).slice(2, 8)}`, at: now(), actor, action, detail })

export function reducer(s: WeddingData, a: Action): WeddingData {
  switch (a.type) {
    case 'allocation/add':
      return { ...s, allocations: [...s.allocations, a.allocation], audit: [event(a.actor, 'Room allocated', a.note), ...s.audit] }
    case 'allocation/remove':
      return { ...s, allocations: s.allocations.filter((x) => x.id !== a.id), audit: [event(a.actor, 'Room allocation removed', a.note), ...s.audit] }
    case 'allocation/status':
      return { ...s, allocations: s.allocations.map((x) => (x.id === a.id ? { ...x, status: a.status } : x)) }
    case 'allocation/publish':
      return {
        ...s,
        allocations: s.allocations.map((x) => (x.householdId === a.householdId ? { ...x, publishedToGuest: a.published } : x)),
        audit: [event('Ananya Iyer', a.published ? 'Stay details published' : 'Stay details hidden', s.households.find((h) => h.id === a.householdId)?.name ?? ''), ...s.audit],
      }
    case 'invitation/state':
      return { ...s, households: s.households.map((h) => (h.id === a.householdId ? { ...h, invitation: a.state, sentAt: h.sentAt ?? now().slice(0, 10) } : h)) }
    case 'wedding/template':
      return { ...s, wedding: { ...s.wedding, rsvpTemplate: a.id }, audit: [event('Ananya Iyer', 'RSVP design changed', templateById(a.id).name), ...s.audit] }
    case 'function/publish':
      return { ...s, functions: s.functions.map((f) => (f.id === a.id ? { ...f, isPublished: a.published } : f)) }
    case 'guest/respond': {
      const ids = new Set(a.guests.map((g) => g.id))
      const h = s.households.find((x) => x.id === a.householdId)!
      const was = h.invitation
      return {
        ...s,
        guests: [...s.guests.filter((g) => !ids.has(g.id)), ...a.guests],
        households: s.households.map((x) => (x.id === a.householdId ? { ...x, invitation: was === 'SUBMITTED' || was === 'UPDATED' ? 'UPDATED' : 'SUBMITTED', respondedAt: now().slice(0, 10) } : x)),
        audit: [event(a.byCouple ? 'You' : `${h.name} (guest link)`, a.byCouple ? `Reply noted for ${h.name}` : was === 'SUBMITTED' ? 'Response updated' : 'Response submitted', `${a.guests.length} people, ${a.guests.filter((g) => g.rsvp === 'YES').length} attending`), ...s.audit],
      }
    }
    case 'reset':
      return sampleData
    case 'wedding/create': {
      // A fresh, empty wedding: what a new couple sees right after signing up.
      const days = Math.max(1, Math.round((Date.parse(a.endDate) - Date.parse(a.startDate)) / 864e5) + 1)
      const functions: WeddingFunction[] = a.functions.map((name, i) => ({
        id: `f_new${i}`, name, date: addDays(a.startDate, Math.min(i, days - 1)), startTime: name === 'Haldi' ? '10:00' : '18:00', endTime: name === 'Haldi' ? '13:00' : '23:00',
        venueName: a.venueName || 'Venue to be decided', venueAddress: a.city, isPublished: true,
      }))
      return {
        ...s,
        wedding: { ...s.wedding, name: `${a.brideName.split(' ')[0]} & ${a.groomName.split(' ')[0]}`, brideName: a.brideName, groomName: a.groomName, city: a.city, venueName: a.venueName || a.city, startDate: a.startDate, endDate: a.endDate, responseDeadline: addDays(a.startDate, -14) },
        functions, households: [], guests: [], hotels: [], roomTypes: [], blocks: [], allocations: [],
        members: s.members.filter((m) => m.role === 'OWNER').slice(0, 1).map((m) => ({ ...m, name: a.brideName })),
        audit: [event(a.brideName, 'Wedding created', `${a.city}, ${a.functions.length} functions`)],
      }
    }
    case 'household/add':
      return { ...s, households: [...s.households, a.household], guests: [...s.guests, ...a.guests], audit: [event('You', 'Family added', a.household.name), ...s.audit] }
    case 'function/add':
      return { ...s, functions: [...s.functions, a.fn].sort((x, y) => (x.date + x.startTime).localeCompare(y.date + y.startTime)) }
    case 'hotel/add':
      return { ...s, hotels: [...s.hotels, a.hotel], roomTypes: [...s.roomTypes, ...a.roomTypes], blocks: [...s.blocks, ...a.blocks], audit: [event('You', 'Hotel added', a.hotel.name), ...s.audit] }
  }
}

