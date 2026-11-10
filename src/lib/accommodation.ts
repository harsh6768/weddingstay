// Night-wise availability and conflict detection. Pure functions so they can move to the server unchanged.
import type { Guest, RoomAllocation, RoomBlock, RoomType, WeddingData } from '../data/types'
import { nightsOf, overlaps } from './dates'

/** Blocks that count as allocatable inventory. PLANNED and REQUESTED are reported separately. */
export const ALLOCATABLE = new Set(['HELD', 'CONFIRMED'])

export interface NightCell {
  night: string
  confirmed: number
  held: number
  pending: number // planned + requested: not yet promised by the hotel
  allocated: number
  free: number // confirmed + held - allocated (can be negative = oversubscribed)
}

export function blockRoomsOnNight(blocks: RoomBlock[], roomTypeId: string, night: string) {
  const c = { confirmed: 0, held: 0, pending: 0 }
  for (const b of blocks) {
    if (b.roomTypeId !== roomTypeId || !(b.startDate <= night && night < b.endDate)) continue
    if (b.status === 'CONFIRMED') c.confirmed += b.quantity
    else if (b.status === 'HELD') c.held += b.quantity
    else if (b.status === 'PLANNED' || b.status === 'REQUESTED') c.pending += b.quantity
  }
  return c
}

export function roomTypeNights(data: Pick<WeddingData, 'blocks' | 'allocations'>, roomTypeId: string, nights: string[]): NightCell[] {
  return nights.map((night) => {
    const c = blockRoomsOnNight(data.blocks, roomTypeId, night)
    const allocated = data.allocations.filter((a) => a.roomTypeId === roomTypeId && a.checkIn <= night && night < a.checkOut).length
    return { night, ...c, allocated, free: c.confirmed + c.held - allocated }
  })
}

/** Rooms guests need per night, estimated as ceil(people / 3) per household, and how many are allocated. */
export function demandByNight(data: WeddingData, nights: string[]) {
  return nights.map((night) => {
    const byHousehold = new Map<string, number>()
    for (const g of data.guests) {
      if (g.stay.needs !== 'YES' || !g.stay.checkIn || !g.stay.checkOut) continue
      if (g.stay.checkIn <= night && night < g.stay.checkOut) byHousehold.set(g.householdId, (byHousehold.get(g.householdId) ?? 0) + 1)
    }
    let needed = 0
    byHousehold.forEach((n) => (needed += Math.ceil(n / 3)))
    let supply = 0
    for (const rt of data.roomTypes) {
      const c = blockRoomsOnNight(data.blocks, rt.id, night)
      supply += c.confirmed + c.held
    }
    const allocated = data.allocations.filter((a) => a.checkIn <= night && night < a.checkOut).length
    return { night, needed, supply, allocated, shortfall: Math.max(0, needed - supply) }
  })
}

export type Severity = 'critical' | 'warning'
export interface Conflict {
  id: string
  severity: Severity
  kind: 'capacity' | 'inventory' | 'double-booked' | 'dates' | 'outside-block' | 'unconfirmed' | 'unallocated'
  title: string
  detail: string
  allocationId?: string
  householdId?: string
}

const people = (ids: string[], guests: Guest[]) => ids.map((id) => guests.find((g) => g.id === id)).filter(Boolean) as Guest[]

export function capacityOf(rt: RoomType, extraBeds: number) {
  return rt.maxOccupancy + Math.min(extraBeds, rt.extraBedCapacity)
}

export function detectConflicts(data: WeddingData): Conflict[] {
  const out: Conflict[] = []
  const hhName = (id: string) => data.households.find((h) => h.id === id)?.name ?? 'Unknown household'
  const rtOf = (a: RoomAllocation) => data.roomTypes.find((r) => r.id === a.roomTypeId)!
  const hotelName = (id: string) => data.hotels.find((h) => h.id === id)?.name ?? ''

  for (const a of data.allocations) {
    const rt = rtOf(a)
    const occ = people(a.occupantIds, data.guests)
    const cap = capacityOf(rt, a.extraBeds)
    if (occ.length > cap) {
      out.push({ id: `cap-${a.id}`, severity: 'critical', kind: 'capacity', allocationId: a.id, householdId: a.householdId,
        title: `${hhName(a.householdId)}: ${occ.length} people in a room for ${cap}`,
        detail: `${rt.name} at ${hotelName(a.hotelId)} sleeps ${rt.maxOccupancy}${rt.extraBedCapacity ? ` (+${rt.extraBedCapacity} extra bed)` : ', no extra beds'}. Split into two rooms or move to a larger room type.` })
    }
    // Stay outside the hotel block
    const covered = nightsOf(a.checkIn, a.checkOut).every((n) => data.blocks.some((b) => b.roomTypeId === a.roomTypeId && b.startDate <= n && n < b.endDate && b.status !== 'RELEASED'))
    if (!covered) {
      out.push({ id: `blk-${a.id}`, severity: 'critical', kind: 'outside-block', allocationId: a.id, householdId: a.householdId,
        title: `${hhName(a.householdId)}: stay is outside the ${rt.name} block`,
        detail: 'One or more nights are not covered by any room block at this hotel.' })
    }
    // Allocated against inventory the hotel has not promised
    const allPending = nightsOf(a.checkIn, a.checkOut).some((n) => {
      const c = blockRoomsOnNight(data.blocks, a.roomTypeId, n)
      return c.confirmed + c.held === 0 && c.pending > 0
    })
    if (allPending) {
      out.push({ id: `unc-${a.id}`, severity: 'warning', kind: 'unconfirmed', allocationId: a.id, householdId: a.householdId,
        title: `${hhName(a.householdId)}: room not yet held by ${hotelName(a.hotelId)}`,
        detail: `${rt.name} is only planned or requested. Don't tell the guest it's booked until the hotel holds or confirms it.` })
    }
    // Allocation dates vs what guests asked for
    const mismatch = occ.filter((g) => g.stay.needs === 'YES' && g.stay.checkIn && g.stay.checkOut && (a.checkIn < g.stay.checkIn || a.checkOut > g.stay.checkOut))
    if (mismatch.length) {
      const g = mismatch[0]
      out.push({ id: `dt-${a.id}`, severity: 'warning', kind: 'dates', allocationId: a.id, householdId: a.householdId,
        title: `${hhName(a.householdId)}: room dates no longer match their stay`,
        detail: `They now need ${g.stay.checkIn!.slice(8)} to ${g.stay.checkOut!.slice(8)} Dec, the room is booked ${a.checkIn.slice(8)} to ${a.checkOut.slice(8)} Dec. Shorten the room or confirm with the family.` })
    }
  }

  // Guest in two rooms on the same night
  const seen = new Map<string, RoomAllocation>()
  for (const a of data.allocations) {
    for (const gid of a.occupantIds) {
      const prev = seen.get(gid)
      if (prev && overlaps(prev.checkIn, prev.checkOut, a.checkIn, a.checkOut)) {
        const g = data.guests.find((x) => x.id === gid)
        out.push({ id: `dbl-${gid}-${a.id}`, severity: 'critical', kind: 'double-booked', allocationId: a.id, householdId: a.householdId,
          title: `${g?.firstName} ${g?.lastName} is in two rooms on the same night`, detail: 'Remove them from one of the rooms.' })
      }
      seen.set(gid, a)
    }
  }

  // Inventory oversubscribed on a night
  const allNights = [...new Set(data.allocations.flatMap((a) => nightsOf(a.checkIn, a.checkOut)))].sort()
  for (const rt of data.roomTypes) {
    for (const cell of roomTypeNights(data, rt.id, allNights)) {
      if (cell.allocated > 0 && cell.free < 0 && cell.confirmed + cell.held > 0) {
        out.push({ id: `inv-${rt.id}-${cell.night}`, severity: 'critical', kind: 'inventory',
          title: `${rt.name} at ${hotelName(rt.hotelId)} is over by ${-cell.free} on ${cell.night.slice(8)} Dec`,
          detail: `${cell.allocated} rooms allocated, ${cell.confirmed + cell.held} held or confirmed.` })
      }
    }
  }

  // Guests who asked for a room but have none
  const allocatedGuests = new Set(data.allocations.flatMap((a) => a.occupantIds))
  for (const h of data.households) {
    const waiting = data.guests.filter((g) => g.householdId === h.id && g.stay.needs === 'YES' && !allocatedGuests.has(g.id))
    if (waiting.length) {
      out.push({ id: `un-${h.id}`, severity: 'warning', kind: 'unallocated', householdId: h.id,
        title: `${h.name}: ${waiting.length} ${waiting.length === 1 ? 'guest needs' : 'guests need'} a room`,
        detail: `Requested ${waiting[0].stay.checkIn?.slice(8)} to ${waiting[0].stay.checkOut?.slice(8)} Dec. No room allocated yet.` })
    }
  }
  // One line per household and kind keeps the list readable.
  const seenKey = new Set<string>()
  return out.filter((c) => {
    const k = c.kind === 'unconfirmed' || c.kind === 'dates' ? `${c.kind}-${c.householdId}` : c.id
    if (seenKey.has(k)) return false
    seenKey.add(k)
    return true
  })
}

/** Validate a proposed allocation before saving it. Returns problems; empty means OK. */
export function validateAllocation(data: WeddingData, a: RoomAllocation): Conflict[] {
  const next = { ...data, allocations: [...data.allocations.filter((x) => x.id !== a.id), a] }
  return detectConflicts(next).filter((c) => c.kind !== 'unallocated' && (c.allocationId === a.id || c.kind === 'inventory' || c.kind === 'double-booked'))
    .filter((c) => !detectConflicts(data).some((old) => old.id === c.id))
}
