import { ArrowUpRight, Check, MessageCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Mark } from '../components/AppShell'
import { Toran } from '../components/Ornaments'

const gutter = { paddingLeft: 'max(16px, env(safe-area-inset-left, 0px))', paddingRight: 'max(16px, env(safe-area-inset-right, 0px))' }
const d = (ms: number) => ({ animationDelay: `${ms}ms` })

// Rooms per night for the hero grid: [room type, hotel, [allocated, available] per night]
const grid: [string, string, [number, number][]][] = [
  ['Deluxe Lake View', 'Aravali Lake Resort', [[12, 16], [14, 16], [14, 16]]],
  ['Family Suite', 'Aravali Lake Resort', [[3, 3], [3, 3], [3, 3]]],
  ['Heritage Room', 'Haveli Gulmohar', [[5, 8], [7, 8], [9, 8]]],
  ['Standard Twin', 'Fateh Garden Inn', [[0, 0], [2, 6], [2, 6]]],
]

export default function Landing() {
  return (
    <div className="min-h-full overflow-x-hidden">
      <header className="sticky z-30 border-b border-line/60 bg-bg/75 backdrop-blur-xl" style={{ top: 'env(safe-area-inset-top, 0px)' }}>
        <div className="mx-auto max-w-[1180px] flex items-center justify-between py-3.5" style={gutter}>
          <div className="flex items-center gap-2"><Mark className="h-7 w-7" /><span className="font-display text-[20px] font-semibold">WeddingStay</span></div>
          <nav className="flex items-center gap-2">
            <Link to="/g/h02" className="btn-ghost hidden sm:inline-flex">Guest view</Link>
            <Link to="/app" className="btn-dark">Open sample wedding</Link>
          </nav>
        </div>
      </header>

      <div className="pointer-events-none flex justify-center overflow-hidden h-[64px] sm:h-[84px]" aria-hidden="true">
        {Array.from({ length: 6 }, (_, i) => <div key={i} className="w-[300px] sm:w-[400px] shrink-0"><Toran swags={4} /></div>)}
      </div>
      <section className="glow mx-auto max-w-[1180px] pt-6 md:pt-14 pb-10" style={gutter}>
        <h1 className="rise font-display font-semibold text-[48px] leading-[0.95] sm:text-[72px] md:text-[96px] max-w-[11ch]" style={d(0)}>
          Every guest, every room, <em className="text-plum">every night.</em>
        </h1>
        <div className="mt-8 grid gap-6 md:grid-cols-[1fr_auto] md:items-end">
          <p className="rise text-[18px] md:text-[20px] leading-relaxed text-muted max-w-[46ch]" style={d(120)}>
            Send each family one WhatsApp link for RSVPs, travel and room needs. Then fit them into your hotel blocks night by night, with clashes caught before the hotel calls you.
          </p>
          <div className="rise flex flex-wrap gap-3" style={d(220)}>
            <Link to="/app" className="btn-primary !px-6 !py-3 text-[15px]">Explore the sample wedding <ArrowUpRight size={17} /></Link>
            <Link to="/g/h02" className="btn-ghost !px-6 !py-3 text-[15px]">Fill in a guest link</Link>
          </div>
        </div>
      </section>

      {/* Product preview: the memorable moment, rooms filling night by night */}
      <section className="mx-auto max-w-[1180px] pb-20" style={gutter}>
        <div className="rise grid gap-3 md:grid-cols-12" style={d(320)}>
          <div className="card p-5 md:p-6 md:col-span-8 min-w-0">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-display text-[22px] font-semibold">Rooms in Udaipur, 11 to 13 Dec</h2>
              <span className="text-[13px] text-muted">allocated of held or confirmed</span>
            </div>
            <div className="mt-5 overflow-x-auto">
              <div className="min-w-[520px] grid grid-cols-[1.4fr_repeat(3,1fr)] gap-x-3 gap-y-3 items-center">
                <div />
                {['Fri 11', 'Sat 12', 'Sun 13'].map((n) => <div key={n} className="text-[12.5px] font-medium text-muted">{n} Dec</div>)}
                {grid.map(([rt, hotel, cells], r) => (
                  <Row key={rt} rt={rt} hotel={hotel} cells={cells} row={r} />
                ))}
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-4 text-[12.5px] text-muted">
              <span className="flex items-center gap-1.5"><span className="h-2 w-5 rounded-full bg-plum" />allocated</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-5 rounded-full bg-bad" />over the hotel's block</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-5 rounded-full border border-dashed border-muted" />planned, not held yet</span>
            </div>
          </div>

          <div className="md:col-span-4 grid gap-3 min-w-0">
            <div className="card p-5">
              <div className="flex items-center gap-2 text-[13px] font-medium text-good"><MessageCircle size={16} /> Shared on WhatsApp</div>
              <p className="mt-3 text-[14px] leading-snug">Hi Meenakshi aunty, please tell us who's coming and your train timings for Udaipur:</p>
              <div className="mt-3 rounded-xl bg-plumsoft px-3 py-2 text-[13px] font-medium text-plum truncate">weddingstay.in/r/k7Qm9x…</div>
            </div>
            <div className="card p-5">
              <div className="font-display text-[18px] font-semibold">Subramanian family</div>
              <div className="text-[13px] text-muted">4 people answered by one link</div>
              <ul className="mt-3 grid grid-cols-2 gap-2 text-[13px]">
                {[['Mehendi', 4], ['Haldi', 3], ['Sangeet', 4], ['Wedding', 4]].map(([f, n]) => (
                  <li key={f} className="flex items-center justify-between rounded-xl bg-sunk px-3 py-2"><span>{f}</span><span className="num font-semibold">{n}/4</span></li>
                ))}
              </ul>
              <div className="mt-3 flex items-center gap-2 rounded-xl border border-good/30 bg-good/10 px-3 py-2 text-[13px]"><Check size={15} className="text-good" /> Family Suite confirmed by hotel</div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-line">
        <div className="mx-auto max-w-[1180px] py-16 md:py-20" style={gutter}>
          <h2 className="font-display text-[34px] md:text-[48px] leading-[1.02] font-semibold max-w-[18ch]">From the family spreadsheet to the hotel's rooming list</h2>
          <ol className="mt-10 grid gap-8 md:grid-cols-3">
            {[
              ['Bring in both sides', 'Import the bride’s and groom’s lists, catch duplicates, and group people into families with a coordinator for each side.'],
              ['One link per family', 'The family elder answers for everyone: who comes to which function, how they’re arriving, and who needs a room. No app or login.'],
              ['Fit rooms night by night', 'Enter what each hotel has held or confirmed, assign families, and share the stay page only once the hotel confirms.'],
            ].map(([t, b], i) => (
              <li key={t} className="min-w-0 border-t border-ink/80 pt-5">
                <div className="font-display text-[15px] font-semibold text-plum num">Step {i + 1}</div>
                <h3 className="mt-2 font-display text-[22px] font-semibold">{t}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-muted max-w-[40ch]">{b}</p>
              </li>
            ))}
          </ol>
          <div className="mt-14 flex flex-wrap items-center justify-between gap-4 rounded-[28px] bg-ink text-bg px-6 py-8 md:px-10">
            <div className="font-display text-[26px] md:text-[32px] font-semibold leading-tight max-w-[22ch]">See a 95-guest Udaipur wedding, mid-planning</div>
            <Link to="/app" className="btn bg-plum text-onplum !px-6 !py-3 text-[15px]">Open the dashboard <ArrowUpRight size={17} /></Link>
          </div>
          <p className="mt-4 text-[12.5px] text-muted">Prototype with made-up names and bookings. Nothing you change is saved.</p>
        </div>
      </section>
    </div>
  )
}

function Row({ rt, hotel, cells, row }: { rt: string; hotel: string; cells: [number, number][]; row: number }) {
  return (
    <>
      <div className="min-w-0">
        <div className="text-[14px] font-medium truncate">{rt}</div>
        <div className="text-[12px] text-muted truncate">{hotel}</div>
      </div>
      {cells.map(([a, avail], c) => {
        const planned = rt === 'Standard Twin'
        const over = a > avail && avail > 0
        const cap = Math.max(avail, a, 1)
        return (
          <div key={c} className="min-w-0">
            <div className={`relative h-9 overflow-hidden rounded-xl ${planned ? 'border border-dashed border-muted/60' : 'bg-sunk'}`}>
              {cap > 0 && a > 0 && (
                <div className={`fill absolute inset-y-0 left-0 rounded-xl ${over ? 'bg-bad' : planned ? 'bg-muted/30' : 'bg-plum'}`}
                  style={{ width: `${Math.min(1, a / cap) * 100}%`, animationDelay: `${600 + c * 260 + row * 90}ms`, ...(over ? { backgroundImage: 'repeating-linear-gradient(135deg, rgb(255 255 255 / 0.28) 0 6px, transparent 6px 12px)' } : {}) }} />
              )}
              <span className={`absolute inset-0 flex items-center px-3 text-[13px] font-semibold num ${a / cap > 0.5 && !planned ? 'text-onplum' : 'text-ink'}`}>
                {avail === 0 && a === 0 ? '—' : `${a}/${avail}`}{over ? ' over' : ''}
              </span>
            </div>
          </div>
        )
      })}
    </>
  )
}
