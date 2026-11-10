import { CheckCircle2, Clock, MapPin, Phone } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { fmtDow, fmtTime } from '../lib/dates'
import { useStore } from '../store'
import { GuestFrame } from './GuestForm'

export function GuestDone() {
  const { householdId = 'h02' } = useParams()
  const { data } = useStore()
  const h = data.households.find((x) => x.id === householdId)
  return (
    <GuestFrame>
      <div className="card p-6 text-center">
        <CheckCircle2 className="mx-auto text-good" size={36} />
        <h1 className="mt-3 font-display text-[24px] font-semibold">Thank you, we've got it</h1>
        <p className="mt-1 text-muted">Ananya &amp; Rohan can now see your family's reply. Open this same link anytime before 25 Nov to make changes.</p>
        <div className="mt-5 flex flex-col gap-2">
          <Link to={`/g/${householdId}/stay`} className="btn-primary">See your stay and schedule</Link>
          <Link to={`/g/${householdId}`} className="btn-ghost">Edit our reply</Link>
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
      <h1 className="font-display text-[24px] font-semibold mb-4">Your stay, {h?.name.replace(/ \(.*\)/, '')}</h1>
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
              <div className="font-display text-[21px] font-semibold">{hotel.name}</div>
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

      <h2 className="mt-6 mb-3 font-display text-[20px] font-semibold">Schedule</h2>
      <ol className="card divide-y divide-line">
        {fns.map((f) => (
          <li key={f.id} className="p-4">
            <div className="flex items-baseline justify-between gap-2"><div className="font-semibold">{f.name}</div><div className="text-[12.5px] text-muted">{fmtDow(f.date)}, {fmtTime(f.startTime)}</div></div>
            <div className="text-[13px] text-muted">{f.venueName}{f.dressCode ? ` · Dress: ${f.dressCode}` : ''}</div>
          </li>
        ))}
      </ol>
      <p className="mt-6 text-center text-[12px] text-muted"><Link to="/app/accommodation/rooming" className="underline">Back to rooming lists</Link> (prototype only)</p>
    </GuestFrame>
  )
}
