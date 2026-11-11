import clsx from 'clsx'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import RsvpHero from '../components/RsvpHero'
import { templateById, templateStyle } from '../lib/templates'
import type { Guest, NeedsRoom, Rsvp, TravelMode } from '../data/types'
import { fmtDow, fmtTime } from '../lib/dates'
import { useStore } from '../store'

const gutter = { paddingLeft: 'max(16px, env(safe-area-inset-left, 0px))', paddingRight: 'max(16px, env(safe-area-inset-right, 0px))' }

/** The chosen RSVP design: ?design=<id> previews one without saving it. */
export function useRsvpDesign() {
  const { data } = useStore()
  const [sp] = useSearchParams()
  const preview = sp.get('design')
  return { t: templateById(preview ?? data.wedding.rsvpTemplate), preview, search: preview ? `?design=${preview}` : '' }
}

export function GuestFrame({ children, compact }: { children: React.ReactNode; compact?: boolean }) {
  const { data, dispatch } = useStore()
  const { t, preview } = useRsvpDesign()
  const nav = useNavigate()
  const inUse = data.wedding.rsvpTemplate === t.id
  return (
    <div className="invite min-h-screen overflow-x-hidden" style={templateStyle(t)}>
      {preview && (
        <div className="sticky top-0 z-20 flex items-center justify-between gap-2 bg-[rgb(22_17_20/0.92)] px-4 py-2 text-[13px] text-white backdrop-blur" style={{ paddingTop: 'max(8px, env(safe-area-inset-top, 0px))' }}>
          <Link to="/app/invitations/design" className="inline-flex items-center gap-1.5 font-medium"><ArrowLeft size={15} /> Designs</Link>
          <span className="truncate opacity-80">Preview: {t.name}</span>
          {inUse ? <span className="rounded-full bg-white/15 px-3 py-1 font-medium">In use</span>
            : <button type="button" className="rounded-full bg-white px-3 py-1 font-semibold text-[rgb(22_17_20)]" onClick={() => { dispatch({ type: 'wedding/template', id: t.id }); nav('/app/invitations/design') }}>Use this</button>}
        </div>
      )}
      <RsvpHero t={t} bride={data.wedding.brideName.split(' ')[0]} groom={data.wedding.groomName.split(' ')[0]} venue={data.wedding.venueName} city={data.wedding.city} compact={compact} />
      <div className="relative mx-auto max-w-[520px] py-5 pb-16" style={gutter}>{children}</div>
    </div>
  )
}

function Choice<T extends string>({ value, options, onChange, name, size = 'md' }: { value: T; options: { v: T; label: string }[]; onChange: (v: T) => void; name: string; size?: 'md' | 'lg' }) {
  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }} role="radiogroup" aria-label={name}>
      {options.map((o) => (
        <button key={o.v} type="button" role="radio" aria-checked={value === o.v} onClick={() => onChange(o.v)}
          className={clsx('rounded-full border px-2 font-medium transition-colors', size === 'lg' ? 'min-h-[52px] text-[16px]' : 'min-h-[44px] text-[14.5px]',
            value === o.v ? 'border-plum bg-plum text-onplum shadow-[0_0_0_1px_rgb(var(--gold)/0.6)_inset]' : 'border-[rgb(var(--gold)/0.35)] bg-surface text-ink hover:bg-sunk')}>
          {o.label}
        </button>
      ))}
    </div>
  )
}

const steps = ['Who’s coming', 'Your stay', 'Send']

export default function GuestForm() {
  const { householdId = 'h02' } = useParams()
  const { data, dispatch } = useStore()
  const { search } = useRsvpDesign()
  const nav = useNavigate()
  const household = data.households.find((h) => h.id === householdId)
  const fns = data.functions.filter((f) => f.isPublished)
  const [step, setStep] = useState(0)
  const [people, setPeople] = useState<Guest[]>(() => data.guests.filter((g) => g.householdId === householdId).map((g) => ({ ...g, attendance: { ...g.attendance }, stay: { ...g.stay }, travel: { ...g.travel } })))
  const [showFns, setShowFns] = useState(false)
  const [showTravel, setShowTravel] = useState(false)
  const [message, setMessage] = useState('')

  if (!household) return <GuestFrame><p>This link is no longer active. Please ask the couple for a new one.</p></GuestFrame>
  const family = household.name.replace(/ \(.*\)/, '')
  const lead = people[0]
  const set = (id: string, patch: Partial<Guest>) => setPeople((ps) => ps.map((p) => (p.id === id ? { ...p, ...patch } : p)))
  const setAll = (patch: (p: Guest) => Partial<Guest>) => setPeople((ps) => ps.map((p) => ({ ...p, ...patch(p) })))
  const answer = (p: Guest, v: Rsvp): Partial<Guest> => ({ rsvp: v, attendance: Object.fromEntries(fns.map((f) => [f.id, v === 'NO' ? 'NO' : !p.attendance[f.id] || p.attendance[f.id] === 'PENDING' || p.attendance[f.id] === 'MAYBE' || p.attendance[f.id] === 'NO' && p.rsvp === 'NO' ? 'YES' : p.attendance[f.id]])) })
  const coming = people.filter((p) => p.rsvp === 'YES' || p.rsvp === 'MAYBE')
  const anyComing = coming.length > 0
  const unanswered = people.some((p) => p.rsvp === 'PENDING')
  const fnsAll = coming.every((p) => fns.every((f) => p.attendance[f.id] === 'YES'))

  const travel = lead.travel
  const stay = lead.stay
  const setTravel = (t: Partial<Guest['travel']>) => setAll((p) => ({ travel: { ...p.travel, ...t } }))
  const setStay = (st: Partial<Guest['stay']>) => setAll((p) => ({ stay: p.rsvp === 'NO' ? { needs: 'NO' } : { ...p.stay, ...st } }))
  // One pair of dates drives both travel and the room request.
  const arrive = stay.checkIn ?? travel.arrivalDate ?? ''
  const leave = stay.checkOut ?? travel.departureDate ?? ''
  const setDates = (a: string, l: string) => setAll((p) => ({ travel: { ...p.travel, arrivalDate: a || undefined, departureDate: l || undefined }, stay: p.rsvp === 'NO' ? { needs: 'NO' } : { ...p.stay, checkIn: a || undefined, checkOut: l || undefined } }))
  const datesBad = !!arrive && !!leave && leave <= arrive
  const stayBlocked = stay.needs === 'YES' && (!arrive || !leave || datesBad)

  const go = (n: number) => { setStep(n); window.scrollTo(0, 0) }
  const next = () => go(step === 0 && !anyComing ? 2 : step + 1)
  const submit = () => {
    dispatch({ type: 'guest/respond', householdId, guests: people.map((p) => ({ ...p, attendance: Object.fromEntries(fns.map((f) => [f.id, p.rsvp === 'NO' ? 'NO' : p.attendance[f.id] ?? 'PENDING'])) })) })
    nav(`/g/${householdId}/done${search}`)
  }
  const blocked = (step === 0 && unanswered) || (step === 1 && stayBlocked)
  const h1 = 'font-head text-[28px] leading-[1.1] font-semibold'

  return (
    <GuestFrame compact={step > 0}>
      <div className="mb-5 flex items-center justify-center gap-2 text-[12.5px] text-muted" aria-label={`Step ${step + 1} of 3`}>
        {steps.map((s, i) => (
          <span key={s} className="flex items-center gap-2">
            <span className={clsx('grid h-6 w-6 place-items-center rounded-full text-[12px] font-semibold num', i < step ? 'bg-plum text-onplum' : i === step ? 'bg-[rgb(var(--gold))] text-white' : 'bg-sunk text-muted')}>{i < step ? <Check size={13} /> : i + 1}</span>
            <span className={clsx('hidden min-[400px]:inline', i === step && 'text-ink font-medium')}>{s}</span>
            {i < 2 && <span className="h-px w-4 bg-[rgb(var(--gold)/0.5)]" />}
          </span>
        ))}
      </div>

      {step === 0 && (
        <section className="flex flex-col gap-4">
          <div className="text-center">
            <h2 className={h1}>Namaste {lead.firstName} ji</h2>
            <p className="mt-1 text-muted">Will the {family} be joining us?</p>
          </div>
          {people.length > 1 && (
            <button type="button" className="btn-ghost self-center" onClick={() => setPeople((ps) => ps.map((p) => ({ ...p, ...answer(p, 'YES') })))}>
              <Check size={16} /> Yes, all {people.length} of us are coming
            </button>
          )}
          <div className="card divide-y divide-[rgb(var(--gold)/0.25)]">
            {people.map((p) => (
              <div key={p.id} className="p-4 flex flex-col gap-2.5">
                <div className="font-semibold text-[15.5px]">{p.firstName} {p.lastName}{p.type === 'CHILD' && <span className="ml-2 text-[12px] font-normal text-muted">child</span>}</div>
                <Choice name={`Is ${p.firstName} coming`} value={p.rsvp === 'PENDING' ? ('' as Rsvp) : p.rsvp} onChange={(v) => set(p.id, answer(p, v))}
                  options={[{ v: 'YES', label: 'Yes' }, { v: 'NO', label: 'No' }, { v: 'MAYBE', label: 'Not sure' }]} />
              </div>
            ))}
          </div>
          {anyComing && (
            <div className="card p-4">
              <button type="button" className="flex w-full items-center justify-between gap-3 text-left" aria-expanded={showFns} onClick={() => setShowFns(!showFns)}>
                <span><span className="font-semibold">{fnsAll ? `Coming to all ${fns.length} functions` : 'Coming to some functions'}</span><span className="block text-[13px] text-muted">{fns.map((f) => f.name).join(', ')}</span></span>
                <span className="shrink-0 text-[13.5px] font-medium text-plum">{showFns ? 'Done' : 'Change'}</span>
              </button>
              {showFns && (
                <div className="mt-3 flex flex-col gap-3 border-t border-[rgb(var(--gold)/0.25)] pt-3">
                  {fns.map((f) => (
                    <div key={f.id}>
                      <div className="text-[14px]"><span className="font-semibold">{f.name}</span> <span className="text-muted">· {fmtDow(f.date)}, {fmtTime(f.startTime)}</span></div>
                      <div className="mt-1.5 flex flex-wrap gap-2">
                        {coming.map((p) => {
                          const on = p.attendance[f.id] === 'YES'
                          return (
                            <button key={p.id} type="button" aria-pressed={on} onClick={() => set(p.id, { attendance: { ...p.attendance, [f.id]: on ? 'NO' : 'YES' } })}
                              className={clsx('inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13.5px] min-h-[38px]', on ? 'border-plum/40 bg-plumsoft text-plum' : 'border-[rgb(var(--gold)/0.35)] bg-surface text-muted line-through')}>
                              {on && <Check size={14} />}{p.firstName}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {step === 1 && (
        <section className="flex flex-col gap-4">
          <div className="text-center">
            <h2 className={h1}>Do you need a room?</h2>
            <p className="mt-1 text-muted">The couple is arranging hotels for guests coming from out of town.</p>
          </div>
          <Choice size="lg" name="Need a room" value={stay.needs} onChange={(v: NeedsRoom) => setStay({ needs: v })}
            options={[{ v: 'YES', label: 'Yes please' }, { v: 'NO', label: 'No' }, { v: 'UNSURE', label: 'Not sure' }]} />
          <div className="card p-4 flex flex-col gap-3">
            <div className="font-semibold">When are you in {data.wedding.city}?</div>
            <div className="grid grid-cols-2 gap-3">
              <div><label htmlFor="arrive" className="label">Arriving</label><input id="arrive" type="date" className="input" min="2026-12-08" max="2026-12-16" value={arrive} onChange={(e) => setDates(e.target.value, leave)} /></div>
              <div><label htmlFor="leave" className="label">Leaving</label><input id="leave" type="date" className="input" min="2026-12-09" max="2026-12-17" value={leave} onChange={(e) => setDates(arrive, e.target.value)} /></div>
            </div>
            {datesBad && <p className="text-[13px] text-bad">The leaving date needs to be after you arrive.</p>}
            {stay.needs === 'YES' && (!arrive || !leave) && <p className="text-[13px] text-muted">Add both dates so we know which nights you need.</p>}
            <button type="button" className="self-start text-[13.5px] font-medium text-plum" aria-expanded={showTravel} onClick={() => setShowTravel(!showTravel)}>
              {showTravel ? 'Hide travel details' : '+ Add flight or train details (optional)'}
            </button>
            {showTravel && (
              <div className="flex flex-col gap-3 border-t border-[rgb(var(--gold)/0.25)] pt-3">
                <Choice name="Arriving by" value={(travel.arrivalMode ?? '') as TravelMode} onChange={(v) => setTravel({ arrivalMode: v })}
                  options={[{ v: 'FLIGHT', label: 'Flight' }, { v: 'TRAIN', label: 'Train' }, { v: 'CAR', label: 'Road' }]} />
                <div className="grid grid-cols-2 gap-3">
                  <div><label htmlFor="arr-time" className="label">Arrival time</label><input id="arr-time" type="time" className="input" value={travel.arrivalTime ?? ''} onChange={(e) => setTravel({ arrivalTime: e.target.value })} /></div>
                  <div><label htmlFor="arr-no" className="label">Flight / train no.</label><input id="arr-no" className="input" placeholder="6E 2241" value={travel.arrivalNumber ?? ''} onChange={(e) => setTravel({ arrivalNumber: e.target.value })} /></div>
                </div>
              </div>
            )}
          </div>
          {stay.needs === 'YES' && (
            <div><label htmlFor="special" className="label">Anything we should know? (optional)</label><input id="special" className="input" placeholder="e.g. ground floor for grandparents" value={stay.special ?? ''} onChange={(e) => setStay({ special: e.target.value })} /></div>
          )}
        </section>
      )}

      {step === 2 && (
        <section className="flex flex-col gap-4">
          <div className="text-center"><h2 className={h1}>All set to send?</h2></div>
          <div className="card divide-y divide-[rgb(var(--gold)/0.25)] text-[14.5px]">
            {people.map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <span>{p.firstName} {p.lastName}</span>
                <span className={clsx('font-medium', p.rsvp === 'YES' ? 'text-good' : p.rsvp === 'NO' ? 'text-muted' : 'text-warn')}>{p.rsvp === 'YES' ? 'Coming' : p.rsvp === 'NO' ? 'Can’t come' : 'Not sure'}</span>
              </div>
            ))}
            {anyComing && (
              <div className="px-4 py-3 text-muted">
                {stay.needs === 'YES' ? `Room needed, ${fmtDow(arrive)} to ${fmtDow(leave)}` : stay.needs === 'UNSURE' ? 'Not sure about a room yet' : 'No room needed'}
                {stay.needs !== 'YES' && arrive ? ` · arriving ${fmtDow(arrive)}` : ''}
              </div>
            )}
          </div>
          <div><label htmlFor="msg" className="label">A note for {data.wedding.brideName.split(' ')[0]} &amp; {data.wedding.groomName.split(' ')[0]} (optional)</label><textarea id="msg" className="input min-h-[80px]" value={message} onChange={(e) => setMessage(e.target.value)} /></div>
          <p className="text-center text-[12.5px] text-muted">Only the couple and family helping them plan will see this. You can change your reply from this same link until 25 Nov.</p>
        </section>
      )}

      <div className="sticky bottom-0 z-10 -mx-4 mt-6 flex gap-3 border-t border-line/70 bg-bg/90 px-4 pt-3 backdrop-blur-xl sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:pt-0 sm:backdrop-blur-none" style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom, 0px))' }}>
        {step > 0 && <button type="button" className="btn-ghost" onClick={() => go(step === 2 && !anyComing ? 0 : step - 1)} aria-label="Back"><ArrowLeft size={16} /></button>}
        {step < 2 ? (
          <button type="button" className="btn-primary flex-1 !min-h-[48px] text-[15px]" onClick={next} disabled={blocked} style={{ opacity: blocked ? 0.5 : 1 }}>Continue <ArrowRight size={16} /></button>
        ) : (
          <button type="button" className="btn-primary flex-1 !min-h-[48px] text-[15px]" onClick={submit}>Send RSVP</button>
        )}
      </div>
      {step === 0 && unanswered && <p className="mt-2 text-center text-[12.5px] text-muted">Pick an answer for each person to continue.</p>}
      <p className="mt-6 text-center text-[12px] text-muted"><Link to="/app/invitations" className="underline">Back to the couple's dashboard</Link> (prototype only)</p>
    </GuestFrame>
  )
}
