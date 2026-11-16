import clsx from 'clsx'
import { ArrowRight, BedDouble, Check, Hotel, PartyPopper, Send, UserPlus, Users } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { fmtDay, fmtDow, fmtTime } from '../lib/dates'
import { familyInfo, roomStage, shortRange } from '../lib/family'
import { functionHeadcount } from '../lib/stats'
import { useStore } from '../store'

// Home: one clear "next step", three numbers, and the wedding plan as a simple checklist.

export default function Home() {
  const { data } = useStore()
  const fams = data.households.map((h) => ({ h, ...familyInfo(data, h) }))
  const people = data.guests.length
  const coming = data.guests.filter((g) => g.rsvp === 'YES').length
  const notSent = fams.filter((f) => f.reply === 'not-sent')
  const waiting = fams.filter((f) => f.reply === 'waiting')
  const replied = fams.filter((f) => f.reply === 'coming' || f.reply === 'not-coming')
  const needRoom = fams.filter((f) => f.needRoom.length > 0)
  const roomWaiting = fams.filter((f) => f.waitingForRoom.length > 0)
  const toTell = data.allocations.filter((a) => roomStage(a) === 'confirmed')
  const toTellFams = new Set(toTell.map((a) => a.householdId))
  const told = new Set(data.allocations.filter((a) => roomStage(a) === 'told').map((a) => a.householdId))
  const days = Math.max(0, Math.ceil((Date.parse(data.wedding.startDate) - Date.parse('2026-11-16')) / 864e5))
  const first = data.wedding.brideName.split(' ')[0]

  const next: { icon: ReactNode; title: string; body: string; cta: string; to: string } =
    fams.length === 0 ? { icon: <UserPlus />, title: 'Add your first family', body: 'Start with one family. Just a name and a WhatsApp number. You can add the rest any time.', cta: 'Add a family', to: '/app/guests?add=1' }
    : notSent.length ? { icon: <Send />, title: `Send the invite to ${notSent.length} ${notSent.length === 1 ? 'family' : 'families'}`, body: 'Each family gets their own link on WhatsApp. They tap it, say who’s coming and if they need a room.', cta: 'Send on WhatsApp', to: '/app/guests?show=not-sent' }
    : waiting.length ? { icon: <Send />, title: `${waiting.length} ${waiting.length === 1 ? 'family hasn’t' : 'families haven’t'} replied yet`, body: `A friendly reminder on WhatsApp usually does it. Replies close ${fmtDay(data.wedding.responseDeadline)}.`, cta: 'Send reminders', to: '/app/guests?show=waiting' }
    : needRoom.length && data.hotels.length === 0 ? { icon: <Hotel />, title: 'Add the hotel where guests will stay', body: `${needRoom.length} families asked for a room. Add your hotel and how many rooms you’ve booked.`, cta: 'Add a hotel', to: '/app/rooms?add=hotel' }
    : roomWaiting.length ? { icon: <BedDouble />, title: `Give rooms to ${roomWaiting.length} ${roomWaiting.length === 1 ? 'family' : 'families'}`, body: 'They asked for a room. Pick one for them in two taps.', cta: 'Give rooms', to: '/app/rooms' }
    : toTellFams.size ? { icon: <Send />, title: `Tell ${toTellFams.size} ${toTellFams.size === 1 ? 'family' : 'families'} their room details`, body: 'The hotel has confirmed. Send them the hotel name and dates on WhatsApp.', cta: 'Send room details', to: '/app/rooms?show=confirmed' }
    : { icon: <PartyPopper />, title: 'All caught up!', body: 'Every family has replied and has their room. Enjoy the shaadi prep.', cta: 'See guests', to: '/app/guests' }

  const plan = [
    { label: 'Add your guests', detail: fams.length ? `${fams.length} families, ${people} people` : 'Not started', done: fams.length > 0, to: '/app/guests' },
    { label: 'Send invites on WhatsApp', detail: fams.length ? `${fams.length - notSent.length} of ${fams.length} sent` : '', done: fams.length > 0 && notSent.length === 0, to: '/app/guests?show=not-sent' },
    { label: 'Get replies', detail: fams.length ? `${replied.length} of ${fams.length} replied` : '', done: fams.length > 0 && replied.length === fams.length, to: '/app/guests?show=waiting' },
    { label: 'Add hotels', detail: data.hotels.length ? `${data.hotels.length} ${data.hotels.length === 1 ? 'hotel' : 'hotels'}` : '', done: data.hotels.length > 0, to: '/app/rooms?show=hotels' },
    { label: 'Give rooms', detail: needRoom.length ? `${needRoom.length - roomWaiting.length} of ${needRoom.length} families have a room` : '', done: needRoom.length > 0 && roomWaiting.length === 0, to: '/app/rooms' },
    { label: 'Send room details to families', detail: needRoom.length ? `${told.size} of ${needRoom.length} told` : '', done: needRoom.length > 0 && told.size >= needRoom.length, to: '/app/rooms?show=confirmed' },
  ]
  const nowIdx = plan.findIndex((p) => !p.done)

  return (
    <div className="mx-auto max-w-[760px]">
      <div className="text-[15px] text-muted">Namaste {first} 🙏</div>
      <h1 className="mt-1 font-display text-[34px] md:text-[44px] leading-[1.05] font-semibold">{days} days to go</h1>
      <div className="mt-1 text-[15px] text-muted">{data.wedding.city} · {shortRange(data.wedding.startDate, data.wedding.endDate)}</div>

      <section className="mt-6 rounded-[24px] bg-gradient-to-br from-plum to-[rgb(150_40_60)] p-5 text-onplum shadow-[0_18px_40px_-20px_rgb(var(--plum)/0.8)]" aria-label="Your next step">
        <div className="flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.08em] opacity-80"><span className="[&>svg]:h-4 [&>svg]:w-4">{next.icon}</span> Your next step</div>
        <h2 className="mt-2 font-display text-[26px] leading-[1.1] font-semibold">{next.title}</h2>
        <p className="mt-1.5 text-[15px] opacity-90">{next.body}</p>
        <Link to={next.to} className="mt-4 inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full bg-onplum px-5 text-[16px] font-semibold text-plum sm:w-auto">{next.cta} <ArrowRight size={18} /></Link>
      </section>

      {fams.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-2.5">
          <Tile to="/app/guests?show=coming" value={coming} label="people coming" tone="good" />
          <Tile to="/app/guests?show=waiting" value={waiting.length} label={waiting.length === 1 ? 'family not replied' : 'families not replied'} tone={waiting.length ? 'warn' : undefined} />
          <Tile to="/app/rooms" value={roomWaiting.length} label={roomWaiting.length === 1 ? 'family needs a room' : 'families need a room'} tone={roomWaiting.length ? 'bad' : 'good'} />
        </div>
      )}

      <section className="card mt-5">
        <h2 className="px-5 pt-4 pb-1 font-display text-[20px] font-semibold">Your wedding plan</h2>
        <ol className="px-2 pb-2">
          {plan.map((p, i) => (
            <li key={p.label}>
              <Link to={p.to} className={clsx('flex items-center gap-3 rounded-2xl px-3 py-3 min-h-[60px]', i === nowIdx ? 'bg-plumsoft' : 'hover:bg-sunk')}>
                <span className={clsx('grid h-8 w-8 shrink-0 place-items-center rounded-full text-[14px] font-semibold num', p.done ? 'bg-good text-white' : i === nowIdx ? 'bg-plum text-onplum' : 'bg-sunk text-muted')}>{p.done ? <Check size={16} /> : i + 1}</span>
                <span className="min-w-0 flex-1">
                  <span className={clsx('block text-[15.5px] font-medium', p.done && 'text-muted')}>{p.label}</span>
                  {p.detail && <span className="block text-[13px] text-muted">{p.detail}</span>}
                </span>
                {i === nowIdx && <span className="shrink-0 rounded-full bg-plum px-2.5 py-0.5 text-[12px] font-semibold text-onplum">Now</span>}
              </Link>
            </li>
          ))}
        </ol>
      </section>

      {fams.length > 0 && (
        <section className="card mt-5">
          <div className="flex items-center justify-between px-5 pt-4 pb-2">
            <h2 className="font-display text-[20px] font-semibold">Who’s coming to what</h2>
            <Link to="/app/functions" className="text-[14px] font-medium text-plum">Functions</Link>
          </div>
          <ul className="divide-y divide-line">
            {data.functions.filter((f) => f.isPublished).map((f) => {
              const h = functionHeadcount(data, f.id)
              return (
                <li key={f.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div className="min-w-0"><div className="font-medium text-[15px]">{f.name}</div><div className="text-[13px] text-muted">{fmtDow(f.date)}, {fmtTime(f.startTime)}</div></div>
                  <div className="text-right"><div className="font-display text-[22px] font-semibold num leading-none">{h.yes}</div><div className="text-[12px] text-muted">coming</div></div>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      {fams.length === 0 && (
        <div className="mt-5 flex items-start gap-3 rounded-2xl bg-sunk/70 p-4 text-[14px]">
          <Users size={20} className="mt-0.5 shrink-0 text-plum" />
          <p><span className="font-semibold">Wedding planning is a family job.</span> Add Mummy, Papa or a cousin from <Link to="/app/settings" className="font-medium text-plum underline">Family &amp; settings</Link> so they can add their side’s guests too.</p>
        </div>
      )}
    </div>
  )
}

function Tile({ to, value, label, tone }: { to: string; value: number; label: string; tone?: 'good' | 'warn' | 'bad' }) {
  return (
    <Link to={to} className="card flex min-h-[104px] flex-col justify-between p-3.5 active:scale-[0.98] transition-transform">
      <div className={clsx('font-display text-[32px] leading-none font-semibold num', tone === 'good' ? 'text-good' : tone === 'warn' ? 'text-warn' : tone === 'bad' ? 'text-bad' : 'text-ink')}>{value}</div>
      <div className="text-[13px] leading-snug text-muted">{label}</div>
    </Link>
  )
}
