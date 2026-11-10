import clsx from 'clsx'
import { ArrowLeft, ArrowRight, Check, Plus } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Mark } from '../components/AppShell'
import type { Guest, NeedsRoom, Rsvp, TravelMode } from '../data/types'
import { fmtDow, fmtTime } from '../lib/dates'
import { useStore } from '../store'

const gutter = { paddingLeft: 'max(16px, env(safe-area-inset-left, 0px))', paddingRight: 'max(16px, env(safe-area-inset-right, 0px))' }
const steps = ['Your family', 'Functions', 'Travel', 'Stay', 'Finish']

export function GuestFrame({ children }: { children: React.ReactNode }) {
  const { data } = useStore()
  return (
    <div className="min-h-full bg-bg">
      <div className="bg-plum text-onplum" style={gutter}>
        <div className="mx-auto max-w-[560px] py-5">
          <div className="flex items-center gap-2 text-[12px] opacity-80"><Mark className="h-4 w-4" /> Shared privately with you via WeddingStay</div>
          <div className="mt-2 font-display text-[28px] font-semibold leading-tight">{data.wedding.brideName.split(' ')[0]} &amp; {data.wedding.groomName.split(' ')[0]}</div>
          <div className="text-[14px] opacity-90">{data.wedding.venueName}, {data.wedding.city} · 11 to 13 December 2026</div>
        </div>
      </div>
      <div className="mx-auto max-w-[560px] py-5 pb-16" style={gutter}>{children}</div>
    </div>
  )
}

function Choice<T extends string>({ value, options, onChange, name }: { value: T; options: { v: T; label: string }[]; onChange: (v: T) => void; name: string }) {
  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }} role="radiogroup" aria-label={name}>
      {options.map((o) => (
        <button key={o.v} type="button" role="radio" aria-checked={value === o.v} onClick={() => onChange(o.v)}
          className={clsx('rounded-lg border px-2 py-2.5 text-[14px] font-medium min-h-[44px]', value === o.v ? 'border-plum bg-plumsoft text-plum' : 'border-line bg-surface text-ink')}>
          {o.label}
        </button>
      ))}
    </div>
  )
}

export default function GuestForm() {
  const { householdId = 'h02' } = useParams()
  const { data, dispatch } = useStore()
  const nav = useNavigate()
  const household = data.households.find((h) => h.id === householdId)
  const [step, setStep] = useState(0)
  const [people, setPeople] = useState<Guest[]>(() => data.guests.filter((g) => g.householdId === householdId).map((g) => ({ ...g, attendance: { ...g.attendance }, stay: { ...g.stay }, travel: { ...g.travel } })))
  const [consent, setConsent] = useState(false)
  const [message, setMessage] = useState('')
  const fns = data.functions.filter((f) => f.isPublished)

  if (!household) return <GuestFrame><p>This link is no longer active. Please ask the couple for a new one.</p></GuestFrame>
  const lead = people[0]
  const set = (id: string, patch: Partial<Guest>) => setPeople((ps) => ps.map((p) => (p.id === id ? { ...p, ...patch } : p)))
  const setAll = (patch: (p: Guest) => Partial<Guest>) => setPeople((ps) => ps.map((p) => ({ ...p, ...patch(p) })))
  const coming = people.filter((p) => p.rsvp === 'YES' || p.rsvp === 'MAYBE')
  const anyComing = coming.length > 0

  const travel = lead.travel
  const stay = lead.stay
  const setTravel = (t: Partial<Guest['travel']>) => setAll((p) => ({ travel: { ...p.travel, ...t } }))
  const setStay = (s: Partial<Guest['stay']>) => setAll((p) => ({ stay: p.rsvp === 'NO' ? { needs: 'NO' } : { ...p.stay, ...s } }))

  const next = () => {
    if (step === 0 && !anyComing) return setStep(4) // nobody coming: skip travel and stay
    setStep((s) => Math.min(4, s + 1))
    window.scrollTo(0, 0)
  }
  const submit = () => {
    dispatch({ type: 'guest/respond', householdId, guests: people.map((p) => ({ ...p, attendance: Object.fromEntries(fns.map((f) => [f.id, p.rsvp === 'NO' ? 'NO' : p.attendance[f.id] ?? 'PENDING'])) })) })
    nav(`/g/${householdId}/done`)
  }

  return (
    <GuestFrame>
      <div className="mb-5">
        <div className="flex gap-1.5" aria-hidden="true">{steps.map((s, i) => <div key={s} className={clsx('h-1.5 flex-1 rounded-full', i <= step ? 'bg-plum' : 'bg-line')} />)}</div>
        <div className="mt-2 text-[12.5px] text-muted">Step {step + 1} of 5 · {steps[step]}</div>
      </div>

      {step === 0 && (
        <section className="flex flex-col gap-4">
          <div>
            <h1 className="font-display text-[24px] font-semibold">Namaste {lead.firstName}, who from the {household.name.replace(/ \(.*\)/, '')} is coming?</h1>
            <p className="mt-1 text-muted">You can answer for everyone in your family. Each person's reply is kept separately.</p>
          </div>
          {people.map((p) => (
            <div key={p.id} className="card p-4">
              <div className="flex items-center justify-between gap-2 mb-3"><div className="font-semibold">{p.firstName} {p.lastName}</div>{p.type === 'CHILD' && <span className="text-[12px] text-muted">Child</span>}</div>
              <Choice name={`Is ${p.firstName} attending`} value={p.rsvp === 'PENDING' ? ('' as Rsvp) : p.rsvp} onChange={(v) => set(p.id, { rsvp: v })}
                options={[{ v: 'YES', label: 'Coming' }, { v: 'MAYBE', label: 'Maybe' }, { v: 'NO', label: 'Can’t come' }]} />
            </div>
          ))}
          <button type="button" className="btn-ghost self-start"><Plus size={16} /> Add a family member</button>
        </section>
      )}

      {step === 1 && (
        <section className="flex flex-col gap-4">
          <div><h1 className="font-display text-[24px] font-semibold">Which functions will you attend?</h1><p className="mt-1 text-muted">Tap a name to change it for that person.</p></div>
          {fns.map((f) => (
            <div key={f.id} className="card p-4">
              <div className="flex items-baseline justify-between gap-2"><div className="font-semibold text-[16px]">{f.name}</div><div className="text-[12.5px] text-muted">{fmtDow(f.date)}, {fmtTime(f.startTime)}</div></div>
              <div className="text-[12.5px] text-muted mt-0.5">{f.venueName}{f.dressCode ? ` · ${f.dressCode}` : ''}</div>
              <div className="mt-3 flex flex-wrap gap-2">
                {coming.map((p) => {
                  const on = (p.attendance[f.id] ?? 'PENDING') === 'YES'
                  return (
                    <button key={p.id} type="button" aria-pressed={on} onClick={() => set(p.id, { attendance: { ...p.attendance, [f.id]: on ? 'NO' : 'YES' } })}
                      className={clsx('inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-[13.5px] min-h-[40px]', on ? 'border-good/40 bg-good/10 text-good' : 'border-line bg-surface text-muted')}>
                      {on && <Check size={14} />}{p.firstName}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </section>
      )}

      {step === 2 && (
        <section className="flex flex-col gap-4">
          <div><h1 className="font-display text-[24px] font-semibold">How are you travelling to Udaipur?</h1><p className="mt-1 text-muted">Rough times are fine. You can update this later from the same link.</p></div>
          <div className="card p-4 flex flex-col gap-4">
            <div><label htmlFor="dep-city" className="label">Travelling from</label><input id="dep-city" className="input" value={travel.departureCity ?? household.city} onChange={(e) => setTravel({ departureCity: e.target.value })} /></div>
            <div>
              <div className="label">Arriving by</div>
              <Choice name="Arrival mode" value={(travel.arrivalMode ?? '') as TravelMode} onChange={(v) => setTravel({ arrivalMode: v })}
                options={[{ v: 'FLIGHT', label: 'Flight' }, { v: 'TRAIN', label: 'Train' }, { v: 'CAR', label: 'Road' }]} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label htmlFor="arr-date" className="label">Arrival date</label><input id="arr-date" type="date" className="input" value={travel.arrivalDate ?? ''} onChange={(e) => setTravel({ arrivalDate: e.target.value })} /></div>
              <div><label htmlFor="arr-time" className="label">Time (if known)</label><input id="arr-time" type="time" className="input" value={travel.arrivalTime ?? ''} onChange={(e) => setTravel({ arrivalTime: e.target.value })} /></div>
            </div>
            {travel.arrivalMode && travel.arrivalMode !== 'CAR' && (
              <div><label htmlFor="arr-no" className="label">{travel.arrivalMode === 'FLIGHT' ? 'Flight number' : 'Train number'} (optional)</label><input id="arr-no" className="input" placeholder={travel.arrivalMode === 'FLIGHT' ? 'e.g. 6E 2241' : 'e.g. 12963'} value={travel.arrivalNumber ?? ''} onChange={(e) => setTravel({ arrivalNumber: e.target.value })} /></div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div><label htmlFor="dep-date" className="label">Leaving on</label><input id="dep-date" type="date" className="input" value={travel.departureDate ?? ''} onChange={(e) => setTravel({ departureDate: e.target.value })} /></div>
              <div><label htmlFor="dep-time" className="label">Time (if known)</label><input id="dep-time" type="time" className="input" value={travel.departureTime ?? ''} onChange={(e) => setTravel({ departureTime: e.target.value })} /></div>
            </div>
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="flex flex-col gap-4">
          <div><h1 className="font-display text-[24px] font-semibold">Do you need a place to stay?</h1><p className="mt-1 text-muted">The couple is arranging rooms for outstation guests. They'll confirm your room before the wedding.</p></div>
          <div className="card p-4 flex flex-col gap-4">
            <Choice name="Need accommodation" value={stay.needs} onChange={(v: NeedsRoom) => setStay({ needs: v, ...(v === 'YES' && !stay.checkIn ? { checkIn: travel.arrivalDate ?? '2026-12-11', checkOut: travel.departureDate ?? '2026-12-14' } : {}) })}
              options={[{ v: 'YES', label: 'Yes please' }, { v: 'NO', label: 'No' }, { v: 'UNSURE', label: 'Not sure' }]} />
            {stay.needs === 'YES' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div><label htmlFor="ci" className="label">Check-in</label><input id="ci" type="date" className="input" value={stay.checkIn ?? ''} onChange={(e) => setStay({ checkIn: e.target.value })} /></div>
                  <div><label htmlFor="co" className="label">Check-out</label><input id="co" type="date" className="input" value={stay.checkOut ?? ''} onChange={(e) => setStay({ checkOut: e.target.value })} /></div>
                </div>
                {stay.checkIn && stay.checkOut && stay.checkOut <= stay.checkIn && <p className="text-[13px] text-bad">Check-out needs to be after check-in.</p>}
                <div className="text-[13px] text-muted">For {coming.filter((p) => p.type === 'ADULT').length} adults{coming.some((p) => p.type === 'CHILD') ? ` and ${coming.filter((p) => p.type === 'CHILD').length} children` : ''}</div>
                <div><label htmlFor="special" className="label">Anything we should know? (optional)</label><input id="special" className="input" placeholder="e.g. ground floor for grandparents" value={stay.special ?? ''} onChange={(e) => setStay({ special: e.target.value })} /></div>
              </>
            )}
          </div>
        </section>
      )}

      {step === 4 && (
        <section className="flex flex-col gap-4">
          <div><h1 className="font-display text-[24px] font-semibold">Almost done</h1></div>
          <div className="card p-4 text-[14px] flex flex-col gap-1.5">
            <div><span className="font-semibold">{people.filter((p) => p.rsvp === 'YES').length}</span> coming{people.some((p) => p.rsvp === 'MAYBE') ? `, ${people.filter((p) => p.rsvp === 'MAYBE').length} maybe` : ''}{people.some((p) => p.rsvp === 'NO') ? `, ${people.filter((p) => p.rsvp === 'NO').length} can’t make it` : ''}</div>
            {anyComing && travel.arrivalDate && <div className="text-muted">Arriving {fmtDow(travel.arrivalDate)}{travel.arrivalTime ? `, ${fmtTime(travel.arrivalTime)}` : ''}{travel.arrivalNumber ? ` on ${travel.arrivalNumber}` : ''}</div>}
            {anyComing && <div className="text-muted">{stay.needs === 'YES' ? `Room needed ${fmtDow(stay.checkIn!)} to ${fmtDow(stay.checkOut!)}` : stay.needs === 'UNSURE' ? 'Not sure about a room yet' : 'No room needed'}</div>}
          </div>
          <div><label htmlFor="msg" className="label">A note for Ananya &amp; Rohan (optional)</label><textarea id="msg" className="input min-h-[90px]" value={message} onChange={(e) => setMessage(e.target.value)} /></div>
          <label className="flex gap-3 items-start text-[13.5px]">
            <input id="consent" type="checkbox" className="mt-1 h-4 w-4 accent-[rgb(var(--plum))]" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
            <span>I understand these details are shared only with the couple and the family members helping them plan.</span>
          </label>
        </section>
      )}

      <div className="mt-6 flex gap-3">
        {step > 0 && <button type="button" className="btn-ghost" onClick={() => setStep(step === 4 && !anyComing ? 0 : step - 1)}><ArrowLeft size={16} /> Back</button>}
        {step < 4 ? (
          <button type="button" className="btn-primary flex-1" onClick={next} disabled={step === 0 && people.some((p) => p.rsvp === 'PENDING')} style={{ opacity: step === 0 && people.some((p) => p.rsvp === 'PENDING') ? 0.5 : 1 }}>Continue <ArrowRight size={16} /></button>
        ) : (
          <button type="button" className="btn-primary flex-1" onClick={submit} disabled={!consent} style={{ opacity: consent ? 1 : 0.5 }}>Send to the couple</button>
        )}
      </div>
      {step === 0 && people.some((p) => p.rsvp === 'PENDING') && <p className="mt-2 text-[12.5px] text-muted">Choose an answer for each person to continue.</p>}
      <p className="mt-6 text-center text-[12px] text-muted"><Link to="/app/invitations" className="underline">Back to the couple's dashboard</Link> (prototype only)</p>
    </GuestFrame>
  )
}
