import { ArrowRight, BedDouble, Link2, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Mark } from '../components/AppShell'

const gutter = { paddingLeft: 'max(16px, env(safe-area-inset-left, 0px))', paddingRight: 'max(16px, env(safe-area-inset-right, 0px))' }

export default function Landing() {
  return (
    <div className="min-h-full">
      <header className="mx-auto max-w-[1080px] flex items-center justify-between py-5" style={gutter}>
        <div className="flex items-center gap-2"><Mark className="h-7 w-7 text-plum" /><span className="font-display text-[20px] font-semibold">WeddingStay</span></div>
        <div className="flex gap-2">
          <Link to="/g/h02" className="btn-ghost hidden sm:inline-flex">See the guest view</Link>
          <Link to="/app" className="btn-primary">Open sample wedding</Link>
        </div>
      </header>

      <section className="mx-auto max-w-[1080px] grid gap-10 md:grid-cols-[1.1fr_1fr] items-center pt-8 pb-14" style={gutter}>
        <div className="min-w-0">
          <div className="eyebrow text-plum">For couples planning a wedding with outstation guests</div>
          <h1 className="mt-3 font-display text-[40px] sm:text-[52px] leading-[1.05] font-semibold">Your wedding. Your guests. Their stay.</h1>
          <p className="mt-4 text-[17px] text-muted max-w-[52ch]">
            Collect RSVPs, travel dates and room needs from every family with one WhatsApp link, then assign hotel rooms night by night without the spreadsheet chaos.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/app" className="btn-primary !px-5 !py-3 text-[15px]">Explore the sample wedding <ArrowRight size={17} /></Link>
            <Link to="/g/h02" className="btn-ghost !px-5 !py-3 text-[15px]">Open a guest link</Link>
          </div>
          <p className="mt-3 text-[12.5px] text-muted">Prototype with made-up data. Nothing is saved.</p>
        </div>

        {/* A phone-sized preview of what a family sees in WhatsApp */}
        <div className="mx-auto w-full max-w-[340px]">
          <div className="rounded-[28px] border border-line bg-surface p-3 shadow-[0_20px_60px_-30px_rgba(60,20,50,.45)]">
            <div className="rounded-[20px] bg-sunk p-4 space-y-3">
              <div className="rounded-2xl rounded-tl-sm bg-surface border border-line p-3 text-[13.5px] leading-snug">
                Hi Meenakshi aunty, we're so excited to celebrate with you at Ananya &amp; Rohan's wedding in Udaipur. Please confirm who's coming and your travel dates here:
                <div className="mt-2 rounded-lg bg-plumsoft px-2.5 py-2 text-plum font-medium break-all">weddingstay.in/r/k7Qm…</div>
              </div>
              <div className="rounded-2xl border border-line bg-surface p-3">
                <div className="eyebrow">Subramanian family · 4 people</div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-[12.5px]">
                  {['Mehendi', 'Haldi', 'Sangeet', 'Wedding'].map((f, i) => (
                    <div key={f} className="flex items-center justify-between rounded-md bg-sunk px-2 py-1.5"><span>{f}</span><span className="text-good font-semibold num">{i === 1 ? '3' : '4'}/4</span></div>
                  ))}
                </div>
                <div className="mt-3 rounded-md border border-good/30 bg-good/10 px-2.5 py-2 text-[12.5px]">
                  <span className="font-semibold">Your stay is confirmed.</span> Family Suite, Aravali Lake Resort, 11 to 14 Dec.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-surface">
        <div className="mx-auto max-w-[1080px] grid gap-6 sm:grid-cols-3 py-10" style={gutter}>
          {[
            { icon: Users, t: 'One list for both families', b: 'Import everyone’s spreadsheets, catch duplicates, and group guests into families with a bride-side or groom-side coordinator.' },
            { icon: Link2, t: 'One link per family', b: 'The family elder fills in RSVPs for each function, arrival trains or flights, and who needs a room. No app, no login.' },
            { icon: BedDouble, t: 'Rooms that add up every night', b: 'Enter what each hotel has held or confirmed, assign families to rooms, and see shortages and date clashes before they happen.' },
          ].map((f) => (
            <div key={f.t} className="min-w-0">
              <f.icon className="text-plum" size={22} />
              <h3 className="mt-3 font-semibold text-[16px]">{f.t}</h3>
              <p className="mt-1.5 text-muted">{f.b}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
