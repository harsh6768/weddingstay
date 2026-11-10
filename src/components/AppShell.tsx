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
      <circle cx="12.5" cy="16" r="7.5" fill="none" stroke="rgb(var(--plum))" strokeWidth="2.6" />
      <circle cx="19.5" cy="16" r="7.5" fill="none" stroke="rgb(var(--marigold))" strokeWidth="2.6" />
    </svg>
  )
}

const gutter = { paddingLeft: 'max(16px, env(safe-area-inset-left, 0px))', paddingRight: 'max(16px, env(safe-area-inset-right, 0px))' }

export default function AppShell() {
  const { data } = useStore()
  const loc = useLocation()
  const inAcc = loc.pathname.startsWith('/app/accommodation')
  const days = Math.ceil((Date.parse(data.wedding.startDate) - Date.parse('2026-11-10')) / 864e5)
  return (
    <div className="min-h-full md:flex">
      <aside className="hidden md:flex md:w-[248px] shrink-0 flex-col sticky top-0 h-screen p-3">
        <div className="flex h-full flex-col rounded-[22px] border border-line bg-surface">
          <NavLink to="/" className="flex items-center gap-2 px-5 pt-5 pb-4">
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
                  className={({ isActive }) => clsx('flex items-center gap-2.5 rounded-full px-3.5 py-2 text-[14px] font-medium transition-colors', isActive || (n.label === 'Accommodation' && inAcc) ? 'bg-ink text-bg' : 'text-muted hover:text-ink hover:bg-sunk')}>
                  <n.icon size={17} /> {n.label}
                </NavLink>
                {n.label === 'Accommodation' && inAcc && (
                  <div className="ml-[26px] mt-1 mb-1.5 flex flex-col gap-0.5 border-l border-line pl-2">
                    {accNav.map((s) => (
                      <NavLink key={s.to} to={s.to} end={s.end}
                        className={({ isActive }) => clsx('rounded-full px-3 py-1.5 text-[13px]', isActive ? 'bg-plumsoft text-plum font-medium' : 'text-muted hover:text-ink')}>
                        {s.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
          <div className="mt-auto m-3 flex items-center gap-2.5 rounded-2xl bg-sunk px-3 py-2.5">
            <div className="h-8 w-8 rounded-full bg-plum text-onplum grid place-items-center text-[13px] font-semibold">A</div>
            <div className="min-w-0"><div className="text-[13px] font-medium">Ananya Iyer</div><div className="text-[12px] text-muted">Owner</div></div>
          </div>
        </div>
      </aside>

      <div className="flex-1 min-w-0 pb-24 md:pb-10">
        <header className="md:hidden sticky z-20 flex items-center justify-between gap-2 border-b border-line bg-bg/85 backdrop-blur-xl py-3" style={{ top: 'env(safe-area-inset-top, 0px)', ...gutter }}>
          <NavLink to="/" className="flex items-center gap-2"><Mark className="h-6 w-6" /><span className="font-display text-[17px] font-semibold">WeddingStay</span></NavLink>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-plumsoft px-2.5 py-0.5 text-[12px] font-medium text-plum num">{days} days to go</span>
            <NavLink to="/app/settings" aria-label="Settings" className={({ isActive }) => clsx('grid h-10 w-10 place-items-center rounded-full border border-line', isActive ? 'bg-ink text-bg' : 'bg-surface text-muted')}><Settings size={18} /></NavLink>
          </div>
        </header>
        {inAcc && (
          <div className="md:hidden flex gap-1.5 overflow-x-auto py-2.5" style={gutter}>
            {accNav.map((s) => (
              <NavLink key={s.to} to={s.to} end={s.end} className={({ isActive }) => clsx('whitespace-nowrap rounded-full px-3.5 py-1.5 text-[13px] font-medium', isActive ? 'bg-ink text-bg' : 'bg-sunk text-muted')}>{s.label}</NavLink>
            ))}
          </div>
        )}
        <main className="mx-auto max-w-[1180px] py-6 md:py-8" style={gutter}>
          <div className="mb-6"><SampleBanner /></div>
          <Outlet />
        </main>
      </div>

      <nav className="md:hidden fixed bottom-3 inset-x-3 z-30 grid grid-cols-5 rounded-full border border-line bg-surface/90 backdrop-blur-xl shadow-[0_12px_30px_-12px_rgb(0_0_0/0.35)]"
        style={{ marginBottom: 'env(safe-area-inset-bottom, 0px)', marginLeft: 'env(safe-area-inset-left, 0px)', marginRight: 'env(safe-area-inset-right, 0px)' }}>
        {nav.slice(0, 5).map((n) => (
          <NavLink key={n.to} to={n.to} end={n.end}
            className={({ isActive }) => clsx('flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium', isActive || (n.label === 'Accommodation' && inAcc) ? 'text-plum' : 'text-muted')}>
            <n.icon size={19} /> {n.label === 'Accommodation' ? 'Rooms' : n.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
