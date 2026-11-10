import { Download, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AllocPill, PageHeader, Pill } from '../components/ui'
import { fmtRange } from '../lib/dates'
import { useStore } from '../store'

export default function Rooming() {
  const { data, dispatch } = useStore()
  const [hotelId, setHotelId] = useState(data.hotels[0].id)
  const hotel = data.hotels.find((h) => h.id === hotelId)!
  const list = data.allocations.filter((a) => a.hotelId === hotelId).sort((a, b) => a.roomTypeId.localeCompare(b.roomTypeId) || a.checkIn.localeCompare(b.checkIn))
  const guest = (id: string) => data.guests.find((g) => g.id === id)!

  return (
    <>
      <PageHeader title="Rooming lists" subtitle="Send each hotel its list, and share confirmed stay details with families when you're ready."
        actions={<button className="btn-primary"><Download size={16} /> Download {hotel.name} list (.xlsx)</button>} />

      <div className="flex gap-2 mb-4 overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap" role="tablist">
        {data.hotels.map((h) => (
          <button key={h.id} role="tab" aria-selected={h.id === hotelId} onClick={() => setHotelId(h.id)}
            className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 min-h-[40px] text-[13.5px] font-medium border ${h.id === hotelId ? 'bg-plum text-onplum border-plum' : 'bg-surface border-line text-muted'}`}>
            {h.name} <span className="num opacity-80">{data.allocations.filter((a) => a.hotelId === h.id).length}</span>
          </button>
        ))}
      </div>

      <ul className="md:hidden flex flex-col gap-3">
        {list.map((a, i) => {
          const occ = a.occupantIds.map(guest)
          const confirmed = a.status === 'HOTEL_CONFIRMED' || a.status === 'GUEST_NOTIFIED'
          return (
            <li key={a.id} className="card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[12px] text-muted num">Room {i + 1}</div>
                  <div className="font-medium">{data.roomTypes.find((r) => r.id === a.roomTypeId)?.name}{a.extraBeds ? ', +1 bed' : ''}</div>
                  <div className="text-[12.5px] text-muted num">{fmtRange(a.checkIn, a.checkOut)}</div>
                </div>
                <AllocPill s={a.status} />
              </div>
              <div className="mt-2 text-[13.5px]">{occ.map((g) => `${g.firstName} ${g.lastName}${g.type === 'CHILD' ? ' (child)' : ''}`).join(', ')}</div>
              {occ.find((g) => g.stay.special) && <div className="mt-1 text-[12.5px] text-muted">{occ.find((g) => g.stay.special)?.stay.special}</div>}
              <div className="mt-3">
                {a.publishedToGuest ? (
                  <button className="btn-ghost w-full !min-h-[44px]" onClick={() => dispatch({ type: 'allocation/publish', householdId: a.householdId, published: false })}><Eye size={15} /> Shared with family</button>
                ) : confirmed ? (
                  <button className="btn-primary w-full !min-h-[44px]" onClick={() => dispatch({ type: 'allocation/publish', householdId: a.householdId, published: true })}><EyeOff size={15} /> Share with family</button>
                ) : <div className="text-[12.5px] text-muted">Share once the hotel confirms</div>}
              </div>
            </li>
          )
        })}
      </ul>
      <div className="hidden md:block card overflow-x-auto">
        <table className="w-full text-[13.5px] min-w-[760px]">
          <thead><tr><th className="th">#</th><th className="th">Room type</th><th className="th">Guests</th><th className="th">Stay</th><th className="th">Notes</th><th className="th">Status</th><th className="th">Guest can see</th></tr></thead>
          <tbody>
            {list.map((a, i) => {
              const occ = a.occupantIds.map(guest)
              const confirmed = a.status === 'HOTEL_CONFIRMED' || a.status === 'GUEST_NOTIFIED'
              return (
                <tr key={a.id}>
                  <td className="td num text-muted">{i + 1}</td>
                  <td className="td">{data.roomTypes.find((r) => r.id === a.roomTypeId)?.name}{a.extraBeds ? <div className="text-[12px] text-muted">+1 extra bed</div> : null}</td>
                  <td className="td">{occ.map((g) => <div key={g.id}>{g.firstName} {g.lastName}{g.type === 'CHILD' ? <span className="text-muted"> (child)</span> : ''}</div>)}</td>
                  <td className="td num">{fmtRange(a.checkIn, a.checkOut)}</td>
                  <td className="td text-muted">{occ.find((g) => g.stay.special)?.stay.special ?? '—'}</td>
                  <td className="td"><AllocPill s={a.status} /></td>
                  <td className="td">
                    {a.publishedToGuest ? (
                      <button className="btn-ghost !min-h-[34px]" onClick={() => dispatch({ type: 'allocation/publish', householdId: a.householdId, published: false })}><Eye size={15} /> Shared</button>
                    ) : confirmed ? (
                      <button className="btn-ghost !min-h-[34px]" onClick={() => dispatch({ type: 'allocation/publish', householdId: a.householdId, published: true })}><EyeOff size={15} /> Share</button>
                    ) : <Pill>Wait for hotel</Pill>}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-[12.5px] text-muted">
        Families only see a room once the hotel has confirmed it and you share it. <Link to="/g/h02/stay" className="text-plum font-medium">Preview what the Subramanian family sees</Link>.
      </p>
    </>
  )
}
