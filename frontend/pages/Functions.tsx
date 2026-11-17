import clsx from 'clsx'
import { MapPin, Plus, Shirt } from 'lucide-react'
import { useState } from 'react'
import { Modal } from '../components/ui'
import { addDays, fmtDow, fmtTime } from '../../shared/dates'
import { functionHeadcount } from '../lib/stats'
import { useStore } from '../store'

export default function Functions() {
  const { data, dispatch } = useStore()
  const [adding, setAdding] = useState(false)
  return (
    <div className="mx-auto max-w-[760px]">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-[34px] md:text-[40px] leading-[1.05] font-semibold">Functions</h1>
          <p className="mt-0.5 text-[15px] text-muted">Guests say which ones they’re coming to.</p>
        </div>
        <button className="btn-primary w-full !min-h-[52px] text-[16px] sm:w-auto" onClick={() => setAdding(true)}><Plus size={18} /> Add a function</button>
      </div>
      <ul className="grid gap-3">
        {data.functions.map((f) => {
          const h = functionHeadcount(data, f.id)
          return (
            <li key={f.id} className={clsx('card p-4', !f.isPublished && 'opacity-80')}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[13.5px] font-medium text-plum">{fmtDow(f.date)} · {fmtTime(f.startTime)}</div>
                  <h2 className="font-display text-[24px] font-semibold leading-tight">{f.name}</h2>
                  <div className="mt-1 flex flex-col gap-0.5 text-[14px] text-muted">
                    <span className="flex items-center gap-1.5"><MapPin size={14} /> {f.venueName}</span>
                    {f.dressCode && <span className="flex items-center gap-1.5"><Shirt size={14} /> {f.dressCode}</span>}
                  </div>
                </div>
                {f.isPublished && data.guests.length > 0 && <div className="text-right"><div className="font-display text-[28px] font-semibold leading-none num">{h.yes}</div><div className="text-[12.5px] text-muted">coming</div></div>}
              </div>
              <label className="mt-3 flex min-h-[48px] cursor-pointer items-center justify-between gap-3 rounded-2xl bg-sunk/70 px-3.5">
                <span className="text-[14.5px]">{f.isPublished ? 'Guests can see this' : 'Hidden from guests'}</span>
                <span className="relative inline-flex">
                  <input type="checkbox" className="peer sr-only" checked={f.isPublished} onChange={(e) => dispatch({ type: 'function/publish', id: f.id, published: e.target.checked })} />
                  <span className="h-7 w-12 rounded-full bg-line transition-colors peer-checked:bg-good" />
                  <span className="absolute left-0.5 top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
                </span>
              </label>
            </li>
          )
        })}
      </ul>
      {adding && <AddFunction onClose={() => setAdding(false)} />}
    </div>
  )
}

const ideas = ['Roka', 'Mehendi', 'Haldi', 'Sangeet', 'Cocktail', 'Wedding', 'Reception']
const times: [string, string][] = [['10:00', 'Morning'], ['13:00', 'Afternoon'], ['19:00', 'Evening']]

function AddFunction({ onClose }: { onClose: () => void }) {
  const { data, dispatch } = useStore()
  const [name, setName] = useState('')
  const [date, setDate] = useState(data.wedding.startDate)
  const [time, setTime] = useState('19:00')
  const [venue, setVenue] = useState(data.wedding.venueName)
  const ok = name.trim() && date
  const save = () => {
    dispatch({ type: 'function/add', fn: { id: `fn${Date.now().toString(36)}`, name: name.trim(), date, startTime: time, endTime: time, venueName: venue.trim() || data.wedding.venueName, venueAddress: data.wedding.city, isPublished: true } })
    onClose()
  }
  const days = Array.from({ length: Math.round((Date.parse(data.wedding.endDate) - Date.parse(data.wedding.startDate)) / 864e5) + 3 }, (_, i) => addDays(data.wedding.startDate, i - 1))
  return (
    <Modal open onClose={onClose} title="Add a function">
      <div className="grid gap-4">
        <div>
          <label htmlFor="fname" className="label !text-[14px]">Name</label>
          <input id="fname" className="input !min-h-[50px] !text-[16px]" placeholder="e.g. Sangeet" value={name} onChange={(e) => setName(e.target.value)} />
          <div className="mt-2 flex flex-wrap gap-2">{ideas.filter((x) => !data.functions.some((f) => f.name === x)).map((x) => <button key={x} type="button" className="rounded-full border border-line px-3.5 min-h-[40px] text-[14px]" onClick={() => setName(x)}>{x}</button>)}</div>
        </div>
        <div>
          <div className="label !text-[14px]">Day</div>
          <div className="grid grid-cols-3 gap-2">
            {days.map((d) => <button key={d} type="button" aria-pressed={date === d} onClick={() => setDate(d)} className={clsx('rounded-2xl border min-h-[52px] text-[14px] font-medium', date === d ? 'border-plum bg-plumsoft text-plum' : 'border-line bg-surface')}>{fmtDow(d)}</button>)}
          </div>
        </div>
        <div>
          <div className="label !text-[14px]">Time</div>
          <div className="grid grid-cols-3 gap-2">
            {times.map(([t, l]) => <button key={t} type="button" aria-pressed={time === t} onClick={() => setTime(t)} className={clsx('rounded-2xl border min-h-[52px] text-[14px]', time === t ? 'border-plum bg-plumsoft text-plum font-medium' : 'border-line bg-surface')}><b>{l}</b><br /><span className="text-[12.5px] opacity-75">{fmtTime(t)}</span></button>)}
          </div>
        </div>
        <div><label htmlFor="fvenue" className="label !text-[14px]">Where?</label><input id="fvenue" className="input !min-h-[50px]" value={venue} onChange={(e) => setVenue(e.target.value)} /></div>
        <button className="btn-primary !min-h-[52px] text-[16px]" disabled={!ok} style={{ opacity: ok ? 1 : 0.5 }} onClick={save}>Save function</button>
      </div>
    </Modal>
  )
}
