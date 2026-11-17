// Plain-language helpers for the host screens. One place decides how a family's
// progress is described, so Home, Guests and Rooms always say the same thing.
import type { Household, RoomAllocation, Side, WeddingData } from '../data/types'
import { fmtDay } from './dates'

export const sideName: Record<Side, string> = { BRIDE: 'Bride’s side', GROOM: 'Groom’s side', MUTUAL: 'Both sides', OTHER: 'Friends' }
export const sideHint: Record<Side, string> = { BRIDE: 'Ladkiwale', GROOM: 'Ladkewale', MUTUAL: 'Common friends', OTHER: 'Other' }

export type ReplyState = 'not-sent' | 'waiting' | 'coming' | 'not-coming'

export function familyInfo(d: WeddingData, h: Household) {
  const people = d.guests.filter((g) => g.householdId === h.id)
  const coming = people.filter((g) => g.rsvp === 'YES' || g.rsvp === 'MAYBE')
  const reply: ReplyState = h.invitation === 'NOT_SENT' ? 'not-sent'
    : h.invitation === 'SENT' || h.invitation === 'STARTED' ? 'waiting'
    : coming.length > 0 ? 'coming' : 'not-coming'
  const needRoom = people.filter((g) => g.stay.needs === 'YES')
  const allocs = d.allocations.filter((a) => a.householdId === h.id)
  const placed = new Set(allocs.flatMap((a) => a.occupantIds))
  const waitingForRoom = needRoom.filter((g) => !placed.has(g.id))
  const contact = people.find((g) => g.id === h.primaryContactId) ?? people[0]
  return { people, coming, reply, needRoom, waitingForRoom, allocs, contact }
}

export const replyText: Record<ReplyState, string> = {
  'not-sent': 'Invite not sent',
  waiting: 'Waiting for reply',
  coming: 'Coming',
  'not-coming': 'Not coming',
}

/** Three simple stages for a room, instead of four statuses plus a separate "share" switch. */
export type RoomStage = 'given' | 'confirmed' | 'told'
export const roomStage = (a: RoomAllocation): RoomStage =>
  a.publishedToGuest || a.status === 'GUEST_NOTIFIED' ? 'told' : a.status === 'HOTEL_CONFIRMED' ? 'confirmed' : 'given'
export const roomStageText: Record<RoomStage, string> = { given: 'Waiting for hotel to confirm', confirmed: 'Hotel confirmed, tell the family', told: 'Family has the details' }

export const shortRange = (a: string, b: string) => `${fmtDay(a)} to ${fmtDay(b)}`

// ---- WhatsApp ----
/** A full link into this app, e.g. appLink('/g/abc'). The app uses hash routes, so it works on any host. */
export const appLink = (path: string) => `${location.origin}${location.pathname}#${path}`
export const linkFor = (householdId: string) => appLink(`/g/${householdId}`)
const first = (n: string) => n.split(' ')[0]
export const coupleName = (d: WeddingData) => `${first(d.wedding.brideName)} & ${first(d.wedding.groomName)}`

export function inviteText(d: WeddingData, h: Household) {
  const c = familyInfo(d, h).contact
  return `Namaste ${c ? c.firstName + ' ji' : ''}! 🙏\n\n${coupleName(d)} are getting married in ${d.wedding.city} (${shortRange(d.wedding.startDate, d.wedding.endDate)}) and we would love to have your family with us.\n\nPlease tell us who is coming and if you need a room, on this link. It takes 1 minute:\n${linkFor(h.id)}\n\nPlease reply by ${fmtDay(d.wedding.responseDeadline)}.`
}

export function reminderText(d: WeddingData, h: Household) {
  const c = familyInfo(d, h).contact
  return `Hi ${c ? c.firstName + ' ji' : ''}, a gentle reminder from ${coupleName(d)} 🙂 Please fill your reply by ${fmtDay(d.wedding.responseDeadline)} so we can book your rooms in ${d.wedding.city}:\n${linkFor(h.id)}`
}

export function stayText(d: WeddingData, h: Household) {
  const c = familyInfo(d, h).contact
  const rooms = d.allocations.filter((a) => a.householdId === h.id).map((a) => {
    const hotel = d.hotels.find((x) => x.id === a.hotelId)
    const rt = d.roomTypes.find((r) => r.id === a.roomTypeId)
    return `🏨 ${hotel?.name}, ${rt?.name}\n${shortRange(a.checkIn, a.checkOut)} (check-in ${hotel?.checkInTime})`
  }).join('\n\n')
  return `Hi ${c ? c.firstName + ' ji' : ''}! Your room for ${coupleName(d)}’s wedding is confirmed 🎉\n\n${rooms}\n\nFull details, map and schedule:\n${linkFor(h.id)}/stay`
}

export const waUrl = (phone: string | undefined, text: string) =>
  `https://wa.me/${phone ? phone.replace(/\D/g, '').replace(/^(\d{10})$/, '91$1') : ''}?text=${encodeURIComponent(text)}`
