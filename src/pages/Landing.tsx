import { ArrowRight, ArrowUpRight, BedDouble, CalendarHeart, Check, ChevronDown, ClipboardList, Heart, MessageCircle, Palette, Plus, Smartphone, Users } from 'lucide-react'
import { useState, type FormEvent, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mark } from '../components/AppShell'
import { GoldDivider, Toran } from '../components/Ornaments'
import RsvpHero from '../components/RsvpHero'
import { templateById, templateStyle } from '../lib/templates'

const gutter = { paddingLeft: 'max(16px, env(safe-area-inset-left, 0px))', paddingRight: 'max(16px, env(safe-area-inset-right, 0px))' }
const d = (ms: number) => ({ animationDelay: `${ms}ms` })
const wrap = 'mx-auto max-w-[1180px]'

// The router uses the hash, so in-page links scroll instead of changing the URL.
const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

// Rooms per night for the allocation preview: [room type, hotel, [allocated, available] per night]
const grid: [string, string, [number, number][]][] = [
  ['Deluxe Lake View', 'Aravali Lake Resort', [[12, 16], [14, 16], [14, 16]]],
  ['Family Suite', 'Aravali Lake Resort', [[3, 3], [3, 3], [3, 3]]],
  ['Heritage Room', 'Haveli Gulmohar', [[5, 8], [7, 8], [9, 8]]],
]

export default function Landing() {
  return (
    <div className="min-h-full overflow-x-hidden">
      <Header />
      <div className="pointer-events-none flex justify-center overflow-hidden h-[56px] sm:h-[72px]" aria-hidden="true">
        {Array.from({ length: 6 }, (_, i) => <div key={i} className="w-[300px] sm:w-[400px] shrink-0"><Toran swags={4} /></div>)}
      </div>
      <Hero />
      <Familiar />
      <Features />
      <Designs />
      <Steps />
      <Faq />
      <Start />
      <Footer />
    </div>
  )
}

function Header() {
  return (
    <header className="sticky z-30 border-b border-line/60 bg-bg/80 backdrop-blur-xl" style={{ top: 'env(safe-area-inset-top, 0px)' }}>
      <div className={`${wrap} flex items-center justify-between gap-3 py-3`} style={gutter}>
        <div className="flex items-center gap-2"><Mark className="h-7 w-7" /><span className="font-display text-[20px] font-semibold">WeddingStay</span></div>
        <nav className="hidden lg:flex items-center gap-1 text-[14px] text-muted">
          {[['features', 'Features'], ['designs', 'Invite designs'], ['how', 'How it works'], ['faq', 'Questions']].map(([id, label]) => (
            <button key={id} onClick={() => go(id)} className="rounded-full px-3 py-2 hover:bg-sunk hover:text-ink">{label}</button>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/app" className="btn-ghost hidden sm:inline-flex">See a demo</Link>
          <button onClick={() => go('start')} className="btn-primary">Create your wedding</button>
        </div>
      </div>
    </header>
  )
}

function Hero() {
  return (
    <section className="glow" >
      <div className={`${wrap} grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center pt-6 md:pt-10 pb-16 md:pb-24`} style={gutter}>
        <div className="min-w-0">
          <div className="rise inline-flex items-center gap-2 rounded-full border border-gold/40 bg-surface/80 px-3 py-1 text-[13px] font-medium text-plum" style={d(0)}>
            <Heart size={14} className="fill-current" /> Made for Indian weddings, mehendi to vidaai
          </div>
          <h1 className="rise mt-5 font-display font-semibold text-[46px] leading-[0.98] sm:text-[64px] md:text-[80px]" style={d(60)}>
            Every guest, every room, <em className="text-plum">every night.</em>
          </h1>
          <p className="rise mt-6 text-[17px] md:text-[19px] leading-relaxed text-muted max-w-[46ch]" style={d(140)}>
            Send each family one beautiful WhatsApp invite. They tell you who's coming to which function and who needs a room. You fit everyone into your hotel blocks, night by night, without the spreadsheet.
          </p>
          <div className="rise mt-8 flex flex-wrap gap-3" style={d(220)}>
            <button onClick={() => go('start')} className="btn-primary !px-6 !py-3 text-[15px]">Create your wedding, free <ArrowRight size={17} /></button>
            <Link to="/app" className="btn-ghost !px-6 !py-3 text-[15px]">Explore a sample wedding</Link>
          </div>
          <ul className="rise mt-7 flex flex-wrap gap-x-5 gap-y-2 text-[13.5px] text-muted" style={d(300)}>
            {['Guests need no app or login', 'Both sides plan together', 'Ready in 10 minutes'].map((t) => (
              <li key={t} className="flex items-center gap-1.5"><Check size={15} className="text-good" />{t}</li>
            ))}
          </ul>
        </div>
        <div className="rise min-w-0" style={d(260)}><PhoneScene /></div>
      </div>
    </section>
  )
}

/** A phone showing the guest invite, with the two moments around it: the WhatsApp share and the confirmed room. */
function PhoneScene() {
  const t = templateById('marigold')
  return (
    <div className="relative mx-auto w-full max-w-[520px] pt-4 pb-6">
      <div className="relative mx-auto w-[272px] sm:w-[300px] rounded-[44px] bg-ink p-[10px] shadow-[0_40px_80px_-30px_rgb(var(--ink)/0.55)]">
        <div className="absolute left-1/2 top-[18px] z-10 h-[22px] w-[90px] -translate-x-1/2 rounded-full bg-ink" />
        <div className="invite overflow-hidden rounded-[35px]" style={templateStyle(t)}>
          <div className="h-[470px] sm:h-[560px] overflow-hidden pt-8">
            <RsvpHero t={t} bride="Ananya" groom="Rohan" venue="Aravali Lake Resort" city="Udaipur" compact />
            <div className="px-4 pt-4">
              <div className="card p-4">
                <div className="font-display text-[19px] font-semibold">Namaste, Subramanian family</div>
                <div className="text-[12.5px] text-muted">Who is coming to each function?</div>
                <ul className="mt-3 grid gap-1.5 text-[13px]">
                  {[['Mehendi', 'Fri 11', 4], ['Sangeet', 'Fri 11', 4], ['Haldi', 'Sat 12', 3], ['Wedding', 'Sat 12', 4]].map(([f, day, n]) => (
                    <li key={f} className="flex items-center justify-between rounded-xl bg-sunk px-3 py-2">
                      <span><span className="font-medium">{f}</span> <span className="text-muted">· {day}</span></span>
                      <span className="num font-semibold text-plum">{n} of 4</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 rounded-xl border border-line px-3 py-2 text-[12.5px]">
                  <div className="text-muted">Need a room?</div>
                  <div className="font-medium">Yes, 1 room for 3 nights</div>
                </div>
                <div className="btn-primary mt-3 w-full">Send our reply</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute left-0 -top-2 w-[200px] card p-3 rotate-[-3deg] hidden min-[480px]:block">
        <div className="flex items-center gap-1.5 text-[12px] font-medium text-good"><MessageCircle size={14} /> WhatsApp</div>
        <p className="mt-1.5 text-[12.5px] leading-snug">Meenakshi aunty, please tell us who's coming 🙏</p>
        <div className="mt-2 truncate rounded-lg bg-plumsoft px-2 py-1 text-[11.5px] font-medium text-plum">weddingstay.in/r/k7Qm9x</div>
      </div>
      <div className="absolute right-0 bottom-[54px] w-[196px] card p-3 rotate-[2.5deg] hidden min-[480px]:block">
        <div className="flex items-center gap-2 text-[12.5px] font-medium"><span className="grid h-6 w-6 place-items-center rounded-full bg-good/15 text-good"><Check size={14} /></span> Room confirmed</div>
        <div className="mt-1.5 text-[12px] text-muted leading-snug">Family Suite · Aravali Lake Resort<br />11 to 13 Dec, 3 nights</div>
      </div>
    </div>
  )
}

function Familiar() {
  const lines = [
    ['“Bua’s family is six now, not four.”', 'Headcounts change by the day. Each family updates their own answer from the same link.'],
    ['“Which hotel is Chacha ji in?”', 'Every room, every night, in one place. Anyone on your side can look it up.'],
    ['“The hotel wants the rooming list tonight.”', 'Download a clean list per hotel, with arrivals, in one click.'],
  ]
  return (
    <section className="border-y border-line bg-sunk/50">
      <div className={`${wrap} py-14 md:py-16`} style={gutter}>
        <div className="eyebrow uppercase tracking-[0.18em]">Sound familiar?</div>
        <div className="mt-6 grid gap-8 md:grid-cols-3">
          {lines.map(([q, a]) => (
            <div key={q} className="min-w-0">
              <div className="font-display text-[26px] md:text-[28px] leading-tight font-semibold">{q}</div>
              <p className="mt-2 text-[15px] leading-relaxed text-muted max-w-[38ch]">{a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Features() {
  return (
    <section id="features" className="scroll-mt-20">
      <div className={`${wrap} py-16 md:py-24`} style={gutter}>
        <SectionHead kicker="Everything in one place" title="From the first guest list to the last checkout" />
        <div className="mt-10 grid gap-3 md:grid-cols-12">
          <div className="card p-5 md:p-6 md:col-span-8 min-w-0">
            <FeatureTitle icon={<BedDouble size={18} />} title="Rooms, night by night" body="Enter what each hotel has held or confirmed, then place families. Clashes and over-bookings show up before the hotel calls you." />
            <div className="mt-5 overflow-x-auto">
              <div className="min-w-[480px] grid grid-cols-[1.4fr_repeat(3,1fr)] gap-x-3 gap-y-3 items-center">
                <div />
                {['Fri 11', 'Sat 12', 'Sun 13'].map((n) => <div key={n} className="text-[12.5px] font-medium text-muted">{n} Dec</div>)}
                {grid.map(([rt, hotel, cells], r) => <Row key={rt} rt={rt} hotel={hotel} cells={cells} row={r} />)}
              </div>
            </div>
          </div>
          <div className="card p-5 md:p-6 md:col-span-4 min-w-0">
            <FeatureTitle icon={<Users size={18} />} title="Both sides, one list" body="Bring in the bride’s and groom’s lists, catch duplicates, and group people into families with a coordinator for each side." />
            <ul className="mt-5 grid gap-2 text-[13.5px]">
              {[['Iyer family', 'Bride’s side', 6], ['Malhotra family', 'Groom’s side', 4], ['Subramanian family', 'Bride’s side', 4]].map(([n, s, c]) => (
                <li key={n} className="flex items-center justify-between rounded-xl bg-sunk px-3 py-2"><span className="min-w-0 truncate"><span className="font-medium">{n}</span> <span className="text-muted">· {s}</span></span><span className="num text-muted">{c}</span></li>
              ))}
            </ul>
          </div>
          <SmallFeature icon={<Smartphone size={18} />} title="One link per family" body="The family elder answers for everyone: functions, travel and rooms. No app, no password." />
          <SmallFeature icon={<CalendarHeart size={18} />} title="Headcount per function" body="Live numbers for mehendi, sangeet, haldi and the wedding, ready for your caterer." />
          <SmallFeature icon={<ClipboardList size={18} />} title="Rooming lists for hotels" body="Send each hotel its list, then share the stay page with guests once it’s confirmed." />
        </div>
      </div>
    </section>
  )
}

function Designs() {
  const ids = ['marigold', 'lovebirds', 'midnight', 'sage']
  return (
    <section id="designs" className="scroll-mt-20 border-t border-line">
      <div className={`${wrap} py-16 md:py-24`} style={gutter}>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHead kicker={<span className="inline-flex items-center gap-1.5"><Palette size={14} /> Invite designs</span>} title="An invite your family will forward with pride" />
          <Link to="/app/invitations/design" className="btn-ghost">See all 10 designs <ArrowUpRight size={16} /></Link>
        </div>
        <div className="mt-10 -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-4 md:mx-0 md:grid md:grid-cols-4 md:overflow-visible md:px-0">
          {ids.map((id) => {
            const t = templateById(id)
            return (
              <figure key={id} className="w-[250px] shrink-0 snap-start md:w-auto min-w-0">
                <div className="invite h-[300px] overflow-hidden rounded-[24px] border border-line shadow-[0_20px_40px_-28px_rgb(var(--ink)/0.5)]" style={templateStyle(t)}>
                  <div className="pt-4"><RsvpHero t={t} bride="Ananya" groom="Rohan" venue="Aravali Lake Resort" city="Udaipur" compact /></div>
                  <GoldDivider className="mx-auto mt-4 h-5 w-[140px]" />
                  <div className="mt-3 px-5 text-center text-[13px] text-muted font-serif italic">{t.invite}</div>
                </div>
                <figcaption className="mt-3"><div className="font-medium text-[14.5px]">{t.name}</div><div className="text-[13px] text-muted line-clamp-1">{t.mood}</div></figcaption>
              </figure>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function Steps() {
  return (
    <section id="how" className="scroll-mt-20 border-t border-line">
      <div className={`${wrap} py-16 md:py-24`} style={gutter}>
        <SectionHead kicker="How it works" title="Three steps, then relax for the sangeet" />
        <ol className="mt-10 grid gap-8 md:grid-cols-3">
          {[
            ['Add your guests', 'Paste or import both sides’ lists. We group people into families and flag duplicates.'],
            ['Send one invite per family', 'Pick a design and share the link on WhatsApp. Replies come straight into your dashboard.'],
            ['Fit rooms and share stays', 'Place families in your hotel blocks, send rooming lists, and let guests see their room once it’s confirmed.'],
          ].map(([t, b], i) => (
            <li key={t} className="min-w-0 border-t-2 border-plum/80 pt-5">
              <div className="font-display text-[44px] leading-none font-semibold text-gold num">{i + 1}</div>
              <h3 className="mt-3 font-display text-[24px] font-semibold">{t}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted max-w-[40ch]">{b}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

const faqs = [
  ['Do our guests need to download anything?', 'No. Each family gets a link that opens in any phone browser. No app, no login, and it works well on slow connections.'],
  ['Can both families plan together?', 'Yes. Invite coordinators from the bride’s and the groom’s side. Each sees and manages their own families, and you see everything.'],
  ['We have guests in three different hotels. Does that work?', 'Yes. Add as many hotels and room types as you need, with different numbers for each night.'],
  ['What does it cost?', 'Setting up your wedding and inviting guests is free while we are in early access.'],
  ['Is our guest list private?', 'Only people you add to your wedding can see the list. Each family’s link shows only their own details.'],
]

function Faq() {
  const [open, setOpen] = useState(0)
  return (
    <section id="faq" className="scroll-mt-20 border-t border-line">
      <div className={`${wrap} grid gap-10 py-16 md:py-24 lg:grid-cols-[0.8fr_1.2fr]`} style={gutter}>
        <SectionHead kicker="Questions" title="Things families usually ask" />
        <div className="divide-y divide-line border-y border-line">
          {faqs.map(([q, a], i) => (
            <div key={q}>
              <button className="flex w-full items-center justify-between gap-4 py-4 text-left" aria-expanded={open === i} onClick={() => setOpen(open === i ? -1 : i)}>
                <span className="font-display text-[20px] font-semibold leading-snug">{q}</span>
                <ChevronDown size={18} className={`shrink-0 text-muted transition-transform ${open === i ? 'rotate-180' : ''}`} />
              </button>
              {open === i && <p className="pb-5 -mt-1 text-[15px] leading-relaxed text-muted max-w-[60ch]">{a}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function Start() {
  const nav = useNavigate()
  const submit = (e: FormEvent) => { e.preventDefault(); nav('/app') }
  return (
    <section id="start" className="scroll-mt-20">
      <div className={`${wrap} pb-16 md:pb-24`} style={gutter}>
        <div className="invite relative overflow-hidden rounded-[32px]" style={{ background: 'rgb(62 16 30)', color: 'rgb(255 247 232)' }}>
          <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center opacity-90" aria-hidden="true">
            {Array.from({ length: 4 }, (_, i) => <div key={i} className="w-[320px] shrink-0"><Toran swags={4} /></div>)}
          </div>
          <div className="relative grid gap-10 px-6 pt-24 pb-10 md:px-12 md:pt-28 md:pb-12 lg:grid-cols-[1fr_1fr] lg:items-end">
            <div className="min-w-0">
              <h2 className="font-display text-[38px] md:text-[54px] leading-[1.02] font-semibold">Start planning your wedding</h2>
              <p className="mt-4 text-[16px] leading-relaxed text-[rgb(255_247_232/0.75)] max-w-[42ch]">Tell us a little about it. You can add functions, hotels and guests right after.</p>
            </div>
            <form onSubmit={submit} className="grid gap-3 rounded-[24px] bg-bg p-5 text-ink sm:grid-cols-2">
              <Field label="Your names" className="sm:col-span-2"><input className="input" placeholder="Ananya & Rohan" /></Field>
              <Field label="City"><input className="input" placeholder="Udaipur" /></Field>
              <Field label="Wedding month"><input className="input" type="month" defaultValue="2026-12" /></Field>
              <Field label="Roughly how many guests?" className="sm:col-span-2">
                <div className="flex flex-wrap gap-2">
                  {['Under 100', '100 to 300', '300 to 600', '600+'].map((g, i) => (
                    <label key={g} className="cursor-pointer">
                      <input type="radio" name="size" defaultChecked={i === 1} className="peer sr-only" />
                      <span className="inline-flex rounded-full border border-line px-3.5 py-2 text-[13.5px] peer-checked:border-plum peer-checked:bg-plumsoft peer-checked:text-plum peer-focus-visible:ring-2 peer-focus-visible:ring-plum">{g}</span>
                    </label>
                  ))}
                </div>
              </Field>
              <button type="submit" className="btn-primary sm:col-span-2 !py-3 text-[15px]"><Plus size={17} /> Create my wedding</button>
              <p className="sm:col-span-2 text-center text-[12px] text-muted">Prototype: this opens the sample wedding. Nothing is saved yet.</p>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t border-line">
      <div className={`${wrap} flex flex-wrap items-center justify-between gap-4 py-8 text-[13px] text-muted`} style={gutter}>
        <div className="min-w-0"><div className="flex items-center gap-2"><Mark className="h-6 w-6" /><span className="font-display text-[17px] font-semibold text-ink">WeddingStay</span></div><div className="mt-1">Made in India, for big fat Indian weddings.</div></div>
        <div className="flex gap-4">
          <Link to="/app" className="hover:text-ink">Sample wedding</Link>
          <Link to="/g/h02" className="hover:text-ink">Guest view</Link>
        </div>
      </div>
    </footer>
  )
}

function SectionHead({ kicker, title }: { kicker: ReactNode; title: string }) {
  return (
    <div className="min-w-0">
      <div className="eyebrow uppercase tracking-[0.18em] text-plum">{kicker}</div>
      <h2 className="mt-3 font-display text-[36px] md:text-[50px] leading-[1.02] font-semibold max-w-[20ch]">{title}</h2>
    </div>
  )
}

function FeatureTitle({ icon, title, body }: { icon: ReactNode; title: string; body: string }) {
  return (
    <>
      <div className="grid h-9 w-9 place-items-center rounded-full bg-plumsoft text-plum">{icon}</div>
      <h3 className="mt-4 font-display text-[24px] font-semibold leading-tight">{title}</h3>
      <p className="mt-1.5 text-[14.5px] leading-relaxed text-muted max-w-[52ch]">{body}</p>
    </>
  )
}

function SmallFeature(p: { icon: ReactNode; title: string; body: string }) {
  return <div className="card p-5 md:p-6 md:col-span-4 min-w-0"><FeatureTitle {...p} /></div>
}

function Field({ label, className, children }: { label: string; className?: string; children: ReactNode }) {
  return <div className={className}><div className="label">{label}</div>{children}</div>
}

function Row({ rt, hotel, cells, row }: { rt: string; hotel: string; cells: [number, number][]; row: number }) {
  return (
    <>
      <div className="min-w-0">
        <div className="text-[14px] font-medium truncate">{rt}</div>
        <div className="text-[12px] text-muted truncate">{hotel}</div>
      </div>
      {cells.map(([a, avail], c) => {
        const over = a > avail
        const cap = Math.max(avail, a, 1)
        return (
          <div key={c} className="min-w-0">
            <div className="relative h-9 overflow-hidden rounded-xl bg-sunk">
              <div className={`fill absolute inset-y-0 left-0 rounded-xl ${over ? 'bg-bad' : 'bg-plum'}`}
                style={{ width: `${Math.min(1, a / cap) * 100}%`, animationDelay: `${300 + c * 200 + row * 80}ms`, ...(over ? { backgroundImage: 'repeating-linear-gradient(135deg, rgb(255 255 255 / 0.28) 0 6px, transparent 6px 12px)' } : {}) }} />
              <span className={`absolute inset-0 flex items-center px-3 text-[13px] font-semibold num ${a / cap > 0.5 ? 'text-onplum' : 'text-ink'}`}>
                {a}/{avail}{over ? ' over' : ''}
              </span>
            </div>
          </div>
        )
      })}
    </>
  )
}
