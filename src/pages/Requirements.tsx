import { PageHeader, Pill, Stat } from '../components/ui'
import { fmtRange } from '../lib/dates'
import { guestStats, sideLabel } from '../lib/stats'
import { useStore } from '../store'

export default function Requirements() {
  const { data } = useStore()
  const s = guestStats(data)
  const allocated = new Set(data.allocations.flatMap((a) => a.occupantIds))
  const rows = data.households.map((h) => {
    const m = data.guests.filter((g) => g.householdId === h.id)
    const need = m.filter((g) => g.stay.needs === 'YES')
    const unsure = m.filter((g) => g.stay.needs === 'UNSURE')
    return { h, m, need, unsure, done: need.filter((g) => allocated.has(g.id)).length }
  }).filter((r) => r.need.length || r.unsure.length)
    .sort((a, b) => (a.need.length === 0 ? 1 : 0) - (b.need.length === 0 ? 1 : 0) || a.done / Math.max(a.need.length, 1) - b.done / Math.max(b.need.length, 1))

  return (
    <>
      <PageHeader title="Guest requirements" subtitle="What families asked for through their links. This is kept separate from the rooms you assign." />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <Stat label="Need a room" value={s.needsRoom} hint="guests with dates" />
        <Stat label="Not sure yet" value={s.unsureRoom} hint="follow up before blocks expire" tone={s.unsureRoom ? 'warn' : undefined} />
        <Stat label="Missing arrival details" value={s.missingArrival} tone={s.missingArrival ? 'warn' : undefined} />
        <Stat label="Waiting for a room" value={s.unallocated} tone={s.unallocated ? 'bad' : 'good'} />
      </div>
      <div className="card overflow-x-auto">
        <table className="w-full text-[13.5px] min-w-[720px]">
          <thead><tr><th className="th">Family</th><th className="th">Side</th><th className="th">Dates</th><th className="th">People</th><th className="th">Arriving</th><th className="th">Special needs</th><th className="th">Rooms</th></tr></thead>
          <tbody>
            {rows.map(({ h, m, need, unsure, done }) => (
              <tr key={h.id}>
                <td className="td font-medium">{h.name}<div className="text-[12px] text-muted font-normal">from {h.city}</div></td>
                <td className="td text-muted">{sideLabel[h.side]}</td>
                <td className="td num">{need[0] ? fmtRange(need[0].stay.checkIn!, need[0].stay.checkOut!) : <span className="text-muted">Not sure</span>}</td>
                <td className="td num">{need.length ? `${need.filter((g) => g.type === 'ADULT').length} adults${need.some((g) => g.type === 'CHILD') ? `, ${need.filter((g) => g.type === 'CHILD').length} children` : ''}` : `${unsure.length} unsure`}</td>
                <td className="td text-muted">{m[0].travel.arrivalMode ? `${m[0].travel.arrivalDate?.slice(8)} Dec${m[0].travel.arrivalTime ? ', ' + m[0].travel.arrivalTime : ''} · ${m[0].travel.arrivalNumber ?? m[0].travel.arrivalMode.toLowerCase()}` : '—'}</td>
                <td className="td">{need.find((g) => g.stay.special)?.stay.special ?? <span className="text-muted">—</span>}</td>
                <td className="td">{need.length === 0 ? <Pill tone="warn">Ask family</Pill> : done === need.length ? <Pill tone="good">All placed</Pill> : done ? <Pill tone="warn">{done}/{need.length} placed</Pill> : <Pill tone="bad">None yet</Pill>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
