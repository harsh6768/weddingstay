import { Download, FileSpreadsheet, Plus, Search, Upload } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Drawer, InvitationPill, Modal, PageHeader, Pill, RsvpPill } from '../components/ui'
import type { Guest, Household, Rsvp, Side } from '../data/types'
import { fmtRange } from '../lib/dates'
import { sideLabel } from '../lib/stats'
import { useStore } from '../store'

export default function Guests() {
  const { data } = useStore()
  const [q, setQ] = useState('')
  const [side, setSide] = useState<Side | 'ALL'>('ALL')
  const [rsvp, setRsvp] = useState<Rsvp | 'ALL'>('ALL')
  const [room, setRoom] = useState<'ALL' | 'YES'>('ALL')
  const [openHh, setOpenHh] = useState<string | null>(null)
  const [importOpen, setImportOpen] = useState(false)

  const rows = useMemo(() => {
    const t = q.trim().toLowerCase()
    return data.guests
      .filter((g) => (side === 'ALL' || g.side === side) && (rsvp === 'ALL' || g.rsvp === rsvp) && (room === 'ALL' || g.stay.needs === 'YES'))
      .filter((g) => !t || `${g.firstName} ${g.lastName} ${g.relationship} ${data.households.find((h) => h.id === g.householdId)?.name}`.toLowerCase().includes(t))
      .sort((a, b) => a.householdId.localeCompare(b.householdId) || a.id.localeCompare(b.id))
  }, [data, q, side, rsvp, room])

  const hh = (id: string) => data.households.find((h) => h.id === id)!

  return (
    <>
      <PageHeader title="Guests" subtitle={`${data.guests.length} people in ${data.households.length} families. Each person is their own record, grouped by family.`}
        actions={<>
          <button className="btn-ghost" onClick={() => setImportOpen(true)}><Upload size={16} /> Import spreadsheet</button>
          <button className="btn-ghost"><Download size={16} /> Export</button>
          <button className="btn-primary"><Plus size={16} /> Add guest</button>
        </>} />

      <div className="card p-3 mb-4 flex flex-wrap gap-2 items-center">
        <label className="relative flex-1 min-w-[200px]">
          <span className="sr-only">Search guests</span>
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input id="guest-search" className="input !pl-9" placeholder="Search name, family or relationship" value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
        <select id="f-side" aria-label="Side" className="input !w-auto" value={side} onChange={(e) => setSide(e.target.value as Side | 'ALL')}>
          <option value="ALL">Both sides</option><option value="BRIDE">Bride side</option><option value="GROOM">Groom side</option><option value="MUTUAL">Mutual</option>
        </select>
        <select id="f-rsvp" aria-label="RSVP" className="input !w-auto" value={rsvp} onChange={(e) => setRsvp(e.target.value as Rsvp | 'ALL')}>
          <option value="ALL">Any RSVP</option><option value="YES">Attending</option><option value="MAYBE">Maybe</option><option value="NO">Not attending</option><option value="PENDING">No reply</option>
        </select>
        <select id="f-room" aria-label="Accommodation" className="input !w-auto" value={room} onChange={(e) => setRoom(e.target.value as 'ALL' | 'YES')}>
          <option value="ALL">Any stay</option><option value="YES">Needs a room</option>
        </select>
        <span className="text-[12.5px] text-muted ml-auto num">{rows.length} shown</span>
      </div>

      {/* Desktop table */}
      <div className="card hidden md:block overflow-x-auto">
        <table className="w-full text-[13.5px]">
          <thead><tr><th className="th">Name</th><th className="th">Family</th><th className="th">Side</th><th className="th">RSVP</th><th className="th">Stay</th><th className="th">Arrival</th><th className="th">Tags</th></tr></thead>
          <tbody>
            {rows.map((g) => (
              <tr key={g.id} className="hover:bg-sunk/50 cursor-pointer" onClick={() => setOpenHh(g.householdId)}>
                <td className="td"><div className="font-medium">{g.firstName} {g.lastName}</div><div className="text-[12px] text-muted">{g.type === 'CHILD' ? 'Child' : g.relationship}</div></td>
                <td className="td">{hh(g.householdId).name}</td>
                <td className="td text-muted">{sideLabel[g.side]}</td>
                <td className="td"><RsvpPill r={g.rsvp} /></td>
                <td className="td num">{g.stay.needs === 'YES' ? fmtRange(g.stay.checkIn!, g.stay.checkOut!) : g.stay.needs === 'UNSURE' ? <span className="text-muted">Not sure yet</span> : <span className="text-muted">No room</span>}</td>
                <td className="td text-muted">{g.travel.arrivalMode ? `${g.travel.arrivalMode[0] + g.travel.arrivalMode.slice(1).toLowerCase()}${g.travel.arrivalNumber ? ' ' + g.travel.arrivalNumber : ''}` : '—'}</td>
                <td className="td"><div className="flex flex-wrap gap-1">{g.tags.filter((t) => t !== 'Child').map((t) => <Pill key={t} tone={t === 'VIP' ? 'plum' : 'neutral'}>{t}</Pill>)}</div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden flex flex-col gap-2">
        {rows.map((g) => (
          <button key={g.id} className="card p-3 text-left" onClick={() => setOpenHh(g.householdId)}>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0"><div className="font-medium">{g.firstName} {g.lastName}</div><div className="text-[12.5px] text-muted truncate">{hh(g.householdId).name} · {sideLabel[g.side]}</div></div>
              <RsvpPill r={g.rsvp} />
            </div>
            {g.stay.needs === 'YES' && <div className="mt-1.5 text-[12.5px] text-muted">Room {fmtRange(g.stay.checkIn!, g.stay.checkOut!)}</div>}
          </button>
        ))}
      </div>

      <HouseholdDrawer household={openHh ? hh(openHh) : null} onClose={() => setOpenHh(null)} />
      <ImportModal open={importOpen} onClose={() => setImportOpen(false)} />
    </>
  )
}

function HouseholdDrawer({ household, onClose }: { household: Household | null; onClose: () => void }) {
  const { data } = useStore()
  if (!household) return null
  const members = data.guests.filter((g) => g.householdId === household.id)
  const coord = data.members.find((m) => m.id === household.coordinatorId)
  const rooms = data.allocations.filter((a) => a.householdId === household.id)
  return (
    <Drawer open onClose={onClose} title={household.name}>
      <div className="flex flex-wrap gap-2 mb-4">
        <Pill tone="plum">{sideLabel[household.side]}</Pill><Pill>{household.city}</Pill><InvitationPill s={household.invitation} />
      </div>
      <dl className="grid grid-cols-2 gap-3 text-[13.5px] mb-5">
        <div><dt className="eyebrow">Primary contact</dt><dd className="mt-0.5">{members[0]?.firstName} {members[0]?.lastName}<div className="text-muted num">{members[0]?.phone}</div></dd></div>
        <div><dt className="eyebrow">Coordinator</dt><dd className="mt-0.5">{coord?.name ?? 'Couple'}</dd></div>
      </dl>
      <h3 className="eyebrow mb-2">Members ({members.length})</h3>
      <ul className="card divide-y divide-line mb-5">
        {members.map((g: Guest) => (
          <li key={g.id} className="p-3">
            <div className="flex justify-between gap-2"><div className="font-medium">{g.firstName} {g.lastName}{g.type === 'CHILD' && <span className="text-muted font-normal"> · child</span>}</div><RsvpPill r={g.rsvp} /></div>
            <div className="mt-1 text-[12.5px] text-muted">
              {g.stay.needs === 'YES' ? `Room ${fmtRange(g.stay.checkIn!, g.stay.checkOut!)}` : g.stay.needs === 'UNSURE' ? 'Room: not sure yet' : 'No room needed'}
              {g.dietary ? ` · ${g.dietary}` : ''}{g.stay.special ? ` · ${g.stay.special}` : ''}
            </div>
          </li>
        ))}
      </ul>
      {members[0]?.travel.arrivalMode && (
        <>
          <h3 className="eyebrow mb-2">Travel</h3>
          <div className="card p-3 mb-5 text-[13.5px]">
            Arriving {members[0].travel.arrivalDate?.slice(8)} Dec {members[0].travel.arrivalTime ?? ''} by {members[0].travel.arrivalMode.toLowerCase()} {members[0].travel.arrivalNumber ?? ''}
            {members[0].travel.arrivalLocation && <div className="text-muted">{members[0].travel.arrivalLocation}</div>}
          </div>
        </>
      )}
      <h3 className="eyebrow mb-2">Rooms</h3>
      {rooms.length === 0 ? <p className="text-muted">No room allocated yet.</p> : (
        <ul className="card divide-y divide-line">
          {rooms.map((a) => (
            <li key={a.id} className="p-3 text-[13.5px]">{data.roomTypes.find((r) => r.id === a.roomTypeId)?.name}, {data.hotels.find((h) => h.id === a.hotelId)?.name}<div className="text-muted">{fmtRange(a.checkIn, a.checkOut)} · {a.occupantIds.length} people</div></li>
          ))}
        </ul>
      )}
    </Drawer>
  )
}

function ImportModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState(1)
  const map = [['Name', 'Full name'], ['Mobile', 'Phone'], ['Family / Group', 'Household'], ['Ladkiwale / Ladkewale', 'Side'], ['Relation', 'Relationship'], ['Kids?', 'Skip this column']]
  return (
    <Modal open={open} onClose={() => { setStep(1); onClose() }} title="Import guests">
      <ol className="flex gap-2 mb-4 text-[12px]">
        {['Upload', 'Match columns', 'Review'].map((s, i) => <li key={s} className={`flex-1 rounded-full px-2 py-1 text-center ${step === i + 1 ? 'bg-plum text-onplum' : 'bg-sunk text-muted'}`}>{i + 1}. {s}</li>)}
      </ol>
      {step === 1 && (
        <div className="rounded-xl border-2 border-dashed border-line p-6 text-center">
          <FileSpreadsheet className="mx-auto text-plum" />
          <div className="mt-2 font-medium">guests-final-v3.xlsx</div>
          <div className="text-[12.5px] text-muted">118 rows · 6 columns · CSV or XLSX up to 5 MB</div>
          <button className="btn-primary mt-4" onClick={() => setStep(2)}>Continue</button>
        </div>
      )}
      {step === 2 && (
        <>
          <table className="w-full text-[13.5px]"><thead><tr><th className="th !px-0">Your column</th><th className="th">Imports as</th></tr></thead>
            <tbody>{map.map(([a, b]) => <tr key={a}><td className="td !px-0">{a}</td><td className="td"><span className={b.startsWith('Skip') ? 'text-muted' : ''}>{b}</span></td></tr>)}</tbody></table>
          <div className="mt-4 flex justify-end gap-2"><button className="btn-ghost" onClick={() => setStep(1)}>Back</button><button className="btn-primary" onClick={() => setStep(3)}>Preview import</button></div>
        </>
      )}
      {step === 3 && (
        <>
          <div className="grid grid-cols-3 gap-2 text-center mb-4">
            <div className="card p-3"><div className="font-display text-[22px] font-semibold num">112</div><div className="text-[12px] text-muted">ready</div></div>
            <div className="card p-3"><div className="font-display text-[22px] font-semibold text-warn num">4</div><div className="text-[12px] text-muted">possible duplicates</div></div>
            <div className="card p-3"><div className="font-display text-[22px] font-semibold text-bad num">2</div><div className="text-[12px] text-muted">need fixing</div></div>
          </div>
          <div className="card p-3 text-[13px] mb-2"><span className="font-medium">Row 41, Karthik Raghavan</span> looks like <span className="font-medium">Karthik Raghavan</span> already in the Raghavan family (same mobile). <span className="text-muted">Keep both · Skip row</span></div>
          <div className="card p-3 text-[13px]"><span className="font-medium">Row 87</span>: mobile "98450-1234" has 9 digits. <span className="text-muted">Fix · Import without phone</span></div>
          <p className="mt-3 text-[12.5px] text-muted">Nothing is imported until you confirm. Ambiguous matches are never merged automatically.</p>
          <div className="mt-4 flex justify-end gap-2"><button className="btn-ghost" onClick={() => setStep(2)}>Back</button><button className="btn-primary" onClick={() => { setStep(1); onClose() }}>Import 112 guests</button></div>
        </>
      )}
    </Modal>
  )
}
