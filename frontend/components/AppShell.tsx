import clsx from 'clsx'
import { BedDouble, CalendarHeart, Home, Settings, Users } from 'lucide-react'
import { useEffect } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { Loading } from '../pages/Open'
import { savedToken, useStore } from '../store'
import { fmtRange } from '../../shared/dates'
import { SampleBanner } from './ui'
import { Toran } from './Ornaments'

const nav = [
  { to: '/app', label: 'Home', icon: Home, end: true },
  { to: '/app/guests', label: 'Guests', icon: Users },
  { to: '/app/rooms', label: 'Rooms', icon: BedDouble },
  { to: '/app/functions', label: 'Functions', icon: CalendarHeart },
  { to: '/app/settings', label: 'Family & settings', icon: Settings },
]

export function Mark({ className }: { className?: string }) {
  // Two interlocked rings, the brand mark.
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <circle cx="12.5" cy="16" r="7.5" fill="none" stroke="rgb(var(--plum))" strokeWidth="2.6" />
      <circle cx="19.5" cy="16" r="7.5" fill="none" stroke="rgb(var(--marigold))" strokeWidth="2.6" />
    </svg>
  )
}

const gutter = { paddingLeft: 'max(16px, env(safe-area-inset-left, 0px))', paddingRight: 'max(16px, env(safe-area-inset-right, 0px))' }

export default function AppShell() {
  const { data, mode, status, problem, openWedding, openDemo } = useStore()
  const days = Math.max(0, Math.ceil((Date.parse(data.wedding.startDate) - Date.now()) / 864e5))
  // Came here from a guest link: go back to this phone's own wedding, or the sample.
  useEffect(() => { if (mode === 'guest' && status === 'ready') { const t = savedToken(); if (t) openWedding(t).catch(openDemo); else openDemo() } }, [mode, status, openWedding, openDemo])
  if (mode === 'guest' || status === 'loading') return <Loading />
  return (
    <div className="min-h-full md:flex">
      <aside className="hidden md:flex md:w-[248px] shrink-0 flex-col sticky top-0 h-screen p-3">
        <div className="flex h-full flex-col overflow-hidden rounded-[22px] border border-gold/30 bg-surface">
          <div className="pointer-events-none h-[46px] overflow-hidden"><Toran swags={3} /></div>
          <NavLink to="/" className="flex items-center gap-2 px-5 pt-1 pb-4">
            <Mark className="h-7 w-7" />
            <span className="font-display text-[19px] font-semibold">WeddingStay</span>
          </NavLink>
          <div className="mx-3 mb-4 rounded-2xl bg-gradient-to-br from-plum to-[rgb(var(--marigold))] p-[1px]">
            <div className="rounded-[15px] bg-surface/90 px-3.5 py-3">
              <div className="font-display font-semibold text-[16px] text-ink">{data.wedding.name}</div>
              <div className="text-[12.5px] text-muted">{data.wedding.city}, {fmtRange(data.wedding.startDate, data.wedding.endDate)}</div>
              <div className="mt-2 inline-flex rounded-full bg-plumsoft px-2.5 py-0.5 text-[12px] font-medium text-plum num">{days} days to go</div>
            </div>
          </div>
          <nav className="flex flex-col gap-0.5 px-3">
            {nav.map((n) => (
              <div key={n.to}>
                <NavLink to={n.to} end={n.end}
                  className={({ isActive }) => clsx('flex items-center gap-2.5 rounded-full px-3.5 py-2 text-[14px] font-medium transition-colors', isActive ? 'bg-ink text-bg' : 'text-muted hover:text-ink hover:bg-sunk')}>
                  <n.icon size={17} /> {n.label}
                </NavLink>
              </div>
            ))}
          </nav>
          <div className="mt-auto m-3 flex items-center gap-2.5 rounded-2xl bg-sunk px-3 py-2.5">
            <div className="h-8 w-8 rounded-full bg-plum text-onplum grid place-items-center text-[13px] font-semibold">{data.wedding.brideName[0]}</div>
            <div className="min-w-0"><div className="text-[13px] font-medium">{data.wedding.brideName}</div><div className="text-[12px] text-muted">You</div></div>
          </div>
        </div>
      </aside>

      <div className="flex-1 min-w-0 pb-24 md:pb-10">
        <div className="md:hidden pointer-events-none h-[34px] overflow-hidden"><Toran swags={4} /></div>
        <header className="md:hidden sticky z-20 flex items-center justify-between gap-2 border-b border-line bg-bg/85 backdrop-blur-xl py-3" style={{ top: 'env(safe-area-inset-top, 0px)', ...gutter }}>
          <NavLink to="/" className="flex items-center gap-2"><Mark className="h-6 w-6" /><span className="font-display text-[17px] font-semibold">WeddingStay</span></NavLink>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-plumsoft px-2.5 py-0.5 text-[12px] font-medium text-plum num">{days} days to go</span>
            <NavLink to="/app/settings" aria-label="Family and settings" className={({ isActive }) => clsx('grid h-11 w-11 place-items-center rounded-full border border-line', isActive ? 'bg-ink text-bg' : 'bg-surface text-muted')}><Settings size={18} /></NavLink>
          </div>
        </header>
        <main className="mx-auto max-w-[1180px] py-6 md:py-8" style={gutter}>
          {mode === 'demo' && <div className="mb-6"><SampleBanner /></div>}
          {problem && <div role="alert" className="mb-6 rounded-2xl border border-[rgb(var(--bad)/0.4)] bg-[rgb(var(--bad)/0.08)] px-4 py-3 text-[14.5px] font-medium">{problem}</div>}
          <Outlet />
        </main>
      </div>

      <nav className="md:hidden fixed bottom-3 inset-x-3 z-30 grid grid-cols-4 rounded-full border border-line bg-surface/90 backdrop-blur-xl shadow-[0_12px_30px_-12px_rgb(0_0_0/0.35)]"
        style={{ marginBottom: 'env(safe-area-inset-bottom, 0px)', marginLeft: 'env(safe-area-inset-left, 0px)', marginRight: 'env(safe-area-inset-right, 0px)' }}>
        {nav.slice(0, 4).map((n) => (
          <NavLink key={n.to} to={n.to} end={n.end}
            className={({ isActive }) => clsx('flex flex-col items-center gap-0.5 py-2.5 min-h-[58px] justify-center text-[12.5px] font-semibold', isActive ? 'text-plum' : 'text-muted')}>
            <n.icon size={21} /> {n.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
