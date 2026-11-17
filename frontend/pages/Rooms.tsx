import clsx from 'clsx'
import { AlertTriangle, ArrowRight, BedDouble, Check, CheckCircle2, Download, Hotel as HotelIcon, MapPin, Phone, Plus, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Chips, Modal, Stepper, WhatsAppButton } from '../components/ui'
import type { Guest, Household, RoomAllocation, RoomType } from '../../shared/types'
import { capacityOf, roomTypeNights, validateAllocation } from '../lib/accommodation'
import { addDays, fmtDay, nightsOf } from '../../shared/dates'
import { familyInfo, roomStage, shortRange, stayText, waUrl, type RoomStage } from '../lib/family'
import { useStore } from '../store'

// Rooms: one page instead of four. "Need a room" -> "Room given" -> hotel confirms -> family told.

type Tab = 'need' | 'given' | 'hotels'

export default function Rooms() {
  const { data } = useStore()
  const [sp, setSp] = useSearchParams()
  const param = sp.get('show')
  const tab: Tab = param === 'hotels' ? 'hotels' : param === 'confirmed' || param === 'given' ? 'given' : 'need'
  const setTab = (t: Tab) => setSp(t === 'need' ? {} : { show: t }, { replace: true })
  const [give, setGive] = useState<string | null>(null)
  const [byPhone, setByPhone] = useState(false)
  const [addHotel, setAddHotel] = useState(sp.get('add') === 'hotel')

  const fams = data.households.map((h) => ({ h, ...familyInfo(data, h) }))
  const waiting = fams.filter((f) => f.waitingForRoom.length > 0)
  const asked = fams.filter((f) => f.needRoom.length > 0)
  const unsure = data.households.filter((h) => data.guests.some((g) => g.householdId === h.id && g.stay.needs === 'UNSURE' && g.rsvp !== 'PENDING'))

  return (
    <>
      <div className="mb-5">
        <h1 className="font-display text-[34px] md:text-[40px] leading-[1.05] font-semibold">Rooms</h1>
        <p className="mt-0.5 text-[15px] text-muted">
          {asked.length === 0 ? 'Families who need a room will show up here after they reply.' : `${asked.length} families asked for a room · ${waiting.length} still waiting`}
        </p>
      </div>

      <Chips label="Rooms" value={tab} onChange={setTab} options={[
        { v: 'need', label: 'Need a room', count: waiting.length },
        { v: 'given', label: 'Room given', count: new Set(data.allocations.map((a) => a.householdId)).size },
        { v: 'hotels', label: 'Hotels', count: data.hotels.length },
      ]} />

      <div className="mt-4">
        {tab === 'need' && (
          data.hotels.length === 0 ? (
            <EmptyHotels onAdd={() => setAddHotel(true)} asked={asked.length} />
          ) : waiting.length === 0 ? (
            <div className="card px-6 py-10 text-center">
              <CheckCircle2 size={36} className="mx-auto text-good" />
              <h2 className="mt-3 font-display text-[24px] font-semibold">{asked.length ? 'Everyone has a room' : 'No room requests yet'}</h2>
              <p className="mx-auto mt-1 max-w-[36ch] text-[15px] text-muted">{asked.length ? 'When a family changes their plans or asks for a room, they’ll appear here.' : 'Families tell you if they need a room when they reply to the invite.'}</p>
              {!asked.length && <Link to="/app/guests?show=not-sent" className="btn-primary mt-5 !min-h-[48px]">Send invites</Link>}
              {!asked.length && <Link to="/app/guests?import=1" className="mt-3 block text-[14px] font-medium text-plum underline">Have replies in a Google Form? Add them</Link>}
            </div>
          ) : (
            <ul className="grid gap-2.5 md:grid-cols-2">
              {waiting.map((f) => {
                const p = f.waitingForRoom
                const special = p.find((g) => g.stay.special)?.stay.special
                return (
                  <li key={f.h.id} className="card p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-[16px] font-semibold">{f.h.name}</div>
                        <div className="text-[14px] text-muted">{p.length} {p.length === 1 ? 'person' : 'people'}{p.some((g) => g.type === 'CHILD') ? ` (${p.filter((g) => g.type === 'CHILD').length} kids)` : ''} · {shortRange(p[0].stay.checkIn!, p[0].stay.checkOut!)}</div>
                        {special && <div className="mt-1 text-[13.5px] text-plum">“{special}”</div>}
                      </div>
                      {f.allocs.length > 0 && <span className="shrink-0 rounded-full bg-warn/10 px-2.5 py-0.5 text-[12px] font-medium text-warn">1 room given</span>}
                    </div>
                    <button className="btn-primary mt-3 w-full !min-h-[48px] text-[15px]" onClick={() => setGive(f.h.id)}><BedDouble size={17} /> Give a room</button>
                  </li>
                )
              })}
            </ul>
          )
        )}
        {tab === 'need' && data.hotels.length > 0 && data.households.length > 0 && (
          <div className="mt-4 rounded-2xl border border-dashed border-line p-4 text-center">
            <button className="btn-ghost w-full !min-h-[48px] text-[15px] sm:w-auto" onClick={() => setByPhone(true)}><Plus size={17} /> Give a room to any family</button>
            <p className="mt-1.5 text-[13.5px] text-muted">For families who told you on the phone instead of replying.</p>
          </div>
        )}
        {tab === 'need' && unsure.length > 0 && data.hotels.length > 0 && (
          <p className="mt-4 rounded-2xl bg-sunk/70 p-4 text-[14px]"><b>{unsure.length} families</b> said “not sure” about a room. <Link to="/app/guests?show=room" className="font-medium text-plum underline">Ask them</Link> before the hotel’s hold ends.</p>
        )}

        {tab === 'given' && <Given />}
        {tab === 'hotels' && <Hotels onAdd={() => setAddHotel(true)} />}
      </div>

      {give && <GiveRoom householdId={give} onClose={() => setGive(null)} />}
      {byPhone && <NoteStay onClose={() => setByPhone(false)} onSaved={(id) => { setByPhone(false); setGive(id) }} />}
      <AddHotel open={addHotel} onClose={() => { setAddHotel(false); if (sp.get('add')) setSp(tab === 'need' ? {} : { show: tab }, { replace: true }) }} />
    </>
  )
}

/** The couple notes a stay for a family who called instead of replying, then gives them a room. */
function NoteStay({ onClose, onSaved }: { onClose: () => void; onSaved: (householdId: string) => void }) {
  const { data, dispatch } = useStore()
  const [q, setQ] = useState('')
  const [hid, setHid] = useState<string | null>(null)
  const h = data.households.find((x) => x.id === hid)
  const people = h ? familyInfo(data, h).people : []
  const [picked, setPicked] = useState<string[]>([])
  const [checkIn, setCheckIn] = useState(addDays(data.wedding.startDate, -1))
  const [checkOut, setCheckOut] = useState(addDays(data.wedding.endDate, 1))
  const choose = (id: string) => { setHid(id); setPicked(data.guests.filter((g) => g.householdId === id && g.rsvp !== 'NO').map((g) => g.id)) }
  const fns = data.functions.filter((f) => f.isPublished)
  const ok = picked.length > 0 && checkIn && checkOut && checkOut > checkIn
  const fams = data.households.filter((x) => familyInfo(data, x).waitingForRoom.length === 0 && x.name.toLowerCase().includes(q.trim().toLowerCase()))

  const save = async () => {
    const guests: Guest[] = people.filter((p) => picked.includes(p.id)).map((p) => ({
      ...p, rsvp: 'YES', attendance: Object.fromEntries(fns.map((f) => [f.id, p.attendance[f.id] && p.attendance[f.id] !== 'PENDING' ? p.attendance[f.id] : 'YES'])),
      stay: { ...p.stay, needs: 'YES', checkIn, checkOut },
    }))
    if (await dispatch({ type: 'guest/respond', householdId: h!.id, guests, byCouple: true })) onSaved(h!.id)
  }

  return (
    <Modal open onClose={onClose} title={h ? `Room for ${h.name}` : 'Which family?'}>
      {!h ? (
        <div className="grid gap-3">
          {data.households.length > 6 && <input className="input !min-h-[48px]" placeholder="Search a family" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search a family" />}
          <ul className="grid max-h-[50vh] gap-2 overflow-y-auto">
            {fams.map((x) => (
              <li key={x.id}><button className="w-full rounded-2xl border border-line bg-surface px-4 py-3 text-left hover:bg-sunk" onClick={() => choose(x.id)}>
                <div className="font-semibold">{x.name}</div>
                <div className="text-[13.5px] text-muted">{familyInfo(data, x).people.length} people · {familyInfo(data, x).allocs.length ? 'has a room' : 'no room yet'}</div>
              </button></li>
            ))}
            {!fams.length && <li className="text-[14px] text-muted">No family found.</li>}
          </ul>
        </div>
      ) : (
        <div className="grid gap-4">
          <div>
            <div className="label !text-[14px]">Who is staying?</div>
            <div className="grid gap-1.5">
              {people.map((p) => (
                <label key={p.id} className="flex min-h-[44px] items-center gap-3 rounded-xl border border-line px-3">
                  <input type="checkbox" className="h-5 w-5 accent-[rgb(var(--plum))]" checked={picked.includes(p.id)} onChange={(e) => setPicked(e.target.checked ? [...picked, p.id] : picked.filter((x) => x !== p.id))} />
                  <span>{p.firstName} {p.lastName}{p.type === 'CHILD' && <span className="ml-1.5 text-[12.5px] text-muted">child</span>}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label htmlFor="ns-in" className="label !text-[14px]">Arriving</label><input id="ns-in" type="date" className="input !min-h-[48px]" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} /></div>
            <div><label htmlFor="ns-out" className="label !text-[14px]">Leaving</label><input id="ns-out" type="date" className="input !min-h-[48px]" min={checkIn} value={checkOut} onChange={(e) => setCheckOut(e.target.value)} /></div>
          </div>
          {checkIn && checkOut && checkOut <= checkIn && <p className="text-[14px] text-bad">Leaving must be after arriving.</p>}
          <p className="text-[13.5px] text-muted">We’ll mark them as coming and needing a room, then you pick the room.</p>
          <button className="btn-primary !min-h-[52px] text-[16px]" disabled={!ok} style={{ opacity: ok ? 1 : 0.5 }} onClick={save}>Next: pick a room <ArrowRight size={17} /></button>
          <button className="text-[14px] font-medium text-plum underline" onClick={() => setHid(null)}>Choose a different family</button>
        </div>
      )}
    </Modal>
  )
}

function EmptyHotels({ onAdd, asked }: { onAdd: () => void; asked: number }) {
  return (
    <div className="card px-6 py-10 text-center">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-plumsoft text-plum"><HotelIcon size={30} /></div>
      <h2 className="mt-4 font-display text-[26px] font-semibold leading-tight">Add the hotel where guests will stay</h2>
      <p className="mx-auto mt-2 max-w-[38ch] text-[15px] text-muted">{asked ? `${asked} families asked for a room. ` : ''}Just the hotel name and how many rooms you’ve booked. Takes a minute.</p>
      <button className="btn-primary mt-6 w-full !min-h-[52px] text-[16px] sm:w-auto" onClick={onAdd}><Plus size={18} /> Add a hotel</button>
    </div>
  )
}

/** Fewest free rooms across the nights asked for. null = hotel hasn't promised rooms yet. */
function freeFor(data: Parameters<typeof roomTypeNights>[0], rt: RoomType, checkIn: string, checkOut: string) {
  const cells = roomTypeNights(data, rt.id, nightsOf(checkIn, checkOut))
  if (cells.every((c) => c.confirmed + c.held === 0)) return null
  return Math.min(...cells.map((c) => c.free))
}

function GiveRoom({ householdId, onClose }: { householdId: string; onClose: () => void }) {
  const { data, dispatch } = useStore()
  const h = data.households.find((x) => x.id === householdId)!
  const people = familyInfo(data, h).waitingForRoom
  const [checkIn, setCheckIn] = useState(people[0].stay.checkIn!)
  const [checkOut, setCheckOut] = useState(people[0].stay.checkOut!)
  const [editDates, setEditDates] = useState(false)

  const options = useMemo(() => data.roomTypes.map((rt) => ({ rt, free: freeFor(data, rt, checkIn, checkOut), cap: capacityOf(rt, rt.extraBedCapacity) }))
    .sort((a, b) => Number((b.free ?? -1) > 0) - Number((a.free ?? -1) > 0) || Number(b.cap >= people.length) - Number(a.cap >= people.length) || a.cap - b.cap), [data, checkIn, checkOut, people.length])
  const [rtId, setRtId] = useState(options.find((o) => (o.free ?? 0) > 0)?.rt.id ?? options[0]?.rt.id)
  const rt = data.roomTypes.find((r) => r.id === rtId)!
  const fitAll = capacityOf(rt, rt.extraBedCapacity)
  const [occ, setOcc] = useState<string[]>(() => people.slice(0, fitAll).map((p) => p.id))
  const pickRoom = (id: string) => {
    setRtId(id)
    const r = data.roomTypes.find((x) => x.id === id)!
    setOcc(people.slice(0, capacityOf(r, r.extraBedCapacity)).map((p) => p.id))
  }
  const extraBeds = occ.length > rt.maxOccupancy ? Math.min(rt.extraBedCapacity, occ.length - rt.maxOccupancy) : 0
  const draft: RoomAllocation = { id: 'draft', hotelId: rt.hotelId, roomTypeId: rt.id, householdId, occupantIds: occ, checkIn, checkOut, extraBeds, status: 'ASSIGNED', publishedToGuest: false }
  const problems = occ.length && checkOut > checkIn ? validateAllocation(data, draft) : []
  const left = people.length - occ.length
  const save = () => {
    dispatch({ type: 'allocation/add', actor: 'You', note: `${h.name}: ${occ.length} people to ${rt.name}`, allocation: { ...draft, id: `a${Date.now()}` } })
    onClose()
  }

  return (
    <Modal open onClose={onClose} title={`Room for ${h.name}`}>
      <div className="rounded-2xl bg-sunk/70 p-3.5 text-[14.5px]">
        <div><b>{people.length} people</b> · {shortRange(checkIn, checkOut)} <button className="ml-1 font-medium text-plum underline" onClick={() => setEditDates(!editDates)}>{editDates ? 'Done' : 'Change'}</button></div>
        {editDates && (
          <div className="mt-2 grid grid-cols-2 gap-2">
            <div><label htmlFor="gi" className="label">Check-in</label><input id="gi" type="date" className="input" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} /></div>
            <div><label htmlFor="go" className="label">Check-out</label><input id="go" type="date" className="input" min={addDays(checkIn, 1)} value={checkOut} onChange={(e) => setCheckOut(e.target.value)} /></div>
          </div>
        )}
      </div>

      <h3 className="mt-5 mb-2 text-[14px] font-semibold">Pick a room</h3>
      <div className="grid gap-2" role="radiogroup" aria-label="Room">
        {options.map(({ rt: r, free, cap }) => {
          const hotel = data.hotels.find((x) => x.id === r.hotelId)!
          const on = r.id === rtId
          return (
            <button key={r.id} type="button" role="radio" aria-checked={on} onClick={() => pickRoom(r.id)}
              className={clsx('flex items-center gap-3 rounded-2xl border p-3.5 text-left min-h-[64px]', on ? 'border-plum bg-plumsoft shadow-[0_0_0_1px_rgb(var(--plum))_inset]' : 'border-line bg-surface')}>
              <span className={clsx('grid h-6 w-6 shrink-0 place-items-center rounded-full border-2', on ? 'border-plum bg-plum text-onplum' : 'border-line')}>{on && <Check size={13} />}</span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">{r.name}</span>
                <span className="block text-[13px] text-muted">{hotel.name} · fits {r.maxOccupancy}{r.extraBedCapacity ? ` (+${r.extraBedCapacity} extra bed)` : ''}</span>
              </span>
              <span className={clsx('shrink-0 rounded-full px-2.5 py-1 text-[12.5px] font-semibold', free === null ? 'bg-sunk text-muted' : free > 0 ? 'bg-good/10 text-good' : 'bg-bad/10 text-bad')}>
                {free === null ? 'Not booked yet' : free > 0 ? `${free} free` : 'Full'}
              </span>
              <span className="sr-only">{cap >= people.length ? 'fits everyone' : ''}</span>
            </button>
          )
        })}
      </div>

      {people.length > 1 && (
        <>
          <h3 className="mt-5 mb-2 text-[14px] font-semibold">Who stays in this room?</h3>
          <div className="flex flex-wrap gap-2">
            {people.map((p: Guest) => {
              const on = occ.includes(p.id)
              return (
                <button key={p.id} type="button" aria-pressed={on} onClick={() => setOcc(on ? occ.filter((x) => x !== p.id) : [...occ, p.id])}
                  className={clsx('inline-flex items-center gap-1.5 rounded-full border px-3.5 min-h-[44px] text-[14.5px]', on ? 'border-plum bg-plumsoft text-plum font-medium' : 'border-line bg-surface text-muted')}>
                  {on && <Check size={15} />}{p.firstName}{p.type === 'CHILD' ? ' (kid)' : ''}
                </button>
              )
            })}
          </div>
          {extraBeds > 0 && <p className="mt-2 text-[13.5px] text-muted">Includes {extraBeds} extra bed.</p>}
          {left > 0 && <p className="mt-2 text-[13.5px] text-muted">{left} {left === 1 ? 'person' : 'people'} will still need a room. You can give a second room right after this.</p>}
        </>
      )}

      {problems.length > 0 && (
        <div className="mt-4 flex flex-col gap-2">
          {problems.map((p) => (
            <div key={p.id} className={clsx('flex gap-2.5 rounded-2xl border p-3 text-[14px]', p.severity === 'critical' ? 'border-bad/30 bg-bad/10' : 'border-warn/30 bg-warn/10')}>
              <AlertTriangle size={18} className={clsx('mt-0.5 shrink-0', p.severity === 'critical' ? 'text-bad' : 'text-warn')} />
              <div>{plain(p.kind, p.title)}</div>
            </div>
          ))}
        </div>
      )}

      <button className="btn-primary mt-5 w-full !min-h-[52px] text-[16px]" disabled={!occ.length || checkOut <= checkIn} style={{ opacity: occ.length && checkOut > checkIn ? 1 : 0.5 }} onClick={save}>
        {problems.some((p) => p.severity === 'critical') ? 'Give this room anyway' : `Give this room to ${occ.length} ${occ.length === 1 ? 'person' : 'people'}`}
      </button>
      <p className="mt-2 text-center text-[12.5px] text-muted">The family isn’t told yet. You’ll send it once the hotel confirms.</p>
    </Modal>
  )
}

/** Turn conflict checks into one plain sentence. */
function plain(kind: string, fallback: string) {
  switch (kind) {
    case 'capacity': return 'Too many people for this room. Pick a bigger room or untick someone.'
    case 'inventory': return 'This room type is full on one of these nights. Pick another room or ask the hotel for more.'
    case 'outside-block': return 'You haven’t booked this room with the hotel for all these nights.'
    case 'unconfirmed': return 'The hotel hasn’t confirmed these rooms yet. Fine to plan, but don’t tell the family until they do.'
    case 'double-booked': return 'Someone here already has a room on these nights.'
    case 'dates': return 'These dates are different from what the family asked for.'
    default: return fallback
  }
}

const stageOrder: Record<RoomStage, number> = { confirmed: 0, given: 1, told: 2 }

function Given() {
  const { data, dispatch } = useStore()
  const byFam = new Map<string, RoomAllocation[]>()
  data.allocations.forEach((a) => byFam.set(a.householdId, [...(byFam.get(a.householdId) ?? []), a]))
  const fams = [...byFam.entries()].map(([id, allocs]) => ({ h: data.households.find((x) => x.id === id)!, allocs, stage: allocs.map(roomStage).sort((a, b) => stageOrder[a] - stageOrder[b])[0] }))
    .sort((a, b) => stageOrder[a.stage] - stageOrder[b.stage])
  if (!fams.length) return <p className="card px-6 py-10 text-center text-[15px] text-muted">No rooms given yet. Start from <b>Need a room</b>.</p>

  const tell = (h: Household, allocs: RoomAllocation[]) => {
    dispatch({ type: 'allocation/publish', householdId: h.id, published: true })
    allocs.forEach((a) => dispatch({ type: 'allocation/status', id: a.id, status: 'GUEST_NOTIFIED' }))
  }

  return (
    <ul className="grid gap-2.5 md:grid-cols-2">
      {fams.map(({ h, allocs, stage }) => {
        const contact = familyInfo(data, h).contact
        return (
          <li key={h.id} className="card p-4">
            <div className="text-[16px] font-semibold">{h.name}</div>
            {allocs.map((a) => {
              const rt = data.roomTypes.find((r) => r.id === a.roomTypeId)!
              return (
                <div key={a.id} className="mt-1 flex items-start justify-between gap-2 text-[14px]">
                  <div className="min-w-0 text-muted">{rt.name}, {data.hotels.find((x) => x.id === a.hotelId)?.name}<br />{shortRange(a.checkIn, a.checkOut)} · {a.occupantIds.length} people</div>
                  {roomStage(a) !== 'told' && (
                    <button className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-muted hover:bg-sunk" aria-label={`Remove ${rt.name} from ${h.name}`}
                      onClick={() => dispatch({ type: 'allocation/remove', id: a.id, actor: 'You', note: `${h.name}: removed from ${rt.name}` })}><Trash2 size={16} /></button>
                  )}
                </div>
              )
            })}
            <Progress stage={stage} />
            <div className="mt-3">
              {stage === 'given' && (
                <button className="btn-ghost w-full !min-h-[48px]" onClick={() => allocs.forEach((a) => dispatch({ type: 'allocation/status', id: a.id, status: 'HOTEL_CONFIRMED' }))}>
                  <Check size={17} /> Hotel has confirmed
                </button>
              )}
              {stage === 'confirmed' && (
                <WhatsAppButton className="w-full" href={waUrl(contact?.phone, stayText(data, h))} onClick={() => tell(h, allocs)}>Send room details</WhatsAppButton>
              )}
              {stage === 'told' && (
                <Link to={`/g/${h.id}/stay`} className="inline-flex min-h-[44px] items-center gap-1 text-[14px] font-medium text-plum">See what they see <ArrowRight size={15} /></Link>
              )}
            </div>
          </li>
        )
      })}
    </ul>
  )
}

function Progress({ stage }: { stage: RoomStage }) {
  const steps = ['Room given', 'Hotel confirmed', 'Family told']
  const at = stage === 'given' ? 0 : stage === 'confirmed' ? 1 : 2
  return (
    <ol className="mt-3 grid grid-cols-3 gap-1.5" aria-label={`Progress: ${steps[at]}`}>
      {steps.map((s, i) => (
        <li key={s} className="min-w-0">
          <div className={clsx('h-1.5 rounded-full', i <= at ? (at === 2 ? 'bg-good' : 'bg-plum') : 'bg-sunk')} />
          <div className={clsx('mt-1 truncate text-[12px]', i === at ? 'font-semibold text-ink' : 'text-muted')}>{s}</div>
        </li>
      ))}
    </ol>
  )
}

function Hotels({ onAdd }: { onAdd: () => void }) {
  const { data } = useStore()
  if (!data.hotels.length) return <EmptyHotels onAdd={onAdd} asked={0} />
  const nights = nightsOf(data.wedding.startDate, addDays(data.wedding.endDate, 1))
  return (
    <>
      <div className="grid gap-3 md:grid-cols-2">
        {data.hotels.map((h) => {
          const types = data.roomTypes.filter((r) => r.hotelId === h.id)
          const guests = data.allocations.filter((a) => a.hotelId === h.id)
          const list = guests.map((a, i) => `${i + 1}. ${data.households.find((x) => x.id === a.householdId)?.name}, ${data.roomTypes.find((r) => r.id === a.roomTypeId)?.name}, ${fmtDay(a.checkIn)} to ${fmtDay(a.checkOut)}, ${a.occupantIds.length} people`).join('\n')
          return (
            <section key={h.id} className="card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="font-display text-[22px] font-semibold leading-tight">{h.name}</h2>
                  <div className="mt-0.5 flex items-center gap-1.5 text-[13.5px] text-muted"><MapPin size={14} /> {h.distanceToVenue}{h.area ? ` · ${h.area}` : ''}</div>
                </div>
                <a href={`tel:${h.contactPhone.replace(/\s/g, '')}`} className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-line" aria-label={`Call ${h.name}`}><Phone size={18} /></a>
              </div>
              <ul className="mt-3 divide-y divide-line rounded-2xl border border-line">
                {types.map((rt) => {
                  const cells = roomTypeNights(data, rt.id, nights).filter((c) => c.confirmed + c.held + c.pending > 0)
                  const booked = cells.some((c) => c.confirmed + c.held > 0)
                  const total = Math.max(0, ...cells.map((c) => c.confirmed + c.held + c.pending))
                  const free = booked ? Math.min(...cells.filter((c) => c.confirmed + c.held > 0).map((c) => c.free)) : null
                  return (
                    <li key={rt.id} className="flex items-center justify-between gap-3 px-3.5 py-3">
                      <div className="min-w-0"><div className="font-medium">{rt.name}</div><div className="text-[13px] text-muted">{total} rooms · fits {rt.maxOccupancy}</div></div>
                      <span className={clsx('shrink-0 rounded-full px-2.5 py-1 text-[12.5px] font-semibold', free === null ? 'bg-sunk text-muted' : free > 0 ? 'bg-good/10 text-good' : 'bg-bad/10 text-bad')}>
                        {free === null ? 'Asked, not confirmed' : free > 0 ? `${free} free` : free === 0 ? 'Full' : `${-free} too many`}
                      </span>
                    </li>
                  )
                })}
              </ul>
              {guests.length > 0 && (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <WhatsAppButton small href={waUrl(h.contactPhone, `Namaste! Guest list for ${data.wedding.name}'s wedding:\n\n${list}`)}>Send list</WhatsAppButton>
                  <button className="btn-ghost !min-h-[44px]"><Download size={16} /> Excel</button>
                </div>
              )}
            </section>
          )
        })}
      </div>
      <button className="btn-ghost mt-4 w-full !min-h-[52px] sm:w-auto" onClick={onAdd}><Plus size={18} /> Add another hotel</button>
    </>
  )
}

function AddHotel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data, dispatch } = useStore()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [distance, setDistance] = useState('')
  const [rooms, setRooms] = useState([{ name: 'Deluxe room', count: 10, sleeps: 2 }])
  if (!open) return null
  const ok = name.trim() && rooms.every((r) => r.name.trim() && r.count > 0)
  const close = () => { setName(''); setPhone(''); setDistance(''); setRooms([{ name: 'Deluxe room', count: 10, sleeps: 2 }]); onClose() }
  const save = () => {
    const id = `htn${Date.now().toString(36)}`
    const types: RoomType[] = rooms.map((r, i) => ({ id: `${id}_rt${i}`, hotelId: id, name: r.name.trim(), maxOccupancy: r.sleeps, standardAdults: r.sleeps, extraBedCapacity: 1, ratePerNight: 0 }))
    dispatch({
      type: 'hotel/add',
      hotel: { id, name: name.trim(), area: '', address: data.wedding.city, mapUrl: '', contactName: 'Front desk', contactPhone: phone ? `+91 ${phone}` : '', checkInTime: '14:00', checkOutTime: '12:00', distanceToVenue: distance.trim() || 'Near the venue' },
      roomTypes: types,
      blocks: types.map((t, i) => ({ id: `${id}_b${i}`, hotelId: id, roomTypeId: t.id, startDate: addDays(data.wedding.startDate, -1), endDate: addDays(data.wedding.endDate, 1), quantity: rooms[i].count, status: 'CONFIRMED' })),
    })
    close()
  }
  const setRoom = (i: number, patch: Partial<(typeof rooms)[number]>) => setRooms(rooms.map((r, j) => (i === j ? { ...r, ...patch } : r)))
  return (
    <Modal open onClose={close} title="Add a hotel">
      <div className="grid gap-4">
        <div><label htmlFor="hn" className="label !text-[14px]">Hotel name</label><input id="hn" className="input !min-h-[50px] !text-[16px]" placeholder="e.g. Hotel Lake Palace" value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label htmlFor="hp" className="label !text-[14px]">Hotel phone</label><input id="hp" className="input !min-h-[50px]" inputMode="tel" placeholder="94140 00000" value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
          <div><label htmlFor="hd" className="label !text-[14px]">Distance to venue</label><input id="hd" className="input !min-h-[50px]" placeholder="e.g. 10 min" value={distance} onChange={(e) => setDistance(e.target.value)} /></div>
        </div>
        <div>
          <div className="label !text-[14px]">Rooms you’ve booked</div>
          <div className="grid gap-3">
            {rooms.map((r, i) => (
              <div key={i} className="grid gap-2 rounded-2xl border border-line p-3">
                <input className="input" aria-label="Room type" placeholder="Room type, e.g. Deluxe room" value={r.name} onChange={(e) => setRoom(i, { name: e.target.value })} />
                <Stepper label="How many rooms" value={r.count} onChange={(n) => setRoom(i, { count: n })} min={1} max={200} />
                <Stepper label="People per room" value={r.sleeps} onChange={(n) => setRoom(i, { sleeps: n })} min={1} max={8} />
              </div>
            ))}
          </div>
          <button className="mt-2 inline-flex min-h-[44px] items-center gap-1.5 text-[14px] font-medium text-plum" onClick={() => setRooms([...rooms, { name: '', count: 5, sleeps: 3 }])}><Plus size={16} /> Another room type</button>
          <p className="text-[13px] text-muted">We’ll count these rooms for {fmtDay(addDays(data.wedding.startDate, -1))} to {fmtDay(addDays(data.wedding.endDate, 1))}. Change later if needed.</p>
        </div>
        <button className="btn-primary !min-h-[52px] text-[16px]" disabled={!ok} style={{ opacity: ok ? 1 : 0.5 }} onClick={save}>Save hotel</button>
      </div>
    </Modal>
  )
}
