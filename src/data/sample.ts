// Sample wedding used by the prototype. Every name, phone number and booking here is invented.
// Built deterministically so screenshots and tests are stable.
import type {
  Guest, Household, Hotel, Member, RoomAllocation, RoomBlock, RoomType, Rsvp, Side,
  WeddingData, WeddingFunction, TravelMode, InvitationState,
} from './types'

let seed = 20261211
const rand = () => {
  seed = (seed * 1664525 + 1013904223) % 4294967296
  return seed / 4294967296
}
const pick = <T,>(xs: T[]): T => xs[Math.floor(rand() * xs.length)]

const wedding = {
  id: 'w_ananya_rohan',
  name: 'Ananya & Rohan',
  brideName: 'Ananya Iyer',
  groomName: 'Rohan Malhotra',
  city: 'Udaipur',
  venueName: 'Aravali Lake Resort',
  startDate: '2026-12-11',
  endDate: '2026-12-13',
  timezone: 'Asia/Kolkata',
  responseDeadline: '2026-11-25',
}

const functions: WeddingFunction[] = [
  { id: 'f_mehendi', name: 'Mehendi', date: '2026-12-11', startTime: '16:00', endTime: '20:00', venueName: 'Lakeside Lawn', venueAddress: 'Aravali Lake Resort, Udaipur', dressCode: 'Greens and yellows', description: 'Mehendi, chaat counters and a dhol set at sunset.', isPublished: true },
  { id: 'f_haldi', name: 'Haldi', date: '2026-12-12', startTime: '10:00', endTime: '13:00', venueName: 'Courtyard', venueAddress: 'Aravali Lake Resort, Udaipur', dressCode: 'Yellow, clothes you can get messy', isPublished: true },
  { id: 'f_sangeet', name: 'Sangeet', date: '2026-12-12', startTime: '19:30', endTime: '23:30', venueName: 'Darbar Hall', venueAddress: 'Aravali Lake Resort, Udaipur', dressCode: 'Indo-western, sparkle welcome', description: 'Family performances followed by a DJ.', isPublished: true },
  { id: 'f_wedding', name: 'Wedding', date: '2026-12-13', startTime: '18:00', endTime: '23:00', venueName: 'Lakeside Lawn', venueAddress: 'Aravali Lake Resort, Udaipur', dressCode: 'Traditional', description: 'Baraat at 6 pm, pheras at 8 pm, dinner after.', isPublished: true },
  { id: 'f_brunch', name: 'Farewell brunch', date: '2026-12-14', startTime: '10:00', endTime: '12:00', venueName: 'Poolside', venueAddress: 'Aravali Lake Resort, Udaipur', isPublished: false },
]

const members: Member[] = [
  { id: 'm_ananya', name: 'Ananya Iyer', email: 'ananya@example.com', role: 'OWNER', status: 'ACTIVE' },
  { id: 'm_rohan', name: 'Rohan Malhotra', email: 'rohan@example.com', role: 'OWNER', status: 'ACTIVE' },
  { id: 'm_lakshmi', name: 'Lakshmi Iyer (bride’s mother)', email: 'lakshmi@example.com', role: 'COORDINATOR', side: 'BRIDE', status: 'ACTIVE' },
  { id: 'm_vikram', name: 'Vikram Malhotra (groom’s brother)', email: 'vikram@example.com', role: 'COORDINATOR', side: 'GROOM', status: 'ACTIVE' },
  { id: 'm_neha', name: 'Neha Kapoor (friend)', email: 'neha@example.com', role: 'COORDINATOR', side: 'MUTUAL', status: 'INVITED' },
]

// [household name, side, city, relationship, adults, children]
const specs: [string, Side, string, string, number, number][] = [
  ['Iyer family (Chennai)', 'BRIDE', 'Chennai', 'Bride’s grandparents', 2, 0],
  ['Subramanian family', 'BRIDE', 'Chennai', 'Bride’s uncle', 2, 2],
  ['Krishnan family', 'BRIDE', 'Bengaluru', 'Bride’s aunt', 2, 1],
  ['Raghavan family', 'BRIDE', 'Bengaluru', 'Bride’s cousin', 2, 0],
  ['Venkatesh family', 'BRIDE', 'Hyderabad', 'Family friends', 3, 0],
  ['Narayanan family', 'BRIDE', 'Mumbai', 'Bride’s uncle', 2, 2],
  ['Sundaram family', 'BRIDE', 'Pune', 'Bride’s aunt', 2, 1],
  ['Balaji family', 'BRIDE', 'Chennai', 'Neighbours', 2, 0],
  ['Ramesh family', 'BRIDE', 'Coimbatore', 'Bride’s cousin', 4, 1],
  ['Gopalan family', 'BRIDE', 'Chennai', 'Bride’s uncle', 2, 0],
  ['Mehta family', 'BRIDE', 'Ahmedabad', 'Father’s colleague', 2, 0],
  ['Pillai family', 'BRIDE', 'Kochi', 'Family friends', 2, 2],
  ['Malhotra family (Delhi)', 'GROOM', 'New Delhi', 'Groom’s grandparents', 2, 0],
  ['Khanna family', 'GROOM', 'New Delhi', 'Groom’s uncle', 2, 2],
  ['Arora family', 'GROOM', 'Gurugram', 'Groom’s aunt', 2, 1],
  ['Sethi family', 'GROOM', 'Chandigarh', 'Groom’s cousin', 3, 0],
  ['Kapoor family', 'GROOM', 'New Delhi', 'Groom’s uncle', 2, 2],
  ['Bhatia family', 'GROOM', 'Ludhiana', 'Groom’s aunt', 5, 1],
  ['Chopra family', 'GROOM', 'Jaipur', 'Family friends', 2, 0],
  ['Sharma family', 'GROOM', 'Udaipur', 'Groom’s cousin', 2, 1],
  ['Singhania family', 'GROOM', 'Udaipur', 'Family friends', 2, 0],
  ['Ahuja family', 'GROOM', 'Noida', 'Groom’s uncle', 2, 1],
  ['Grover family', 'GROOM', 'Mumbai', 'Father’s business partner', 2, 0],
  ['Saxena family', 'GROOM', 'Lucknow', 'Groom’s aunt', 2, 2],
  ['College friends (IIT Bombay)', 'MUTUAL', 'Mumbai', 'Friends', 4, 0],
  ['Office friends (Bengaluru)', 'MUTUAL', 'Bengaluru', 'Colleagues', 3, 0],
  ['School friends', 'MUTUAL', 'Pune', 'Friends', 2, 0],
  ['Desai family', 'MUTUAL', 'Udaipur', 'Neighbours', 2, 0],
  ['Fernandes family', 'MUTUAL', 'Goa', 'Friends', 2, 1],
  ['Rao family', 'BRIDE', 'Hyderabad', 'Mother’s colleague', 2, 0],
  ['Joshi family', 'GROOM', 'Indore', 'Groom’s cousin', 2, 1],
  ['Nair family', 'BRIDE', 'Thiruvananthapuram', 'Bride’s cousin', 2, 0],
]

const firstBride = ['Lakshmi', 'Meenakshi', 'Kavya', 'Priya', 'Divya', 'Shruti', 'Revathi', 'Sowmya', 'Aishwarya', 'Padma', 'Gayathri', 'Nandini']
const firstBrideM = ['Srinivasan', 'Karthik', 'Arvind', 'Ganesh', 'Ravi', 'Suresh', 'Venkat', 'Mahesh', 'Prakash', 'Sanjay', 'Hari', 'Bala']
const firstGroom = ['Simran', 'Neha', 'Pooja', 'Ritu', 'Anjali', 'Mansi', 'Kiran', 'Shalini', 'Jaspreet', 'Tanya', 'Rekha', 'Sonia']
const firstGroomM = ['Rajesh', 'Amit', 'Sandeep', 'Gurpreet', 'Manish', 'Rahul', 'Vivek', 'Harish', 'Deepak', 'Arjun', 'Kunal', 'Varun']
const kids = ['Aarav', 'Anika', 'Vihaan', 'Myra', 'Advik', 'Kiara', 'Ishaan', 'Saanvi', 'Reyansh', 'Aadhya', 'Kabir', 'Tara']
const dietary = ['Vegetarian', 'Vegetarian', 'Jain', 'Non-vegetarian', 'Non-vegetarian', 'Vegan']

const nights = { full: ['2026-12-11', '2026-12-14'], late: ['2026-12-12', '2026-12-14'], early: ['2026-12-10', '2026-12-14'], short: ['2026-12-12', '2026-12-13'] }

const households: Household[] = []
const guests: Guest[] = []

specs.forEach(([name, side, city, relationship, adults, children], i) => {
  const hid = `h${String(i + 1).padStart(2, '0')}`
  const surname = name.split(' ')[0].replace('College', 'Friends').replace('Office', 'Friends').replace('School', 'Friends')
  const local = city === 'Udaipur'
  // invitation progress: most submitted, some pending
  const r = rand()
  let invitation: InvitationState = 'SUBMITTED'
  if (i % 11 === 7) invitation = 'NOT_SENT'
  else if (i % 7 === 4) invitation = 'SENT'
  else if (i % 13 === 9) invitation = 'STARTED'
  else if (i === 22) invitation = 'DECLINED'
  else if (r < 0.18) invitation = 'UPDATED'
  const answered = invitation === 'SUBMITTED' || invitation === 'UPDATED' || invitation === 'DECLINED'
  const window = i === 8 ? nights.early : [2, 7, 26].includes(i) ? nights.late : i === 15 ? nights.short : nights.full
  const mode: TravelMode = ['Chennai', 'Bengaluru', 'Hyderabad', 'Kochi', 'Mumbai', 'Coimbatore', 'Thiruvananthapuram', 'Goa', 'Lucknow'].includes(city) ? 'FLIGHT' : local ? 'CAR' : pick(['TRAIN', 'FLIGHT', 'CAR'] as TravelMode[])
  const ids: string[] = []
  const femalePool = side === 'GROOM' ? firstGroom : firstBride
  const malePool = side === 'GROOM' ? firstGroomM : firstBrideM
  for (let a = 0; a < adults + children; a++) {
    const child = a >= adults
    const gid = `${hid}_g${a + 1}`
    ids.push(gid)
    const first = child ? pick(kids) : a % 2 === 0 ? pick(malePool) : pick(femalePool)
    let rsvp: Rsvp = 'PENDING'
    if (invitation === 'DECLINED') rsvp = 'NO'
    else if (answered) rsvp = rand() < 0.06 ? 'NO' : rand() < 0.08 ? 'MAYBE' : 'YES'
    else if (invitation === 'STARTED') rsvp = 'MAYBE'
    const attendance: Record<string, Rsvp> = {}
    for (const f of functions) {
      if (!f.isPublished) continue
      attendance[f.id] = rsvp === 'YES' ? (f.id === 'f_mehendi' && window === nights.late ? 'NO' : f.id === 'f_haldi' && rand() < 0.15 ? 'NO' : 'YES') : rsvp === 'NO' ? 'NO' : rsvp === 'MAYBE' ? 'MAYBE' : 'PENDING'
    }
    const needs = local || !answered || rsvp === 'NO' ? (answered && !local ? 'NO' : local ? 'NO' : 'UNSURE') : 'YES'
    guests.push({
      id: gid,
      householdId: hid,
      firstName: first,
      lastName: surname,
      phone: a === 0 ? `+91 98${String(10000000 + Math.floor(rand() * 89999999)).slice(0, 8)}` : undefined,
      email: a === 0 && rand() < 0.5 ? `${first.toLowerCase()}.${surname.toLowerCase()}@example.com` : undefined,
      type: child ? 'CHILD' : 'ADULT',
      side,
      relationship,
      tags: [
        ...(i === 0 || i === 12 ? ['Elderly', 'VIP'] : []),
        ...(child ? ['Child'] : []),
        ...(side === 'MUTUAL' && !local ? ['Friend'] : []),
      ],
      rsvp,
      attendance,
      stay: needs === 'YES' ? { needs: 'YES', checkIn: window[0], checkOut: window[1], special: i === 0 ? 'Ground floor, no stairs' : i === 12 ? 'Wheelchair access' : undefined } : { needs: needs as 'NO' | 'UNSURE' },
      travel: answered && rsvp !== 'NO'
        ? {
            departureCity: city,
            arrivalDate: window[0],
            arrivalTime: local ? undefined : pick(['09:40', '11:15', '13:30', '16:05', '18:50']),
            arrivalMode: mode,
            arrivalLocation: local ? undefined : mode === 'FLIGHT' ? 'Maharana Pratap Airport (UDR)' : mode === 'TRAIN' ? 'Udaipur City station' : 'By road',
            arrivalNumber: mode === 'FLIGHT' ? pick(['6E 2241', 'AI 471', '6E 5317', 'UK 621', 'SG 9135']) : mode === 'TRAIN' ? pick(['12963 Mewar Exp', '12991 Intercity', '20473 Chetak Exp']) : undefined,
            departureDate: window[1],
            departureTime: local ? undefined : pick(['11:30', '14:20', '17:45']),
          }
        : {},
      dietary: answered ? pick(dietary) : undefined,
    })
  }
  households.push({
    id: hid, name, side, city,
    coordinatorId: side === 'BRIDE' ? 'm_lakshmi' : side === 'GROOM' ? 'm_vikram' : undefined,
    primaryContactId: ids[0],
    invitation,
    sentAt: invitation === 'NOT_SENT' ? undefined : `2026-10-${String(20 + (i % 8)).padStart(2, '0')}`,
    respondedAt: answered ? `2026-11-${String(1 + (i % 9)).padStart(2, '0')}` : undefined,
  })
})

// A late change: the Sethi family now leaves a day early, after their room was allocated.
// (stay is already 12->13 via nights.short; the allocation below still runs to 14 Dec.)

const hotels: Hotel[] = [
  { id: 'ht_aravali', name: 'Aravali Lake Resort', area: 'Lake Pichola, west bank', address: 'Lake Road, Udaipur, Rajasthan 313001', mapUrl: 'https://maps.google.com/?q=Udaipur', contactName: 'Mr. Devendra Rathore (Sales)', contactPhone: '+91 94140 00000', checkInTime: '14:00', checkOutTime: '12:00', distanceToVenue: 'Venue hotel' },
  { id: 'ht_gulmohar', name: 'Haveli Gulmohar', area: 'Old City, Gangaur Ghat', address: 'Gangaur Ghat Marg, Udaipur 313001', mapUrl: 'https://maps.google.com/?q=Udaipur+old+city', contactName: 'Ms. Pallavi Shekhawat', contactPhone: '+91 94141 00000', checkInTime: '13:00', checkOutTime: '11:00', distanceToVenue: '12 min drive' },
  { id: 'ht_fateh', name: 'Fateh Garden Inn', area: 'Fateh Sagar', address: 'Rani Road, Udaipur 313004', mapUrl: 'https://maps.google.com/?q=Fateh+Sagar+Udaipur', contactName: 'Front office', contactPhone: '+91 94142 00000', checkInTime: '12:00', checkOutTime: '11:00', distanceToVenue: '20 min drive' },
]

const roomTypes: RoomType[] = [
  { id: 'rt_ar_deluxe', hotelId: 'ht_aravali', name: 'Deluxe Lake View', maxOccupancy: 3, standardAdults: 2, extraBedCapacity: 1, ratePerNight: 9500 },
  { id: 'rt_ar_suite', hotelId: 'ht_aravali', name: 'Family Suite', maxOccupancy: 4, standardAdults: 3, extraBedCapacity: 1, ratePerNight: 18000 },
  { id: 'rt_gm_heritage', hotelId: 'ht_gulmohar', name: 'Heritage Room', maxOccupancy: 3, standardAdults: 2, extraBedCapacity: 0, ratePerNight: 6200 },
  { id: 'rt_gm_family', hotelId: 'ht_gulmohar', name: 'Family Room', maxOccupancy: 4, standardAdults: 3, extraBedCapacity: 1, ratePerNight: 8400 },
  { id: 'rt_ft_twin', hotelId: 'ht_fateh', name: 'Standard Twin', maxOccupancy: 2, standardAdults: 2, extraBedCapacity: 1, ratePerNight: 4100 },
]

const blocks: RoomBlock[] = [
  { id: 'b1', hotelId: 'ht_aravali', roomTypeId: 'rt_ar_deluxe', startDate: '2026-12-11', endDate: '2026-12-14', quantity: 16, status: 'CONFIRMED', confirmationRef: 'ALR/WED/1182' },
  { id: 'b2', hotelId: 'ht_aravali', roomTypeId: 'rt_ar_suite', startDate: '2026-12-11', endDate: '2026-12-14', quantity: 3, status: 'CONFIRMED', confirmationRef: 'ALR/WED/1182' },
  { id: 'b3', hotelId: 'ht_gulmohar', roomTypeId: 'rt_gm_heritage', startDate: '2026-12-11', endDate: '2026-12-14', quantity: 8, status: 'HELD', confirmationRef: 'HG-HOLD-77' },
  { id: 'b4', hotelId: 'ht_gulmohar', roomTypeId: 'rt_gm_family', startDate: '2026-12-12', endDate: '2026-12-14', quantity: 3, status: 'REQUESTED' },
  { id: 'b5', hotelId: 'ht_fateh', roomTypeId: 'rt_ft_twin', startDate: '2026-12-12', endDate: '2026-12-14', quantity: 6, status: 'PLANNED' },
]

// Pre-made allocations for a realistic mid-planning state. Some households are left unallocated on purpose.
const allocations: RoomAllocation[] = []
let aid = 1
const alloc = (householdId: string, roomTypeId: string, occupantIds: string[], checkIn: string, checkOut: string, status: RoomAllocation['status'], extraBeds = 0, publishedToGuest = false) => {
  const rt = roomTypes.find((r) => r.id === roomTypeId)!
  allocations.push({ id: `a${aid++}`, hotelId: rt.hotelId, roomTypeId, householdId, occupantIds, checkIn, checkOut, extraBeds, status, publishedToGuest })
}
const g = (h: string, n: number[]) => n.map((x) => `${h}_g${x}`)
alloc('h01', 'rt_ar_deluxe', g('h01', [1, 2]), '2026-12-11', '2026-12-14', 'GUEST_NOTIFIED', 0, true)
alloc('h02', 'rt_ar_suite', g('h02', [1, 2, 3, 4]), '2026-12-11', '2026-12-14', 'HOTEL_CONFIRMED', 0, true)
alloc('h04', 'rt_ar_deluxe', g('h04', [1, 2]), '2026-12-11', '2026-12-14', 'HOTEL_CONFIRMED', 0, true)
alloc('h06', 'rt_ar_suite', g('h06', [1, 2, 3, 4]), '2026-12-11', '2026-12-14', 'SENT_TO_HOTEL')
alloc('h13', 'rt_ar_deluxe', g('h13', [1, 2]), '2026-12-11', '2026-12-14', 'GUEST_NOTIFIED', 0, true)
alloc('h14', 'rt_ar_suite', g('h14', [1, 2, 3, 4]), '2026-12-11', '2026-12-14', 'HOTEL_CONFIRMED', 0, true)
alloc('h15', 'rt_ar_deluxe', g('h15', [1, 2, 3]), '2026-12-11', '2026-12-14', 'ASSIGNED', 1)
alloc('h16', 'rt_ar_deluxe', g('h16', [1, 2, 3]), '2026-12-12', '2026-12-14', 'ASSIGNED', 1) // stay changed to 12->13
alloc('h18', 'rt_gm_heritage', g('h18', [1, 2, 3]), '2026-12-11', '2026-12-14', 'ASSIGNED')
alloc('h18', 'rt_gm_heritage', g('h18', [4, 5, 6]), '2026-12-11', '2026-12-14', 'ASSIGNED') // 3 incl. child, ok
alloc('h09', 'rt_gm_heritage', g('h09', [1, 2, 3, 4]), '2026-12-11', '2026-12-14', 'ASSIGNED') // over capacity (4 in a 3)
alloc('h25', 'rt_ft_twin', g('h25', [1, 2]), '2026-12-12', '2026-12-14', 'ASSIGNED') // planned block only
alloc('h25', 'rt_ft_twin', g('h25', [3, 4]), '2026-12-12', '2026-12-14', 'ASSIGNED')
alloc('h03', 'rt_ar_deluxe', g('h03', [1, 2, 3]), '2026-12-12', '2026-12-14', 'SENT_TO_HOTEL', 1)

const audit = [
  { id: 'e1', at: '2026-11-09T18:42:00Z', actor: 'Sethi family (guest link)', action: 'Stay dates changed', detail: 'Check-out moved from 14 Dec to 13 Dec. Their Deluxe room still runs to 14 Dec.' },
  { id: 'e2', at: '2026-11-09T11:05:00Z', actor: 'Ananya Iyer', action: 'Room allocated', detail: 'Ramesh family: 4 guests to a Heritage Room at Haveli Gulmohar.' },
  { id: 'e3', at: '2026-11-08T16:20:00Z', actor: 'Rohan Malhotra', action: 'Room block updated', detail: 'Aravali Lake Resort Deluxe Lake View: 18 to 16 rooms, confirmed by hotel (ALR/WED/1182).' },
  { id: 'e4', at: '2026-11-08T09:12:00Z', actor: 'Vikram Malhotra', action: 'Household edited', detail: 'Bhatia family: added 2 members (now 6).' },
  { id: 'e5', at: '2026-11-07T14:30:00Z', actor: 'Lakshmi Iyer', action: 'Response entered on behalf of guest', detail: 'Iyer family (Chennai): RSVP yes for all functions, taken over the phone.' },
  { id: 'e6', at: '2026-11-06T10:00:00Z', actor: 'Ananya Iyer', action: 'Guest list imported', detail: 'guests-final-v3.xlsx: 118 rows, 112 created, 4 duplicates skipped, 2 rows fixed.' },
]

export const sampleData: WeddingData = { wedding, functions, members, households, guests, hotels, roomTypes, blocks, allocations, audit }
