import clsx from 'clsx'
import { Check, Eye } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import RsvpHero from '../components/RsvpHero'
import { PageHeader, Pill } from '../components/ui'
import { templates, templateStyle, type RsvpTemplate } from '../lib/templates'
import { useStore } from '../store'

/** A live, scaled-down guest page in the given design. */
function MiniRsvp({ t }: { t: RsvpTemplate }) {
  const { data } = useStore()
  return (
    <div className="pointer-events-none relative h-[400px] overflow-hidden rounded-t-[19px] select-none" style={{ background: templateStyle(t).background, ...templateStyle(t) }} aria-hidden="true">
      <div className="invite absolute left-1/2 top-0 w-[390px] -translate-x-1/2 origin-top pb-10" style={{ ...templateStyle(t), background: "transparent", zoom: 0.82 }}>
        <RsvpHero t={t} bride={data.wedding.brideName.split(' ')[0]} groom={data.wedding.groomName.split(' ')[0]} venue={data.wedding.venueName} city={data.wedding.city} />
        <div className="px-4 pt-4 text-center">
          <div className="font-head text-[26px] font-semibold">Namaste Prakash ji</div>
          <div className="card mt-3 p-4 text-left">
            <div className="font-semibold">Prakash Venkatesh</div>
            <div className="mt-2 grid grid-cols-3 gap-2 text-[14px] font-medium">
              <span className="grid min-h-[42px] place-items-center rounded-full bg-plum text-onplum">Yes</span>
              <span className="grid min-h-[42px] place-items-center rounded-full border border-gold/40 bg-surface">No</span>
              <span className="grid min-h-[42px] place-items-center rounded-full border border-gold/40 bg-surface">Not sure</span>
            </div>
          </div>
          <div className="btn-primary mt-4 w-full">Continue</div>
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-surface to-transparent" />
    </div>
  )
}

export default function RsvpDesign() {
  const { data, dispatch } = useStore()
  const current = data.wedding.rsvpTemplate
  const [tab, setTab] = useState<'all' | 'artistic' | 'modern'>('all')
  const shown = templates.filter((t) => tab === 'all' || (tab === 'artistic' ? t.category === 'artistic' : t.category !== 'artistic'))
  return (
    <>
      <PageHeader title="RSVP design" subtitle="Pick how your guest link looks. Every family sees the design you choose, and you can change it anytime, even after links are sent."
        actions={<Link to="/app/invitations" className="btn-ghost">Back to invitations</Link>} />
      <div className="mb-5 flex gap-1.5 overflow-x-auto" role="tablist">
        {([['all', `All designs (${templates.length})`], ['artistic', 'Artistic & illustrated'], ['modern', 'Classic & modern']] as const).map(([k, label]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)}
            className={clsx('whitespace-nowrap rounded-full px-3.5 py-1.5 text-[13px] font-medium', tab === k ? 'bg-ink text-bg' : 'bg-sunk text-muted hover:text-ink')}>{label}</button>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {shown.map((t) => {
          const on = t.id === current
          return (
            <article key={t.id} className={clsx('card overflow-hidden flex flex-col', on && 'ring-2 ring-plum ring-offset-2 ring-offset-bg')}>
              <MiniRsvp t={t} />
              <div className="flex flex-1 flex-col gap-3 border-t border-line p-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-display text-[20px] font-semibold">{t.name}</h2>
                    {on ? <Pill tone="plum"><Check size={12} /> In use</Pill> : t.category === 'artistic' ? <Pill tone="warn">Artistic</Pill> : t.category === 'modern' ? <Pill tone="info">Modern</Pill> : <Pill>Classic</Pill>}
                  </div>
                  <p className="mt-1 text-[13px] text-muted">{t.mood}</p>
                  <div className="mt-2 flex gap-1.5" aria-label="Colours">
                    {(['bg', 'plum', 'gold', 'ink'] as const).map((k) => <span key={k} className="h-4 w-4 rounded-full border border-line" style={{ background: `rgb(${t.vars[k]})` }} />)}
                  </div>
                </div>
                <div className="mt-auto flex gap-2">
                  <Link to={`/g/h05?design=${t.id}`} className="btn-ghost flex-1"><Eye size={16} /> Preview</Link>
                  <button type="button" className={clsx('flex-1', on ? 'btn-ghost opacity-60' : 'btn-primary')} disabled={on} onClick={() => dispatch({ type: 'wedding/template', id: t.id })}>
                    {on ? 'Selected' : 'Use this design'}
                  </button>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </>
  )
}
