// The guest's side: one family reads its invite and sends its reply.
import { reducer, type Action } from '../../shared/reducer'
import type { WeddingData } from '../../shared/types'
import { AppError } from '../errors'
import * as weddings from '../repositories/weddingRepository'
import { validateGuestReply } from '../validators/actions'

/** What a family's link may see: their own people, the published schedule, and their own rooms. */
export function guestView(d: WeddingData, familyId: string): WeddingData {
  const allocations = d.allocations.filter((a) => a.householdId === familyId)
  const shown = allocations.filter((a) => a.publishedToGuest)
  return {
    ...d,
    members: [], audit: [], blocks: [],
    functions: d.functions.filter((f) => f.isPublished),
    households: d.households.filter((h) => h.id === familyId),
    guests: d.guests.filter((g) => g.householdId === familyId),
    allocations,
    hotels: d.hotels.filter((h) => shown.some((a) => a.hotelId === h.id)),
    roomTypes: d.roomTypes.filter((r) => shown.some((a) => a.roomTypeId === r.id)),
  }
}

async function byFamily(familyId: string) {
  const row = await weddings.findByFamilyId(familyId)
  if (!row) throw new AppError(404, 'This invite link is no longer active.')
  return row
}

export const getInvite = async (familyId: string) => guestView((await byFamily(familyId)).data, familyId)

export async function sendReply(familyId: string, a: Action): Promise<WeddingData> {
  const row = await byFamily(familyId)
  validateGuestReply(row.data, familyId, a)
  // Checked again inside the lock, in case the couple changed the family meanwhile.
  return guestView(await weddings.update(row.id, (d) => reducer(d, validateGuestReply(d, familyId, a))), familyId)
}
