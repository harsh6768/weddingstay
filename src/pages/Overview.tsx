import { AlertTriangle, ArrowRight, CheckCircle2, Circle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Bar, PageHeader, Pill, Section, Stat } from '../components/ui'
import { demandByNight, detectConflicts } from '../lib/accommodation'
import { fmtDow, fmtTime, nightsOf } from '../lib/dates'
import { functionHeadcount, guestStats } from '../lib/stats'
import { useStore } from '../store'

export default function Overview() {
  const { data } = useStore()
  const s = guestStats(data)
  const conflicts = detectConflicts(data)
  const critical = conflicts.filter((c) => c.severity === 'critical')
  const nights = nightsOf('2026-12-10', '2026-12-14')
  const demand = demandByNight(data, nights)
  const maxN = Math.max(...demand.map((d) => Math.max(d.needed, d.supply)), 1)
  const daysLeft = Math.ceil((Date.parse(data.wedding.startDate) - Date.parse('2026-11-10')) / 864e5)

  const checklist = [
    { done: true, label: 'Create your wedding and add functions', to: '/app/functions' },
    { done: true, label: 'Import your guest list', to: '/app/guests' },
    { done: s.pendingHouseholds === 0, label: `Get every family to respond (${s.pendingHouseholds} pending)`, to: '/app/invitations' },
    { done: true, label: 'Add hotels and room blocks', to: '/app/accommodation' },
    { done: s.unallocated === 0, label: `Allocate rooms (${s.unallocated} guests waiting)`, to: '/app/accommodation/allocation' },
    { done: s.allocatedNotSent === 0, label: `Share stay details with guests (${s.allocatedNotSent} not shared)`, to: '/app/accommodation/rooming' },
  ]

  return (
    <>
      <PageHeader title={`${data.wedding.name}, ${daysLeft} days to go`} subtitle={`Responses close on 25 Nov. ${s.yes} of ${s.invited} guests have said yes so far.`} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="Guests invited" value={s.invited} hint={`${s.households} families · ${s.outstation} outstation`} />
        <Stat label="Attending" value={s.yes} hint={`${s.maybe} maybe · ${s.no} not coming`} tone="good" />
        <Stat label="No reply yet" value={s.pending} hint={`${s.pendingHouseholds} families to chase`} tone={s.pending ? 'warn' : undefined} />
        <Stat label="Need a room, unassigned" value={s.unallocated} hint={`of ${s.needsRoom} guests needing rooms`} tone={s.unallocated ? 'bad' : 'good'} />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[1.35fr_1fr]">
        <div className="flex flex-col gap-5 min-w-0">
          <Section title="Rooms needed vs rooms held, by night" action={<Link to="/app/accommodation" className="text-[13px] text-plum font-medium">Inventory</Link>}>
            <div className="p-4 space-y-3">
              {demand.map((d) => (
                <div key={d.night} className="grid grid-cols-[88px_1fr_auto] items-center gap-3">
                  <div className="text-[13px] font-medium">{fmtDow(d.night)}</div>
                  <div className="space-y-1">
                    <div className="h-2.5 rounded-full bg-plum/80" style={{ width: `${(d.needed / maxN) * 100}%` }} title={`${d.needed} rooms needed`} />
                    <div className="h-2.5 rounded-full bg-marigold/70" style={{ width: `${(d.supply / maxN) * 100}%` }} title={`${d.supply} rooms held or confirmed`} />
                  </div>
                  <div className="text-right text-[12.5px] num w-[92px]">
                    {d.shortfall > 0 ? <span className="text-bad font-semibold">{d.shortfall} short</span> : d.needed === 0 ? <span className="text-muted">No stays</span> : <span className="text-good">{d.supply - d.needed} spare</span>}
                  </div>
                </div>
              ))}
              <div className="flex gap-4 pt-1 text-[12px] text-muted">
                <span className="flex items-center gap-1.5"><span className="h-2 w-4 rounded-full bg-plum/80" />Rooms needed (est.)</span>
                <span className="flex items-center gap-1.5"><span className="h-2 w-4 rounded-full bg-marigold/70" />Held or confirmed by hotels</span>
              </div>
              <p className="text-[12px] text-muted">Rooms planned or requested but not yet held by a hotel are not counted here.</p>
            </div>
          </Section>

          <Section title="Function headcount" action={<Link to="/app/functions" className="text-[13px] text-plum font-medium">Functions</Link>}>
            <div className="divide-y divide-line">
              {data.functions.filter((f) => f.isPublished).map((f) => {
                const h = functionHeadcount(data, f.id)
                const total = h.yes + h.maybe + h.no + h.pending
                return (
                  <div key={f.id} className="px-4 py-3">
                    <div className="flex items-baseline justify-between gap-3">
                      <div className="font-medium">{f.name} <span className="text-muted font-normal text-[12.5px]">· {fmtDow(f.date)}, {fmtTime(f.startTime)}</span></div>
                      <div className="num text-[13px]"><span className="font-semibold">{h.yes}</span> <span className="text-muted">coming</span></div>
                    </div>
                    <div className="mt-2"><Bar total={total} parts={[{ value: h.yes, cls: 'bg-good', label: 'Yes' }, { value: h.maybe, cls: 'bg-warn', label: 'Maybe' }, { value: h.pending, cls: 'bg-info/50', label: 'No reply' }]} /></div>
                  </div>
                )
              })}
            </div>
          </Section>
        </div>

        <div className="flex flex-col gap-5 min-w-0">
          <Section title="Needs your attention" action={<Pill tone={critical.length ? 'bad' : 'good'}>{critical.length} serious</Pill>}>
            <ul className="divide-y divide-line">
              {conflicts.filter((c) => c.kind !== 'unallocated').slice(0, 5).map((c) => (
                <li key={c.id} className="flex gap-3 px-4 py-3">
                  <AlertTriangle size={17} className={c.severity === 'critical' ? 'text-bad shrink-0 mt-0.5' : 'text-warn shrink-0 mt-0.5'} />
                  <div className="min-w-0"><div className="font-medium text-[13.5px]">{c.title}</div><div className="text-[12.5px] text-muted">{c.detail}</div></div>
                </li>
              ))}
            </ul>
            <div className="px-4 py-3 border-t border-line"><Link to="/app/accommodation/allocation" className="inline-flex items-center gap-1 text-[13px] font-medium text-plum">Resolve in room allocation <ArrowRight size={14} /></Link></div>
          </Section>

          <Section title="Setup checklist">
            <ul className="p-2">
              {checklist.map((c) => (
                <li key={c.label}>
                  <Link to={c.to} className="flex items-center gap-2.5 rounded-lg px-2 py-2 hover:bg-sunk">
                    {c.done ? <CheckCircle2 size={18} className="text-good shrink-0" /> : <Circle size={18} className="text-muted shrink-0" />}
                    <span className={c.done ? 'text-muted line-through decoration-line' : 'text-ink'}>{c.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Recent changes">
            <ul className="divide-y divide-line">
              {data.audit.slice(0, 4).map((e) => (
                <li key={e.id} className="px-4 py-3">
                  <div className="text-[13.5px]"><span className="font-medium">{e.action}</span> <span className="text-muted">by {e.actor}</span></div>
                  <div className="text-[12.5px] text-muted">{e.detail}</div>
                </li>
              ))}
            </ul>
          </Section>
        </div>
      </div>
    </>
  )
}
