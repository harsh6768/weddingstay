import clsx from 'clsx'
import { ArrowRight, Check, ChevronRight, FileSpreadsheet, Palette, Phone, Plus, Search, Upload, Users } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ChatBubble, Chips, Choices, Modal, Pill, Stepper, WhatsAppButton } from '../components/ui'
import type { Guest, Household, Side } from '../data/types'
import { familyInfo, inviteText, reminderText, replyText, sideHint, sideName, waUrl, type ReplyState } from '../lib/family'
import { shortRange } from '../lib/family'
import { useStore } from '../store'

// Guests and invitations in one place. The unit is a family: add a family, send them their link on
// WhatsApp, see who's coming. No tables, no dropdown filters.

type Show = 'all' | 'not-sent' | 'waiting' | 'coming' | 'not-coming' | 'room'
const replyTone: Record<ReplyState, 'neutral' | 'info' | 'good' | 'warn'> = { 'not-sent': 'neutral', waiting: 'warn', coming: 'good', 'not-coming': 'neutral' }

export default function Guests() {
  const { data, dispatch } = useStore()
  const [sp, setSp] = useSearchParams()
  const show = (sp.get('show') as Show) || 'all'
  const setShow = (v: Show) => setSp(v === 'all' ? {} : { show: v }, { replace: true })
  const [q, setQ] = useState('')
  const [open, setOpen] = useState<string | null>(null)
  const [adding, setAdding] = useState(sp.get('add') === '1')
  const [importing, setImporting] = useState(false)
  const [queue, setQueue] = useState<string[] | null>(null)

  const fams = useMemo(() => data.households.map((h) => ({ h, ...familyInfo(data, h) })), [data])
  const match = (f: (typeof fams)[number], s: Show) =>
    s === 'all' || (s === 'room' ? f.needRoom.length > 0 : f.reply === s)
  const t = q.trim().toLowerCase()
  const list = fams.filter((f) => match(f, show) && (!t || `${f.h.name} ${f.people.map((p) => p.firstName + ' ' + p.lastName).join(' ')}`.toLowerCase().includes(t)))
  const count = (s: Show) => fams.filter((f) => match(f, s)).length
  const markSent = (h: Household) => h.invitation === 'NOT_SENT' && dispatch({ type: 'invitation/state', householdId: h.id, state: 'SENT' })

  if (fams.length === 0) {
    return (
      <>
        <Header onAdd={() => setAdding(true)} sub="Nobody added yet" />
        <section className="card mx-auto max-w-[560px] px-6 py-10 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-plumsoft text-plum"><Users size={30} /></div>
          <h2 className="mt-4 font-display text-[26px] font-semibold leading-tight">Add the families you’re inviting</h2>
          <p className="mx-auto mt-2 max-w-[38ch] text-[15px] text-muted">Add one family at a time: a name, whose side, and a WhatsApp number. They’ll fill in the rest themselves.</p>
          <button className="btn-primary mt-6 w-full !min-h-[52px] text-[16px]" onClick={() => setAdding(true)}><Plus size={18} /> Add a family</button>
          <button className="btn-ghost mt-2.5 w-full !min-h-[48px]" onClick={() => setImporting(true)}><Upload size={16} /> I have an Excel list</button>
        </section>
        <AddFamily open={adding} onClose={() => setAdding(false)} />
        <ImportSheet open={importing} onClose={() => setImporting(false)} />
      </>
    )
  }

  const bulk = show === 'not-sent' || show === 'waiting' ? list : []
  return (
    <>
      <Header onAdd={() => setAdding(true)} sub={`${fams.length} families · ${data.guests.length} people`} />

      <div className="mb-3 flex gap-2">
        <label className="relative flex-1">
          <span className="sr-only">Search</span>
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input className="input !min-h-[48px] !pl-10" placeholder="Search a name" value={q} onChange={(e) => setQ(e.target.value)} />
        </label>
      </div>
      <Chips label="Show" value={show} onChange={setShow} options={[
        { v: 'all', label: 'All', count: fams.length },
        { v: 'not-sent', label: 'Invite not sent', count: count('not-sent') },
        { v: 'waiting', label: 'Not replied', count: count('waiting') },
        { v: 'coming', label: 'Coming', count: count('coming') },
        { v: 'room', label: 'Need a room', count: count('room') },
        { v: 'not-coming', label: 'Not coming', count: count('not-coming') },
      ]} />

      {bulk.length > 1 && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#1f9d55]/30 bg-[#1f9d55]/10 p-4">
          <div className="min-w-0"><div className="font-semibold text-[15px]">{show === 'not-sent' ? `Send the invite to all ${bulk.length}` : `Remind all ${bulk.length} families`}</div><div className="text-[13px] text-muted">We’ll open WhatsApp for each family, one after another.</div></div>
          <button className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full bg-[#1f9d55] px-5 font-semibold text-white sm:w-auto" onClick={() => setQueue(bulk.map((f) => f.h.id))}>Start <ArrowRight size={17} /></button>
        </div>
      )}

      <ul className="mt-4 grid gap-2.5 md:grid-cols-2">
        {list.map((f) => (
          <li key={f.h.id} className="card overflow-hidden">
            <button className="flex w-full items-center gap-3 p-4 text-left" onClick={() => setOpen(f.h.id)}>
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-plumsoft font-display text-[18px] font-semibold text-plum">{f.h.name[0]}</div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[16px] font-semibold">{f.h.name}</div>
                <div className="truncate text-[13px] text-muted">{f.people.length} {f.people.length === 1 ? 'person' : 'people'} · {sideName[f.h.side]}</div>
              </div>
              <ChevronRight size={18} className="shrink-0 text-muted" />
            </button>
            <div className="flex items-center justify-between gap-2 border-t border-line px-4 py-2.5">
              <div className="min-w-0 text-[13.5px]">
                <Pill tone={replyTone[f.reply]} dot>{f.reply === 'coming' ? `${f.coming.length} of ${f.people.length} coming` : replyText[f.reply]}</Pill>
                {f.needRoom.length > 0 && <span className="ml-2 text-muted">needs room</span>}
              </div>
              {f.reply === 'not-sent' ? (
                <WhatsAppButton small href={waUrl(f.contact?.phone, inviteText(data, f.h))} onClick={() => markSent(f.h)} className="!min-h-[40px] !px-3.5 !text-[13.5px]">Send invite</WhatsAppButton>
              ) : f.reply === 'waiting' ? (
                <a className="btn-ghost !min-h-[40px] !px-3.5 !text-[13.5px]" href={waUrl(f.contact?.phone, reminderText(data, f.h))} target="_blank" rel="noreferrer">Remind</a>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
      {list.length === 0 && <p className="mt-10 text-center text-[15px] text-muted">{show === 'waiting' || show === 'not-sent' ? 'Nobody here. Everyone has their invite and has replied. 🎉' : 'No families match.'}</p>}

      <div className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2 text-[14px]">
        <button className="inline-flex min-h-[44px] items-center gap-1.5 font-medium text-plum" onClick={() => setImporting(true)}><Upload size={16} /> Add from Excel</button>
        <Link to="/app/invitations/design" className="inline-flex min-h-[44px] items-center gap-1.5 font-medium text-plum"><Palette size={16} /> Change invite design</Link>
      </div>

      <FamilySheet id={open} onClose={() => setOpen(null)} />
      <AddFamily open={adding} onClose={() => { setAdding(false); if (sp.get('add')) setSp({}, { replace: true }) }} />
      <ImportSheet open={importing} onClose={() => setImporting(false)} />
      <SendQueue ids={queue} mode={show === 'not-sent' ? 'invite' : 'remind'} onClose={() => setQueue(null)} />
    </>
  )
}

function Header({ onAdd, sub }: { onAdd: () => void; sub: string }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-[34px] md:text-[40px] leading-[1.05] font-semibold">Guests</h1>
        <p className="mt-0.5 text-[15px] text-muted">{sub}</p>
      </div>
      <button className="btn-primary w-full !min-h-[52px] text-[16px] sm:w-auto" onClick={onAdd}><Plus size={18} /> Add a family</button>
    </div>
  )
}

function FamilySheet({ id, onClose }: { id: string | null; onClose: () => void }) {
  const { data, dispatch } = useStore()
  const h = data.households.find((x) => x.id === id)
  if (!h) return null
  const f = familyInfo(data, h)
  const rooms = f.allocs
  const sent = h.invitation !== 'NOT_SENT'
  return (
    <Modal open onClose={onClose} title={h.name}>
      <div className="flex flex-wrap gap-2">
        <Pill tone={replyTone[f.reply]} dot>{replyText[f.reply]}</Pill>
        <Pill tone="plum">{sideName[h.side]}</Pill>
        <Pill>From {h.city}</Pill>
      </div>

      {f.contact && (
        <div className="mt-4 flex items-center gap-3 rounded-2xl bg-sunk/70 p-3">
          <div className="min-w-0 flex-1"><div className="text-[12.5px] text-muted">Main contact</div><div className="font-semibold">{f.contact.firstName} {f.contact.lastName}</div><div className="text-[13px] text-muted num">{f.contact.phone ?? 'No number yet'}</div></div>
          {f.contact.phone && <a href={`tel:${f.contact.phone.replace(/\s/g, '')}`} className="grid h-12 w-12 place-items-center rounded-full border border-line bg-surface" aria-label={`Call ${f.contact.firstName}`}><Phone size={18} /></a>}
        </div>
      )}

      <h3 className="mt-5 mb-2 text-[14px] font-semibold">Family members</h3>
      <ul className="divide-y divide-line rounded-2xl border border-line">
        {f.people.map((g: Guest) => (
          <li key={g.id} className="flex items-center justify-between gap-2 px-3.5 py-3">
            <span>{g.firstName} {g.lastName}{g.type === 'CHILD' && <span className="text-muted"> · child</span>}</span>
            <span className={clsx('text-[13.5px] font-medium', g.rsvp === 'YES' ? 'text-good' : g.rsvp === 'NO' ? 'text-muted' : g.rsvp === 'MAYBE' ? 'text-warn' : 'text-muted')}>{g.rsvp === 'YES' ? 'Coming' : g.rsvp === 'NO' ? 'Not coming' : g.rsvp === 'MAYBE' ? 'Not sure' : 'No reply'}</span>
          </li>
        ))}
      </ul>

      {(f.needRoom.length > 0 || rooms.length > 0) && (
        <>
          <h3 className="mt-5 mb-2 text-[14px] font-semibold">Stay</h3>
          <div className="rounded-2xl border border-line p-3.5 text-[14px]">
            {f.needRoom[0]?.stay.checkIn && <div>Needs a room for {f.needRoom.length}, {shortRange(f.needRoom[0].stay.checkIn!, f.needRoom[0].stay.checkOut!)}</div>}
            {f.needRoom.find((g) => g.stay.special) && <div className="text-plum">“{f.needRoom.find((g) => g.stay.special)?.stay.special}”</div>}
            {rooms.length ? rooms.map((a) => <div key={a.id} className="mt-1 text-muted">Room: {data.roomTypes.find((r) => r.id === a.roomTypeId)?.name}, {data.hotels.find((x) => x.id === a.hotelId)?.name}</div>)
              : <Link to="/app/rooms" className="mt-1 inline-flex items-center gap-1 font-medium text-plum">Give them a room <ArrowRight size={14} /></Link>}
          </div>
        </>
      )}

      <div className="mt-6 grid gap-2">
        <WhatsAppButton href={waUrl(f.contact?.phone, sent ? reminderText(data, h) : inviteText(data, h))} onClick={() => !sent && dispatch({ type: 'invitation/state', householdId: h.id, state: 'SENT' })}>
          {!sent ? 'Send invite on WhatsApp' : f.reply === 'waiting' ? 'Send a reminder' : 'Send their link again'}
        </WhatsAppButton>
        <Link to={`/g/${h.id}`} className="btn-ghost !min-h-[48px]">See what they see</Link>
      </div>
    </Modal>
  )
}

function AddFamily({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data, dispatch } = useStore()
  const [name, setName] = useState('')
  const [side, setSide] = useState<Side | ''>('')
  const [contact, setContact] = useState('')
  const [phone, setPhone] = useState('')
  const [adults, setAdults] = useState(2)
  const [kids, setKids] = useState(0)
  const [saved, setSaved] = useState<Household | null>(null)
  const ok = name.trim() && side && contact.trim()
  const reset = () => { setName(''); setSide(''); setContact(''); setPhone(''); setAdults(2); setKids(0); setSaved(null) }
  const close = () => { reset(); onClose() }

  const save = () => {
    const id = `hn${Date.now().toString(36)}`
    const [first, ...rest] = contact.trim().split(' ')
    const last = rest.join(' ') || name.trim().split(' ')[0]
    const mk = (i: number, child: boolean): Guest => ({
      id: `${id}_g${i + 1}`, householdId: id, firstName: i === 0 ? first : child ? `Child ${i - adults + 1}` : `Guest ${i + 1}`, lastName: i === 0 ? last : '',
      phone: i === 0 && phone ? `+91 ${phone}` : undefined, type: child ? 'CHILD' : 'ADULT', side: side as Side, relationship: '', tags: [], rsvp: 'PENDING', attendance: {}, stay: { needs: 'UNSURE' }, travel: {},
    })
    const guests = Array.from({ length: adults + kids }, (_, i) => mk(i, i >= adults))
    const household: Household = { id, name: name.trim(), side: side as Side, city: '', primaryContactId: guests[0].id, invitation: 'NOT_SENT' }
    dispatch({ type: 'household/add', household, guests })
    setSaved(household)
  }

  if (!open) return null
  if (saved) {
    const h = data.households.find((x) => x.id === saved.id) ?? saved
    return (
      <Modal open onClose={close} title="Family added">
        <div className="flex items-center gap-2 text-[15px] font-semibold text-good"><Check size={18} /> {h.name} added</div>
        <p className="mt-1 text-[14px] text-muted">Send them the invite now? This is the message they’ll get:</p>
        <div className="mt-3"><ChatBubble text={inviteText(data, h)} /></div>
        <div className="mt-4 grid gap-2">
          <WhatsAppButton href={waUrl(phone, inviteText(data, h))} onClick={() => dispatch({ type: 'invitation/state', householdId: h.id, state: 'SENT' })}>Send on WhatsApp</WhatsAppButton>
          <button className="btn-ghost !min-h-[48px]" onClick={() => reset()}><Plus size={16} /> Add another family</button>
          <button className="min-h-[44px] text-[14px] text-muted underline" onClick={close}>Later</button>
        </div>
      </Modal>
    )
  }
  return (
    <Modal open onClose={close} title="Add a family">
      <div className="grid gap-4">
        <div><label htmlFor="fam" className="label !text-[14px]">Family name</label><input id="fam" className="input !min-h-[50px] !text-[16px]" placeholder="e.g. Sharma family (Jaipur)" value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div>
          <div className="label !text-[14px]">Whose side?</div>
          <Choices label="Whose side" value={side} onChange={setSide} options={[{ v: 'BRIDE', label: 'Bride’s', sub: sideHint.BRIDE }, { v: 'GROOM', label: 'Groom’s', sub: sideHint.GROOM }, { v: 'MUTUAL', label: 'Both', sub: 'Friends' }]} />
        </div>
        <div><label htmlFor="contact" className="label !text-[14px]">Who should we send it to?</label><input id="contact" className="input !min-h-[50px] !text-[16px]" placeholder="e.g. Rajesh Sharma" value={contact} onChange={(e) => setContact(e.target.value)} /></div>
        <div>
          <label htmlFor="phone" className="label !text-[14px]">Their WhatsApp number</label>
          <div className="flex gap-2"><span className="input !w-auto shrink-0 !min-h-[50px] text-muted">+91</span><input id="phone" className="input !min-h-[50px] !text-[16px]" inputMode="tel" placeholder="98765 43210" value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
        </div>
        <div>
          <div className="label !text-[14px]">How many people?</div>
          <div className="grid gap-2"><Stepper label="Adults" value={adults} onChange={setAdults} min={1} /><Stepper label="Kids" value={kids} onChange={setKids} /></div>
          <p className="mt-1.5 text-[13px] text-muted">Don’t worry about names. The family fills them in when they reply.</p>
        </div>
        <button className="btn-primary !min-h-[52px] text-[16px]" disabled={!ok} style={{ opacity: ok ? 1 : 0.5 }} onClick={save}>Save family</button>
      </div>
    </Modal>
  )
}

function SendQueue({ ids, mode, onClose }: { ids: string[] | null; mode: 'invite' | 'remind'; onClose: () => void }) {
  const { data, dispatch } = useStore()
  const [i, setI] = useState(0)
  const [tapped, setTapped] = useState(false)
  if (!ids) return null
  const done = i >= ids.length
  const h = !done ? data.households.find((x) => x.id === ids[i])! : null
  const close = () => { setI(0); setTapped(false); onClose() }
  return (
    <Modal open onClose={close} title={done ? 'All done' : `${i + 1} of ${ids.length}: ${h!.name}`}>
      {done ? (
        <div className="text-center">
          <div className="text-[44px]">🎉</div>
          <p className="mt-1 text-[15px]">{mode === 'invite' ? 'Invites sent' : 'Reminders sent'} to {ids.length} families.</p>
          <button className="btn-primary mt-5 w-full !min-h-[52px]" onClick={close}>Close</button>
        </div>
      ) : (
        <>
          <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-sunk"><div className="h-full bg-[#1f9d55]" style={{ width: `${(i / ids.length) * 100}%` }} /></div>
          <ChatBubble text={mode === 'invite' ? inviteText(data, h!) : reminderText(data, h!)} />
          <div className="mt-4 grid gap-2">
            <WhatsAppButton href={waUrl(familyInfo(data, h!).contact?.phone, mode === 'invite' ? inviteText(data, h!) : reminderText(data, h!))}
              onClick={() => { setTapped(true); if (h!.invitation === 'NOT_SENT') dispatch({ type: 'invitation/state', householdId: h!.id, state: 'SENT' }) }}>
              Open WhatsApp
            </WhatsAppButton>
            <button className={clsx('!min-h-[48px]', tapped ? 'btn-primary' : 'btn-ghost')} onClick={() => { setI(i + 1); setTapped(false) }}>{tapped ? 'Sent, next family' : 'Skip this family'} <ArrowRight size={16} /></button>
          </div>
        </>
      )}
    </Modal>
  )
}

function ImportSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [step, setStep] = useState(1)
  const close = () => { setStep(1); onClose() }
  return (
    <Modal open={open} onClose={close} title="Add guests from Excel">
      {step === 1 ? (
        <>
          <p className="text-[14.5px] text-muted">Any list works. We just need a name and a mobile number in each row. Family and side are nice to have.</p>
          <button className="mt-4 w-full rounded-2xl border-2 border-dashed border-line p-6 text-center hover:bg-sunk" onClick={() => setStep(2)}>
            <FileSpreadsheet className="mx-auto text-plum" size={30} />
            <div className="mt-2 text-[16px] font-semibold">Choose your file</div>
            <div className="text-[13px] text-muted">Excel or Google Sheets download</div>
          </button>
        </>
      ) : (
        <>
          <div className="rounded-2xl bg-good/10 p-4 text-[15px]"><span className="font-semibold">guests-final-v3.xlsx</span><br />We found <b>112 people</b> in <b>31 families</b>.</div>
          <div className="mt-3 rounded-2xl border border-warn/30 bg-warn/10 p-4 text-[14px]">
            <div className="font-semibold">2 rows need a quick look</div>
            <ul className="mt-1 list-disc pl-5 text-muted"><li>Karthik Raghavan appears twice. We’ll keep one.</li><li>Row 87: mobile number has 9 digits. We’ll add the person without a number.</li></ul>
          </div>
          <button className="btn-primary mt-4 w-full !min-h-[52px] text-[16px]" onClick={close}>Add 112 people</button>
          <button className="mt-2 min-h-[44px] w-full text-[14px] text-muted underline" onClick={() => setStep(1)}>Choose a different file</button>
        </>
      )}
    </Modal>
  )
}
