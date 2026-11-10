import { describe, expect, it } from 'vitest'
import { sampleData } from '../data/sample'
import type { RoomAllocation } from '../data/types'
import { detectConflicts, roomTypeNights, validateAllocation } from './accommodation'
import { nightsOf } from './dates'

describe('nightsOf', () => {
  it('includes check-in and excludes check-out', () => {
    expect(nightsOf('2026-12-10', '2026-12-12')).toEqual(['2026-12-10', '2026-12-11'])
  })
})

describe('night-wise inventory', () => {
  it('counts only held and confirmed blocks as available', () => {
    const [n] = roomTypeNights(sampleData, 'rt_ft_twin', ['2026-12-12'])
    expect(n.confirmed + n.held).toBe(0)
    expect(n.pending).toBe(6)
  })
  it('subtracts allocations per night', () => {
    const [n11, n12] = roomTypeNights(sampleData, 'rt_ar_suite', ['2026-12-11', '2026-12-12'])
    expect(n11.confirmed).toBe(3)
    expect(n11.allocated).toBe(3)
    expect(n12.free).toBe(0)
  })
})

describe('conflict detection on sample data', () => {
  const c = detectConflicts(sampleData)
  it('flags the over-capacity room', () => expect(c.some((x) => x.kind === 'capacity' && x.householdId === 'h09')).toBe(true))
  it('flags a stay that changed after allocation', () => expect(c.some((x) => x.kind === 'dates' && x.householdId === 'h16')).toBe(true))
  it('warns when the room is only planned at the hotel', () => expect(c.some((x) => x.kind === 'unconfirmed' && x.householdId === 'h25')).toBe(true))
})

describe('validateAllocation', () => {
  const base: RoomAllocation = { id: 'new', hotelId: 'ht_aravali', roomTypeId: 'rt_ar_suite', householdId: 'h05', occupantIds: ['h05_g1'], checkIn: '2026-12-11', checkOut: '2026-12-14', extraBeds: 0, status: 'ASSIGNED', publishedToGuest: false }
  it('rejects a fourth suite when only three are confirmed', () => {
    expect(validateAllocation(sampleData, base).some((p) => p.kind === 'inventory')).toBe(true)
  })
  it('accepts a free deluxe room that fits', () => {
    expect(validateAllocation(sampleData, { ...base, roomTypeId: 'rt_ar_deluxe' })).toEqual([])
  })
  it('rejects a guest already in another room on the same night', () => {
    const p = validateAllocation(sampleData, { ...base, roomTypeId: 'rt_ar_deluxe', householdId: 'h01', occupantIds: ['h01_g1'] })
    expect(p.some((x) => x.kind === 'double-booked')).toBe(true)
  })
})
