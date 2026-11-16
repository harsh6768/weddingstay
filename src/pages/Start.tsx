import clsx from 'clsx'
import { ArrowLeft, ArrowRight, Check, Plus } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mark } from '../components/AppShell'
import { Toran } from '../components/Ornaments'
import { useStore } from '../store'

// "Set up your wedding": three short questions right after sign up.
// Everything else (guests, hotels, rooms) is added later from guided empty screens.

const gutter = { paddingLeft: 'max(16px, env(safe-area-inset-left, 0px))', paddingRight: 'max(16px, env(safe-area-inset-right, 0px))' }
const popularCities = ['Udaipur', 'Jaipur', 'Goa', 'Delhi', 'Mumbai', 'Bengaluru']
const commonFunctions = ['Roka', 'Mehendi', 'Haldi', 'Sangeet', 'Wedding', 'Reception']

export default function Start() {
  const { dispatch } = useStore()
  const nav = useNavigate()
  const [step, setStep] = useState(0)
  const [bride, setBride] = useState('')
  const [groom, setGroom] = useState('')
  const [city, setCity] = useState('')
  const [venue, setVenue] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [fns, setFns] = useState<string[]>(['Mehendi', 'Haldi', 'Sangeet', 'Wedding'])
  const [custom, setCustom] = useState('')

  const ok = [bride.trim() && groom.trim(), city.trim() && from && to && to >= from, fns.length > 0][step]
  const go = (n: number) => { setStep(n); window.scrollTo(0, 0) }
  const finish = () => {
    dispatch({ type: 'wedding/create', brideName: bride.trim(), groomName: groom.trim(), city: city.trim(), venueName: venue.trim(), startDate: from, endDate: to, functions: fns })
    nav('/app')
  }
  const toggle = (f: string) => setFns((xs) => (xs.includes(f) ? xs.filter((x) => x !== f) : [...xs, f]))
  const h1 = 'font-display text-[32px] leading-[1.08] font-semibold'

  return (
    <div className="min-h-screen">
      <div className="pointer-events-none h-[34px] overflow-hidden"><Toran swags={4} /></div>
      <div className="mx-auto flex min-h-[calc(100vh-34px)] max-w-[480px] flex-col py-4" style={gutter}>
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2"><Mark className="h-6 w-6" /><span className="font-display text-[18px] font-semibold">WeddingStay</span></Link>
          <span className="text-[13px] text-muted num">Step {step + 1} of 3</span>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-1.5" aria-hidden="true">
          {[0, 1, 2].map((i) => <div key={i} className={clsx('h-1.5 rounded-full', i <= step ? 'bg-plum' : 'bg-sunk')} />)}
        </div>

        <div className="mt-8 flex-1">
          {step === 0 && (
            <section className="flex flex-col gap-5">
              <div>
                <h1 className={h1}>Badhai ho! 🎉<br />Who is getting married?</h1>
                <p className="mt-2 text-muted text-[15px]">Guests will see these names on their invite.</p>
              </div>
              <div><label htmlFor="bride" className="label !text-[14px]">Bride’s name</label><input id="bride" className="input !min-h-[52px] !text-[17px]" placeholder="e.g. Ananya Iyer" value={bride} onChange={(e) => setBride(e.target.value)} autoComplete="off" /></div>
              <div><label htmlFor="groom" className="label !text-[14px]">Groom’s name</label><input id="groom" className="input !min-h-[52px] !text-[17px]" placeholder="e.g. Rohan Malhotra" value={groom} onChange={(e) => setGroom(e.target.value)} autoComplete="off" /></div>
            </section>
          )}

          {step === 1 && (
            <section className="flex flex-col gap-5">
              <div>
                <h1 className={h1}>Where and when?</h1>
                <p className="mt-2 text-muted text-[15px]">Rough dates are fine. You can change them later.</p>
              </div>
              <div>
                <label htmlFor="city" className="label !text-[14px]">City</label>
                <input id="city" className="input !min-h-[52px] !text-[17px]" placeholder="e.g. Udaipur" value={city} onChange={(e) => setCity(e.target.value)} />
                <div className="mt-2 flex flex-wrap gap-2">
                  {popularCities.map((c) => (
                    <button key={c} type="button" onClick={() => setCity(c)} className={clsx('rounded-full border px-3.5 min-h-[40px] text-[14px]', city === c ? 'border-plum bg-plumsoft text-plum font-medium' : 'border-line bg-surface')}>{c}</button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label htmlFor="from" className="label !text-[14px]">First function</label><input id="from" type="date" className="input !min-h-[52px]" value={from} onChange={(e) => { setFrom(e.target.value); if (!to || to < e.target.value) setTo(e.target.value) }} /></div>
                <div><label htmlFor="to" className="label !text-[14px]">Last function</label><input id="to" type="date" className="input !min-h-[52px]" min={from} value={to} onChange={(e) => setTo(e.target.value)} /></div>
              </div>
              <div><label htmlFor="venue" className="label !text-[14px]">Venue <span className="font-normal text-muted">(optional)</span></label><input id="venue" className="input !min-h-[52px]" placeholder="e.g. Aravali Lake Resort" value={venue} onChange={(e) => setVenue(e.target.value)} /></div>
            </section>
          )}

          {step === 2 && (
            <section className="flex flex-col gap-5">
              <div>
                <h1 className={h1}>Which functions are you having?</h1>
                <p className="mt-2 text-muted text-[15px]">Tap to pick. Guests will say which ones they’re coming to.</p>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {[...commonFunctions, ...fns.filter((f) => !commonFunctions.includes(f))].map((f) => {
                  const on = fns.includes(f)
                  return (
                    <button key={f} type="button" aria-pressed={on} onClick={() => toggle(f)}
                      className={clsx('flex items-center justify-between gap-2 rounded-2xl border px-4 min-h-[56px] text-[16px] font-medium', on ? 'border-plum bg-plumsoft text-plum shadow-[0_0_0_1px_rgb(var(--plum))_inset]' : 'border-line bg-surface')}>
                      {f}
                      <span className={clsx('grid h-6 w-6 place-items-center rounded-full border', on ? 'border-plum bg-plum text-onplum' : 'border-line')}>{on && <Check size={14} />}</span>
                    </button>
                  )
                })}
              </div>
              <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); if (custom.trim()) { setFns([...fns, custom.trim()]); setCustom('') } }}>
                <input className="input" placeholder="Something else? e.g. Cocktail night" value={custom} onChange={(e) => setCustom(e.target.value)} aria-label="Add another function" />
                <button type="submit" className="btn-ghost shrink-0 !min-h-[44px]"><Plus size={16} /> Add</button>
              </form>
              <p className="text-[13px] text-muted">We’ll set times to evening by default. You can fix times and venues in Functions later.</p>
            </section>
          )}
        </div>

        <div className="sticky bottom-0 -mx-4 mt-8 flex gap-3 border-t border-line/60 bg-bg/90 px-4 pt-3 backdrop-blur-xl" style={{ paddingBottom: 'max(14px, env(safe-area-inset-bottom, 0px))' }}>
          {step > 0 && <button type="button" className="btn-ghost !min-h-[52px] !px-4" onClick={() => go(step - 1)} aria-label="Back"><ArrowLeft size={18} /></button>}
          <button type="button" className="btn-primary flex-1 !min-h-[52px] text-[16px]" disabled={!ok} style={{ opacity: ok ? 1 : 0.5 }} onClick={() => (step < 2 ? go(step + 1) : finish())}>
            {step < 2 ? <>Next <ArrowRight size={18} /></> : <>Create our wedding <Check size={18} /></>}
          </button>
        </div>
        {step === 0 && <Link to="/app" className="mt-3 block text-center text-[13.5px] text-muted underline">Just looking? See a sample wedding</Link>}
      </div>
    </div>
  )
}
