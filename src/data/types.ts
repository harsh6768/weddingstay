// Front-end types that mirror the draft Prisma schema (docs/schema.prisma).
// Dates are ISO strings: 'YYYY-MM-DD' for date-only fields.

export type Side = 'BRIDE' | 'GROOM' | 'MUTUAL' | 'OTHER'
export type GuestType = 'ADULT' | 'CHILD'
export type Rsvp = 'YES' | 'NO' | 'MAYBE' | 'PENDING'
export type NeedsRoom = 'YES' | 'NO' | 'UNSURE'
export type TravelMode = 'FLIGHT' | 'TRAIN' | 'BUS' | 'CAR' | 'OTHER'
export type InvitationState = 'NOT_SENT' | 'SENT' | 'STARTED' | 'SUBMITTED' | 'UPDATED' | 'DECLINED'
export type BlockStatus = 'PLANNED' | 'REQUESTED' | 'HELD' | 'CONFIRMED' | 'RELEASED'
export type AllocationStatus = 'ASSIGNED' | 'SENT_TO_HOTEL' | 'HOTEL_CONFIRMED' | 'GUEST_NOTIFIED'

export interface Wedding {
  id: string
  name: string
  brideName: string
  groomName: string
  city: string
  venueName: string
  startDate: string
  endDate: string
  timezone: string
  responseDeadline: string
}

export interface WeddingFunction {
  id: string
  name: string
  date: string
  startTime: string
  endTime: string
  venueName: string
  venueAddress: string
  dressCode?: string
  description?: string
  isPublished: boolean
}

export interface Member {
  id: string
  name: string
  email: string
  role: 'OWNER' | 'COORDINATOR'
  side?: Side
  status: 'ACTIVE' | 'INVITED'
}

export interface Household {
  id: string
  name: string
  side: Side
  city: string
  coordinatorId?: string
  primaryContactId: string
  invitation: InvitationState
  sentAt?: string
  respondedAt?: string
}

export interface StayRequirement {
  needs: NeedsRoom
  checkIn?: string
  checkOut?: string
  special?: string
}

export interface TravelDetail {
  departureCity?: string
  arrivalDate?: string
  arrivalTime?: string
  arrivalMode?: TravelMode
  arrivalLocation?: string
  arrivalNumber?: string
  departureDate?: string
  departureTime?: string
}

export interface Guest {
  id: string
  householdId: string
  firstName: string
  lastName: string
  phone?: string
  email?: string
  type: GuestType
  side: Side
  relationship: string
  tags: string[]
  rsvp: Rsvp
  attendance: Record<string, Rsvp> // functionId -> response
  stay: StayRequirement
  travel: TravelDetail
  dietary?: string
}

export interface Hotel {
  id: string
  name: string
  area: string
  address: string
  mapUrl: string
  contactName: string
  contactPhone: string
  checkInTime: string
  checkOutTime: string
  distanceToVenue: string
}

export interface RoomType {
  id: string
  hotelId: string
  name: string
  maxOccupancy: number
  standardAdults: number
  extraBedCapacity: number
  ratePerNight: number // INR
}

export interface RoomBlock {
  id: string
  hotelId: string
  roomTypeId: string
  startDate: string // first night
  endDate: string // checkout day (exclusive)
  quantity: number
  status: BlockStatus
  confirmationRef?: string
}

export interface RoomAllocation {
  id: string
  hotelId: string
  roomTypeId: string
  householdId: string
  occupantIds: string[]
  checkIn: string
  checkOut: string
  extraBeds: number
  status: AllocationStatus
  publishedToGuest: boolean
  overrideReason?: string
}

export interface AuditEvent {
  id: string
  at: string // ISO timestamp
  actor: string
  action: string
  detail: string
}

export interface WeddingData {
  wedding: Wedding
  functions: WeddingFunction[]
  members: Member[]
  households: Household[]
  guests: Guest[]
  hotels: Hotel[]
  roomTypes: RoomType[]
  blocks: RoomBlock[]
  allocations: RoomAllocation[]
  audit: AuditEvent[]
}
