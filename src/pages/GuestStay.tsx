import { CheckCircle2, Clock, MapPin, Phone } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { fmtDow, fmtTime } from '../lib/dates'
import { useStore } from '../store'
import { GuestFrame, useRsvpDesign } from './GuestForm'
import { GoldDivider } from '../components/Ornaments'

export function GuestDone() {
  const { householdId = 'h02' } = useParams()
  const { search } = useRsvpDesign()
  const { data } = useStore()
  const h = data.households.find((x) => x.id === householdId)
  return (
    <GuestFrame>
      <div className="card p-6 text-center">
        <div className="text-[44px] leading-none text-plum" style={{ fontFamily: 'var(--names-font)' }}>Dhanyavaad</div>
        <GoldDivider className="mx-auto mt-2 h-6 w-[180px]" />
        <h1 className="mt-2 text-[30px] leading-tight">Thank you, we've got it</h1>
        <p className="mt-1 text-muted">Ananya &amp; Rohan can now see your family's reply. Open this same link anytime before 25 Nov to make changes.</p>
        <div className="mt-5 flex flex-col gap-2">
          <Link to={`/g/${householdId}/stay${search}`} className="btn-primary">See your stay and schedule</Link>
          <Link to={`/g/${householdId}${search}`} className="btn-ghost">Edit our reply</Link>
        </div>
      </div>
      <p className="mt-6 text-center text-[12px] text-muted"><Link to="/app/invitations" className="underline">See it on the couple's dashboard</Link> ({h?.name} now shows as responded)</p>
    </GuestFrame>
  )
}

export default function GuestStay() {
  const { householdId = 'h02' } = useParams()
  const { data } = useStore()
  const h = data.households.find((x) => x.id === householdId)
  const rooms = data.allocations.filter((a) => a.householdId === householdId && a.publishedToGuest)
  const pending = data.allocations.some((a) => a.householdId === householdId && !a.publishedToGuest)
  const members = data.guests.filter((g) => g.householdId === householdId)
  const fns = data.functions.filter((f) => f.isPublished)

  return (
    <GuestFrame>
      <h1 className="text-[30px] leading-tight mb-4 text-center">Your stay, {h?.name.replace(/ \(.*\)/, '')}</h1>
      {rooms.length === 0 ? (
        <div className="card p-5">
          <div className="flex items-center gap-2 font-semibold"><Clock size={18} className="text-warn" /> Your room isn't confirmed yet</div>
          <p className="mt-1 text-muted">{pending ? 'The couple has a room in mind and is waiting for the hotel to confirm it.' : 'The couple will share your hotel details here once the hotel confirms.'} We'll show it on this page as soon as it's ready.</p>
        </div>
      ) : rooms.map((a) => {
        const hotel = data.hotels.find((x) => x.id === a.hotelId)!
        const rt = data.roomTypes.find((r) => r.id === a.roomTypeId)!
        return (
          <div key={a.id} className="card overflow-hidden mb-4">
            <div className="px-5 py-3 bg-good/10 border-b border-good/20 text-good text-[13px] font-semibold flex items-center gap-2"><CheckCircle2 size={16} /> Confirmed by the hotel</div>
            <div className="p-5">
              <div className="font-head text-[24px] font-semibold leading-tight">{hotel.name}</div>
              <div className="text-muted">{rt.name}</div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-sunk p-3"><div className="eyebrow">Check-in</div><div className="mt-1 font-semibold">{fmtDow(a.checkIn)}</div><div className="text-[12.5px] text-muted">from {fmtTime(hotel.checkInTime)}</div></div>
                <div className="rounded-lg bg-sunk p-3"><div className="eyebrow">Check-out</div><div className="mt-1 font-semibold">{fmtDow(a.checkOut)}</div><div className="text-[12.5px] text-muted">by {fmtTime(hotel.checkOutTime)}</div></div>
              </div>
              <div className="mt-4 text-[13.5px]">For {a.occupantIds.map((id) => members.find((m) => m.id === id)?.firstName).join(', ')}</div>
              <div className="mt-4 flex flex-col gap-2 text-[13.5px]">
                <a className="flex items-center gap-2 text-plum font-medium" href={hotel.mapUrl} target="_blank" rel="noreferrer"><MapPin size={16} /> {hotel.address}</a>
                <div className="flex items-center gap-2 text-muted"><Phone size={16} /> Help: Vikram Malhotra, <span className="select-all num">+91 98290 00000</span></div>
              </div>
            </div>
          </div>
        )
      })}

      <div className="mt-8 text-center"><h2 className="text-[26px]">The celebrations</h2><GoldDivider className="mx-auto mt-1 h-6 w-[180px]" /></div>
      <ol className="card divide-y divide-line">
        {fns.map((f) => (
          <li key={f.id} className="p-4 flex gap-4 items-center">
            <div className="w-[60px] shrink-0 text-center border-r border-[rgb(var(--gold)/0.35)] pr-3">
              <div className="font-head text-[26px] font-semibold leading-none text-plum">{f.date.slice(8)}</div>
              <div className="text-[11px] uppercase tracking-[0.14em] text-muted mt-1">Dec</div>
            </div>
            <div className="min-w-0">
              <div className="font-head text-[20px] font-semibold leading-tight">{f.name}</div>
              <div className="text-[13px] text-muted">{fmtDow(f.date)}, {fmtTime(f.startTime)} · {f.venueName}</div>
              {f.dressCode && <div className="text-[12.5px] text-[rgb(var(--gold))] italic font-head">Dress: {f.dressCode}</div>}
            </div>
          </li>
        ))}
      </ol>
      <p className="mt-6 text-center text-[12px] text-muted"><Link to="/app/accommodation/rooming" className="underline">Back to rooming lists</Link> (prototype only)</p>
    </GuestFrame>
  )
}
