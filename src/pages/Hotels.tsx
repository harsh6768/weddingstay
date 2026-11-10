import { MapPin, Phone, Plus } from 'lucide-react'
import { BlockPill, PageHeader } from '../components/ui'
import { roomTypeNights, type NightCell } from '../lib/accommodation'
import { fmtDow, fmtRange, inr, nightsOf } from '../lib/dates'
import { useStore } from '../store'
import clsx from 'clsx'

export default function Hotels() {
  const { data } = useStore()
  const nights = nightsOf('2026-12-10', '2026-12-14')
  const totalEst = data.allocations.reduce((sum, a) => sum + (data.roomTypes.find((r) => r.id === a.roomTypeId)?.ratePerNight ?? 0) * nightsOf(a.checkIn, a.checkOut).length, 0)
  return (
    <>
      <PageHeader title="Hotels & rooms" subtitle="Record what each hotel has offered. Only rooms the hotel has held or confirmed count as available."
        actions={<button className="btn-primary"><Plus size={16} /> Add hotel</button>} />

      <div className="flex flex-col gap-5">
        {data.hotels.map((h) => {
          const types = data.roomTypes.filter((r) => r.hotelId === h.id)
          const blocks = data.blocks.filter((b) => b.hotelId === h.id)
          return (
            <section key={h.id} className="card overflow-hidden">
              <div className="flex flex-wrap items-start justify-between gap-3 p-4 md:p-5 border-b border-line">
                <div className="min-w-0">
                  <h2 className="font-display text-[21px] font-semibold">{h.name}</h2>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-muted">
                    <span className="flex items-center gap-1.5"><MapPin size={14} /> {h.area} · {h.distanceToVenue}</span>
                    <span className="flex items-center gap-1.5"><Phone size={14} /> {h.contactName}, <span className="num">{h.contactPhone}</span></span>
                  </div>
                </div>
                <div className="text-[12.5px] text-muted">Check-in {h.checkInTime} · Check-out {h.checkOutTime}</div>
              </div>

              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-[13.5px] min-w-[720px]">
                  <thead>
                    <tr>
                      <th className="th">Room type</th><th className="th">Block</th>
                      {nights.map((n) => <th key={n} className="th text-center">{fmtDow(n)}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {types.map((rt) => {
                      const cells = roomTypeNights(data, rt.id, nights)
                      const tb = blocks.filter((b) => b.roomTypeId === rt.id)
                      return (
                        <tr key={rt.id}>
                          <td className="td">
                            <div className="font-medium">{rt.name}</div>
                            <div className="text-[12px] text-muted">Sleeps {rt.maxOccupancy}{rt.extraBedCapacity ? ` +${rt.extraBedCapacity} extra bed` : ''} · {inr(rt.ratePerNight)}/night</div>
                          </td>
                          <td className="td">
                            {tb.map((b) => (
                              <div key={b.id} className="flex flex-col items-start gap-1">
                                <BlockPill s={b.status} />
                                <span className="text-[12px] text-muted num">{b.quantity} rooms · {fmtRange(b.startDate, b.endDate)}{b.confirmationRef ? ` · ${b.confirmationRef}` : ''}</span>
                              </div>
                            ))}
                          </td>
                          {cells.map((c) => <td key={c.night} className="td text-center"><Cell c={c} /></td>)}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              <ul className="md:hidden divide-y divide-line">
                {types.map((rt) => {
                  const cells = roomTypeNights(data, rt.id, nights)
                  const tb = blocks.filter((b) => b.roomTypeId === rt.id)
                  return (
                    <li key={rt.id} className="px-4 py-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-medium">{rt.name}</div>
                          <div className="text-[12.5px] text-muted">Sleeps {rt.maxOccupancy}{rt.extraBedCapacity ? ` +${rt.extraBedCapacity}` : ''}, {inr(rt.ratePerNight)} a night</div>
                        </div>
                        {tb[0] && <BlockPill s={tb[0].status} />}
                      </div>
                      {tb[0] && <div className="mt-1 text-[12px] text-muted num">{tb[0].quantity} rooms, {fmtRange(tb[0].startDate, tb[0].endDate)}{tb[0].confirmationRef ? `, ref ${tb[0].confirmationRef}` : ''}</div>}
                      <div className="mt-3 grid grid-cols-4 gap-1.5">
                        {cells.map((c) => (
                          <div key={c.night} className="min-w-0 text-center">
                            <div className="text-[11px] text-muted mb-1">{fmtDow(c.night).slice(0, 6)}</div>
                            <Cell c={c} compact />
                          </div>
                        ))}
                      </div>
                    </li>
                  )
                })}
              </ul>
            </section>
          )
        })}
      </div>

      <div className="mt-5 card p-4 flex flex-wrap items-center justify-between gap-3">
        <div><div className="eyebrow">Estimated room cost for allocated rooms</div><div className="mt-1 font-display text-[24px] font-semibold num">{inr(totalEst)}</div></div>
        <p className="text-[12.5px] text-muted max-w-[48ch]">Rate × nights for every allocated room, before taxes. Cells show allocated / available rooms per night; dashed cells are planned or requested and not yet held by the hotel.</p>
      </div>
    </>
  )
}

function Cell({ c, compact }: { c: NightCell; compact?: boolean }) {
  const offered = c.confirmed + c.held
  const box = compact ? 'w-full rounded-xl px-1 py-2' : 'mx-auto w-[84px] rounded-xl px-2 py-1.5'
  if (offered === 0 && c.pending === 0) return <div className={clsx(box, 'text-muted bg-sunk/60')}>—</div>
  if (offered === 0)
    return (
      <div className={clsx(box, 'border border-dashed border-line text-muted')}>
        <div className="font-semibold num text-[15px]">{c.allocated}/{c.pending}</div>
        <div className="text-[11px]">not held</div>
      </div>
    )
  return (
    <div className={clsx(box, c.free < 0 ? 'bg-bad/10 text-bad' : c.free === 0 ? 'bg-warn/10 text-warn' : 'bg-good/10 text-good')}>
      <div className="font-semibold num text-[15px]">{c.allocated}/{offered}</div>
      <div className="text-[11px]">{c.free < 0 ? `${-c.free} over` : c.free === 0 ? 'full' : `${c.free} free`}</div>
    </div>
  )
}
