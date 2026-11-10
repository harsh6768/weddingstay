import type { WeddingData } from '../data/types'

export function guestStats(d: WeddingData) {
  const g = d.guests
  const count = (f: (x: (typeof g)[number]) => boolean) => g.filter(f).length
  const allocated = new Set(d.allocations.flatMap((a) => a.occupantIds))
  const published = new Set(d.allocations.filter((a) => a.publishedToGuest).flatMap((a) => a.occupantIds))
  const needsRoom = g.filter((x) => x.stay.needs === 'YES')
  return {
    invited: g.length,
    households: d.households.length,
    yes: count((x) => x.rsvp === 'YES'),
    no: count((x) => x.rsvp === 'NO'),
    maybe: count((x) => x.rsvp === 'MAYBE'),
    pending: count((x) => x.rsvp === 'PENDING'),
    outstation: count((x) => d.households.find((h) => h.id === x.householdId)?.city !== d.wedding.city),
    needsRoom: needsRoom.length,
    unsureRoom: count((x) => x.stay.needs === 'UNSURE'),
    missingArrival: count((x) => x.rsvp === 'YES' && x.stay.needs === 'YES' && !x.travel.arrivalDate),
    unallocated: needsRoom.filter((x) => !allocated.has(x.id)).length,
    allocatedNotSent: needsRoom.filter((x) => allocated.has(x.id) && !published.has(x.id)).length,
    pendingHouseholds: d.households.filter((h) => ['NOT_SENT', 'SENT', 'STARTED'].includes(h.invitation)).length,
  }
}

export function functionHeadcount(d: WeddingData, functionId: string) {
  let yes = 0, maybe = 0, no = 0, pending = 0
  for (const g of d.guests) {
    const r = g.attendance[functionId] ?? 'PENDING'
    if (r === 'YES') yes++
    else if (r === 'MAYBE') maybe++
    else if (r === 'NO') no++
    else pending++
  }
  return { yes, maybe, no, pending }
}

export const sideLabel = { BRIDE: 'Bride side', GROOM: 'Groom side', MUTUAL: 'Mutual', OTHER: 'Other' } as const
