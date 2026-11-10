import { MapPin, Plus, Shirt } from 'lucide-react'
import { PageHeader, Pill } from '../components/ui'
import { fmtDow, fmtTime } from '../lib/dates'
import { functionHeadcount } from '../lib/stats'
import { useStore } from '../store'

export default function Functions() {
  const { data, dispatch } = useStore()
  return (
    <>
      <PageHeader title="Functions" subtitle="Guests RSVP to each published function separately. Unpublished ones stay hidden from guest links."
        actions={<button className="btn-primary"><Plus size={16} /> Add function</button>} />
      <div className="grid gap-4 md:grid-cols-2">
        {data.functions.map((f) => {
          const h = functionHeadcount(data, f.id)
          return (
            <article key={f.id} className="card p-5 flex flex-col gap-3 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="eyebrow">{fmtDow(f.date)} · {fmtTime(f.startTime)} to {fmtTime(f.endTime)}</div>
                  <h2 className="mt-1 font-display text-[22px] font-semibold">{f.name}</h2>
                </div>
                <label className="flex items-center gap-2 text-[13px] cursor-pointer select-none">
                  <input id={`pub-${f.id}`} type="checkbox" className="h-4 w-4 accent-[rgb(var(--plum))]" checked={f.isPublished} onChange={(e) => dispatch({ type: 'function/publish', id: f.id, published: e.target.checked })} />
                  {f.isPublished ? 'Shown to guests' : 'Hidden'}
                </label>
              </div>
              <div className="flex flex-col gap-1 text-[13.5px] text-muted">
                <span className="flex items-center gap-2"><MapPin size={15} /> {f.venueName}, {f.venueAddress}</span>
                {f.dressCode && <span className="flex items-center gap-2"><Shirt size={15} /> {f.dressCode}</span>}
              </div>
              {f.description && <p className="text-[13.5px]">{f.description}</p>}
              <div className="mt-auto pt-3 border-t border-line flex flex-wrap gap-2 items-center">
                {f.isPublished ? (
                  <>
                    <span className="font-display text-[22px] font-semibold num mr-1">{h.yes}</span><span className="text-muted text-[13px] mr-2">expected</span>
                    <Pill tone="warn">{h.maybe} maybe</Pill><Pill tone="info">{h.pending} no reply</Pill><Pill>{h.no} not coming</Pill>
                  </>
                ) : <span className="text-[13px] text-muted">Publish to start collecting RSVPs for this function.</span>}
              </div>
            </article>
          )
        })}
      </div>
    </>
  )
}
