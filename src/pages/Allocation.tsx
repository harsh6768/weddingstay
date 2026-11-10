import clsx from 'clsx'
import { AlertOctagon, AlertTriangle, BedDouble, CheckCircle2, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Empty, PageHeader, Pill } from '../components/ui'
import type { AllocationStatus, Household, RoomAllocation } from '../data/types'
import { capacityOf, detectConflicts, roomTypeNights, validateAllocation } from '../lib/accommodation'
import { fmtRange, nightsOf } from '../lib/dates'
import { sideLabel } from '../lib/stats'
import { useStore } from '../store'

export default function Allocation() {
  const { data, dispatch } = useStore()
  const conflicts = detectConflicts(data)
  const allocated = new Set(data.allocations.flatMap((a) => a.occupantIds))
  const waiting = data.households
    .map((h) => ({ h, people: data.guests.filter((g) => g.householdId === h.id && g.stay.needs === 'YES' && !allocated.has(g.id)) }))
    .filter((x) => x.people.length > 0)
  const [selected, setSelected] = useState<string | null>(waiting[0]?.h.id ?? null)
  const sel = waiting.find((w) => w.h.id === selected) ?? waiting[0]
  const issues = conflicts.filter((c) => c.kind !== 'unallocated')

  return (
    <>
      <PageHeader title="Room allocation" subtitle="Assign families to rooms. Every change is checked against room capacity, the family's dates and each hotel's rooms per night. Nothing moves another family automatically." />

      {issues.length > 0 && (
        <section className="card mb-5">
          <div className="px-4 py-3 border-b border-line flex items-center justify-between"><h2 className="font-semibold">Conflicts to resolve</h2><span className="text-[12.5px] text-muted">{issues.filter((c) => c.severity === 'critical').length} serious · {issues.filter((c) => c.severity === 'warning').length} warnings</span></div>
          <ul className="divide-y divide-line">
            {issues.map((c) => (
              <li key={c.id} className="flex gap-3 px-4 py-3">
                {c.severity === 'critical' ? <AlertOctagon size={17} className="text-bad mt-0.5 shrink-0" /> : <AlertTriangle size={17} className="text-warn mt-0.5 shrink-0" />}
                <div className="min-w-0"><div className="font-medium text-[13.5px]">{c.title}</div><div className="text-[12.5px] text-muted">{c.detail}</div></div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[320px_1fr]">
        <section className="card self-start">
          <div className="px-4 py-3 border-b border-line"><h2 className="font-semibold">Waiting for a room <span className="text-muted font-normal num">({waiting.length} families)</span></h2></div>
          {waiting.length === 0 ? <Empty icon={<CheckCircle2 />} title="Everyone who asked has a room" body="New requests from guest links will appear here." /> : (
            <ul className="p-2 max-h-[520px] overflow-y-auto">
              {waiting.map(({ h, people }) => (
                <li key={h.id}>
                  <button onClick={() => setSelected(h.id)} className={clsx('w-full text-left rounded-lg px-3 py-2.5', sel?.h.id === h.id ? 'bg-plumsoft' : 'hover:bg-sunk')}>
                    <div className="flex justify-between gap-2"><span className="font-medium">{h.name}</span><span className="num text-[13px] text-muted">{people.length}</span></div>
                    <div className="text-[12px] text-muted">{fmtRange(people[0].stay.checkIn!, people[0].stay.checkOut!)} · {sideLabel[h.side]}{people.some((p) => p.stay.special) ? ' · special needs' : ''}</div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="flex flex-col gap-5 min-w-0">
          {sel && <AssignPanel key={sel.h.id} household={sel.h} peopleIds={sel.people.map((p) => p.id)} />}

          <section className="card">
            <div className="px-4 py-3 border-b border-line"><h2 className="font-semibold">Allocated rooms <span className="text-muted font-normal num">({data.allocations.length})</span></h2></div>
            <div className="overflow-x-auto">
              <table className="w-full text-[13.5px] min-w-[680px]">
                <thead><tr><th className="th">Family</th><th className="th">Room</th><th className="th">Nights</th><th className="th">People</th><th className="th">Status</th><th className="th" aria-label="Actions" /></tr></thead>
                <tbody>
                  {data.allocations.map((a) => {
                    const flagged = conflicts.filter((c) => c.allocationId === a.id)
                    const rt = data.roomTypes.find((r) => r.id === a.roomTypeId)!
                    return (
                      <tr key={a.id}>
                        <td className="td"><div className="font-medium flex items-center gap-1.5">{flagged.some((f) => f.severity === 'critical') ? <AlertOctagon size={14} className="text-bad" /> : flagged.length ? <AlertTriangle size={14} className="text-warn" /> : null}{data.households.find((h) => h.id === a.householdId)?.name}</div></td>
                        <td className="td">{rt.name}<div className="text-[12px] text-muted">{data.hotels.find((h) => h.id === a.hotelId)?.name}</div></td>
                        <td className="td num">{fmtRange(a.checkIn, a.checkOut)}</td>
                        <td className="td num">{a.occupantIds.length}/{capacityOf(rt, a.extraBeds)}{a.extraBeds ? <span className="text-muted"> (+bed)</span> : ''}</td>
                        <td className="td">
                          <select id={`st-${a.id}`} aria-label="Allocation status" className="input !min-h-[34px] !py-1 !text-[13px] !w-auto" value={a.status}
                            onChange={(e) => dispatch({ type: 'allocation/status', id: a.id, status: e.target.value as AllocationStatus })}>
                            <option value="ASSIGNED">Assigned by you</option><option value="SENT_TO_HOTEL">Sent to hotel</option><option value="HOTEL_CONFIRMED">Hotel confirmed</option><option value="GUEST_NOTIFIED">Guest notified</option>
                          </select>
                        </td>
                        <td className="td text-right">
                          <button className="btn-ghost !min-h-[34px] !px-2" aria-label="Remove allocation"
                            onClick={() => dispatch({ type: 'allocation/remove', id: a.id, actor: 'Ananya Iyer', note: `${data.households.find((h) => h.id === a.householdId)?.name}: removed from ${rt.name}` })}>
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </div>
    </>
  )
}

function AssignPanel({ household, peopleIds }: { household: Household; peopleIds: string[] }) {
  const { data, dispatch } = useStore()
  const people = data.guests.filter((g) => peopleIds.includes(g.id))
  const [roomTypeId, setRoomTypeId] = useState(data.roomTypes[0].id)
  const [occ, setOcc] = useState<string[]>(people.slice(0, 3).map((p) => p.id))
  const [extra, setExtra] = useState(0)
  const [checkIn, setCheckIn] = useState(people[0].stay.checkIn!)
  const [checkOut, setCheckOut] = useState(people[0].stay.checkOut!)
  const [reason, setReason] = useState('')
  const rt = data.roomTypes.find((r) => r.id === roomTypeId)!

  const draft: RoomAllocation = { id: 'draft', hotelId: rt.hotelId, roomTypeId, householdId: household.id, occupantIds: occ, checkIn, checkOut, extraBeds: extra, status: 'ASSIGNED', publishedToGuest: false }
  const problems = useMemo(() => (occ.length && checkOut > checkIn ? validateAllocation(data, draft) : []), [data, roomTypeId, occ, extra, checkIn, checkOut]) // eslint-disable-line react-hooks/exhaustive-deps
  const critical = problems.filter((p) => p.severity === 'critical')
  const invalidDates = checkOut <= checkIn
  const canSave = occ.length > 0 && !invalidDates && (critical.length === 0 || reason.trim().length >= 5)
  const nights = nightsOf(checkIn, checkOut > checkIn ? checkOut : checkIn)
  const avail = roomTypeNights(data, roomTypeId, nights)

  const save = () => {
    dispatch({ type: 'allocation/add', actor: 'Ananya Iyer', note: `${household.name}: ${occ.length} guests to ${rt.name}, ${data.hotels.find((h) => h.id === rt.hotelId)?.name}${critical.length ? ` (override: ${reason})` : ''}`,
      allocation: { ...draft, id: `a${Date.now()}`, overrideReason: critical.length ? reason : undefined } })
  }

  return (
    <section className="card">
      <div className="px-4 py-3 border-b border-line flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-semibold">Assign a room to {household.name}</h2>
        <span className="text-[12.5px] text-muted">{people.length} still need a room · asked for {fmtRange(people[0].stay.checkIn!, people[0].stay.checkOut!)}</span>
      </div>
      <div className="p-4 grid gap-4 md:grid-cols-2">
        <div className="min-w-0">
          <label htmlFor="rt" className="label">Hotel and room type</label>
          <select id="rt" className="input" value={roomTypeId} onChange={(e) => setRoomTypeId(e.target.value)}>
            {data.hotels.map((h) => (
              <optgroup key={h.id} label={h.name}>
                {data.roomTypes.filter((r) => r.hotelId === h.id).map((r) => <option key={r.id} value={r.id}>{r.name} (sleeps {r.maxOccupancy}{r.extraBedCapacity ? '+1' : ''})</option>)}
              </optgroup>
            ))}
          </select>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div><label htmlFor="ci" className="label">Check-in</label><input id="ci" type="date" className="input" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} /></div>
            <div><label htmlFor="co" className="label">Check-out</label><input id="co" type="date" className="input" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} /></div>
          </div>
          {invalidDates && <p className="mt-1.5 text-[12.5px] text-bad">Check-out must be after check-in.</p>}
          <div className="mt-3">
            <label htmlFor="eb" className="label">Extra beds</label>
            <select id="eb" className="input" value={extra} onChange={(e) => setExtra(Number(e.target.value))} disabled={rt.extraBedCapacity === 0}>
              <option value={0}>None</option>{rt.extraBedCapacity > 0 && <option value={1}>1 extra bed</option>}
            </select>
          </div>
          <div className="mt-3">
            <div className="eyebrow mb-1.5">Rooms free per night</div>
            <div className="flex flex-wrap gap-1.5">
              {avail.map((c) => (
                <span key={c.night} className={clsx('rounded-md px-2 py-1 text-[12px] num', c.confirmed + c.held === 0 ? 'bg-sunk text-muted' : c.free <= 0 ? 'bg-bad/10 text-bad' : 'bg-good/10 text-good')}>
                  {c.night.slice(8)} Dec: {c.confirmed + c.held === 0 ? (c.pending ? `${c.pending} not held` : 'none') : `${c.free} free`}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="min-w-0">
          <div className="label">Who sleeps here <span className="text-muted font-normal num">({occ.length}/{capacityOf(rt, extra)})</span></div>
          <ul className="card divide-y divide-line">
            {people.map((p) => (
              <li key={p.id}>
                <label className="flex items-center gap-3 px-3 py-2.5 cursor-pointer">
                  <input id={`o-${p.id}`} type="checkbox" className="h-4 w-4 accent-[rgb(var(--plum))]" checked={occ.includes(p.id)} onChange={(e) => setOcc(e.target.checked ? [...occ, p.id] : occ.filter((x) => x !== p.id))} />
                  <span className="flex-1">{p.firstName} {p.lastName}{p.type === 'CHILD' ? <span className="text-muted"> · child</span> : ''}</span>
                  {p.stay.special && <Pill tone="plum">{p.stay.special}</Pill>}
                </label>
              </li>
            ))}
          </ul>

          <div className="mt-3 flex flex-col gap-2">
            {problems.length === 0 && occ.length > 0 && !invalidDates && <div className="flex items-center gap-2 text-[13px] text-good"><CheckCircle2 size={16} /> No conflicts. Room fits and is available every night.</div>}
            {problems.map((p) => (
              <div key={p.id} className={clsx('rounded-lg border px-3 py-2 text-[13px]', p.severity === 'critical' ? 'border-bad/30 bg-bad/10' : 'border-warn/30 bg-warn/10')}>
                <div className="font-medium">{p.title}</div><div className="text-muted text-[12.5px]">{p.detail}</div>
              </div>
            ))}
            {critical.length > 0 && (
              <div>
                <label htmlFor="reason" className="label">Reason for overriding (saved in history)</label>
                <input id="reason" className="input" placeholder="e.g. Hotel agreed to add a mattress" value={reason} onChange={(e) => setReason(e.target.value)} />
              </div>
            )}
          </div>
          <button className="btn-primary mt-4 w-full" disabled={!canSave} onClick={save} style={{ opacity: canSave ? 1 : 0.5 }}>
            <BedDouble size={16} /> {critical.length ? 'Allocate anyway' : `Allocate ${occ.length} ${occ.length === 1 ? 'guest' : 'guests'}`}
          </button>
          <p className="mt-2 text-[12px] text-muted">This assigns the room inside WeddingStay. It does not book it with the hotel; send the rooming list for that.</p>
        </div>
      </div>
    </section>
  )
}
