import clsx from 'clsx'
import { BedDouble, CalendarHeart, LayoutGrid, Send, Settings, Users } from 'lucide-react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useStore } from '../store'
import { fmtRange } from '../lib/dates'
import { SampleBanner } from './ui'

const nav = [
  { to: '/app', label: 'Overview', icon: LayoutGrid, end: true },
  { to: '/app/guests', label: 'Guests', icon: Users },
  { to: '/app/invitations', label: 'Invitations', icon: Send },
  { to: '/app/functions', label: 'Functions', icon: CalendarHeart },
  { to: '/app/accommodation', label: 'Accommodation', icon: BedDouble },
  { to: '/app/settings', label: 'Settings', icon: Settings },
]

export const accNav = [
  { to: '/app/accommodation', label: 'Hotels & rooms', end: true },
  { to: '/app/accommodation/requirements', label: 'Guest requirements' },
  { to: '/app/accommodation/allocation', label: 'Room allocation' },
  { to: '/app/accommodation/rooming', label: 'Rooming lists' },
]

export function Mark({ className }: { className?: string }) {
  // Two interlocked rings, the brand mark.
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <circle cx="12.5" cy="16" r="7.5" fill="none" stroke="currentColor" strokeWidth="2.4" />
      <circle cx="19.5" cy="16" r="7.5" fill="none" stroke="rgb(var(--marigold))" strokeWidth="2.4" />
    </svg>
  )
}

export default function AppShell() {
  const { data } = useStore()
  const loc = useLocation()
  const inAcc = loc.pathname.startsWith('/app/accommodation')
  return (
    <div className="min-h-full md:flex">
      <aside className="hidden md:flex md:w-[232px] shrink-0 flex-col border-r border-line bg-surface sticky top-0 h-screen">
        <NavLink to="/" className="flex items-center gap-2 px-5 pt-5 pb-4">
          <Mark className="h-7 w-7 text-plum" />
          <span className="font-display text-[19px] font-semibold">WeddingStay</span>
        </NavLink>
        <div className="mx-3 mb-3 rounded-lg bg-plumsoft px-3 py-2.5">
          <div className="font-semibold text-[14px] text-ink">{data.wedding.name}</div>
          <div className="text-[12.5px] text-muted">{data.wedding.city} · {fmtRange(data.wedding.startDate, data.wedding.endDate)} 2026</div>
        </div>
        <nav className="flex flex-col gap-0.5 px-3">
          {nav.map((n) => (
            <div key={n.to}>
              <NavLink to={n.to} end={n.end}
                className={({ isActive }) => clsx('flex items-center gap-2.5 rounded-lg px-3 py-2 text-[14px] font-medium', isActive || (n.label === 'Accommodation' && inAcc) ? 'bg-sunk text-ink' : 'text-muted hover:text-ink hover:bg-sunk/60')}>
                <n.icon size={17} /> {n.label}
              </NavLink>
              {n.label === 'Accommodation' && inAcc && (
                <div className="ml-[34px] mt-0.5 mb-1 flex flex-col border-l border-line">
                  {accNav.map((s) => (
                    <NavLink key={s.to} to={s.to} end={s.end}
                      className={({ isActive }) => clsx('pl-3 py-1.5 text-[13px] -ml-px border-l', isActive ? 'border-plum text-ink font-medium' : 'border-transparent text-muted hover:text-ink')}>
                      {s.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
        <div className="mt-auto p-4 text-[12px] text-muted">Signed in as Ananya Iyer (owner)</div>
      </aside>

      <div className="flex-1 min-w-0 pb-24 md:pb-10">
        <header className="md:hidden sticky z-20 flex items-center justify-between gap-2 border-b border-line bg-surface/95 backdrop-blur py-3"
          style={{ top: 'env(safe-area-inset-top, 0px)', paddingLeft: 'max(16px, env(safe-area-inset-left, 0px))', paddingRight: 'max(16px, env(safe-area-inset-right, 0px))' }}>
          <NavLink to="/" className="flex items-center gap-2"><Mark className="h-6 w-6 text-plum" /><span className="font-display text-[17px] font-semibold">WeddingStay</span></NavLink>
          <span className="text-[12.5px] text-muted truncate">{data.wedding.name} · {data.wedding.city}</span>
        </header>
        {inAcc && (
          <div className="md:hidden flex gap-1 overflow-x-auto border-b border-line bg-surface py-2" style={{ paddingLeft: 'max(16px, env(safe-area-inset-left, 0px))', paddingRight: 'max(16px, env(safe-area-inset-right, 0px))' }}>
            {accNav.map((s) => (
              <NavLink key={s.to} to={s.to} end={s.end} className={({ isActive }) => clsx('whitespace-nowrap rounded-full px-3 py-1.5 text-[13px]', isActive ? 'bg-plum text-onplum' : 'bg-sunk text-muted')}>{s.label}</NavLink>
            ))}
          </div>
        )}
        <main className="mx-auto max-w-[1160px] py-6 md:py-8" style={{ paddingLeft: 'max(16px, env(safe-area-inset-left, 0px))', paddingRight: 'max(16px, env(safe-area-inset-right, 0px))' }}>
          <div className="mb-5"><SampleBanner /></div>
          <Outlet />
        </main>
      </div>

      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 grid grid-cols-5 border-t border-line bg-surface"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)', paddingLeft: 'env(safe-area-inset-left, 0px)', paddingRight: 'env(safe-area-inset-right, 0px)' }}>
        {nav.slice(0, 5).map((n) => (
          <NavLink key={n.to} to={n.to} end={n.end}
            className={({ isActive }) => clsx('flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium', isActive || (n.label === 'Accommodation' && inAcc) ? 'text-plum' : 'text-muted')}>
            <n.icon size={20} /> {n.label === 'Accommodation' ? 'Rooms' : n.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
