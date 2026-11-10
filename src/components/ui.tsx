import clsx from 'clsx'
import { X } from 'lucide-react'
import { useEffect, type ReactNode } from 'react'
import type { AllocationStatus, BlockStatus, InvitationState, Rsvp } from '../data/types'

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
      <div className="min-w-0">
        <h1 className="font-display text-[26px] leading-tight font-semibold text-ink">{title}</h1>
        {subtitle && <p className="mt-1 text-muted text-[14px] max-w-[65ch]">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}

type Tone = 'neutral' | 'good' | 'warn' | 'bad' | 'info' | 'plum'
const toneCls: Record<Tone, string> = {
  neutral: 'bg-sunk text-muted border-line',
  good: 'bg-good/10 text-good border-good/25',
  warn: 'bg-warn/10 text-warn border-warn/25',
  bad: 'bg-bad/10 text-bad border-bad/25',
  info: 'bg-info/10 text-info border-info/25',
  plum: 'bg-plumsoft text-plum border-plum/20',
}
export function Pill({ tone = 'neutral', children, dot }: { tone?: Tone; children: ReactNode; dot?: boolean }) {
  return (
    <span className={clsx('inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[12px] font-medium whitespace-nowrap', toneCls[tone])}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  )
}

export const rsvpTone: Record<Rsvp, Tone> = { YES: 'good', NO: 'neutral', MAYBE: 'warn', PENDING: 'info' }
export const rsvpLabel: Record<Rsvp, string> = { YES: 'Attending', NO: 'Not attending', MAYBE: 'Maybe', PENDING: 'No reply' }
export const RsvpPill = ({ r }: { r: Rsvp }) => <Pill tone={rsvpTone[r]} dot>{rsvpLabel[r]}</Pill>

export const invitationLabel: Record<InvitationState, string> = {
  NOT_SENT: 'Not sent', SENT: 'Sent, no reply', STARTED: 'Started', SUBMITTED: 'Submitted', UPDATED: 'Updated', DECLINED: 'Declined',
}
const invitationTone: Record<InvitationState, Tone> = { NOT_SENT: 'neutral', SENT: 'info', STARTED: 'warn', SUBMITTED: 'good', UPDATED: 'good', DECLINED: 'neutral' }
export const InvitationPill = ({ s }: { s: InvitationState }) => <Pill tone={invitationTone[s]} dot>{invitationLabel[s]}</Pill>

export const blockLabel: Record<BlockStatus, string> = { PLANNED: 'Planned', REQUESTED: 'Requested from hotel', HELD: 'Held by hotel', CONFIRMED: 'Confirmed by hotel', RELEASED: 'Released' }
const blockTone: Record<BlockStatus, Tone> = { PLANNED: 'neutral', REQUESTED: 'info', HELD: 'warn', CONFIRMED: 'good', RELEASED: 'neutral' }
export const BlockPill = ({ s }: { s: BlockStatus }) => <Pill tone={blockTone[s]}>{blockLabel[s]}</Pill>

export const allocLabel: Record<AllocationStatus, string> = { ASSIGNED: 'Assigned by you', SENT_TO_HOTEL: 'Sent to hotel', HOTEL_CONFIRMED: 'Hotel confirmed', GUEST_NOTIFIED: 'Guest notified' }
const allocTone: Record<AllocationStatus, Tone> = { ASSIGNED: 'neutral', SENT_TO_HOTEL: 'info', HOTEL_CONFIRMED: 'good', GUEST_NOTIFIED: 'plum' }
export const AllocPill = ({ s }: { s: AllocationStatus }) => <Pill tone={allocTone[s]}>{allocLabel[s]}</Pill>

export function Stat({ label, value, hint, tone }: { label: string; value: ReactNode; hint?: ReactNode; tone?: 'bad' | 'warn' | 'good' }) {
  return (
    <div className="card p-4 min-w-0">
      <div className="eyebrow">{label}</div>
      <div className={clsx('mt-1.5 font-display text-[28px] leading-none font-semibold num', tone === 'bad' ? 'text-bad' : tone === 'warn' ? 'text-warn' : tone === 'good' ? 'text-good' : 'text-ink')}>{value}</div>
      {hint && <div className="mt-2 text-[12.5px] text-muted">{hint}</div>}
    </div>
  )
}

export function Section({ title, action, children, className }: { title: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={clsx('card', className)}>
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-line">
        <h2 className="text-[15px] font-semibold text-ink">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}

export function Bar({ parts, total }: { parts: { value: number; cls: string; label: string }[]; total: number }) {
  return (
    <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-sunk" role="img" aria-label={parts.map((p) => `${p.label} ${p.value}`).join(', ')}>
      {parts.map((p) => (p.value > 0 ? <div key={p.label} className={p.cls} style={{ width: `${(p.value / Math.max(total, 1)) * 100}%` }} /> : null))}
    </div>
  )
}

export function Drawer({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: ReactNode; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    if (!open) return
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <button aria-label="Close" className="absolute inset-0 bg-ink/30" onClick={onClose} />
      <div className={clsx('relative h-full w-full bg-bg border-l border-line shadow-xl overflow-y-auto', wide ? 'max-w-[640px]' : 'max-w-[480px]')}
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 bg-bg/95 backdrop-blur px-5 py-4 border-b border-line">
          <div className="min-w-0 font-display text-[19px] font-semibold">{title}</div>
          <button className="btn-ghost !min-h-[36px] !px-2" onClick={onClose} aria-label="Close panel"><X size={18} /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6">
      <button aria-label="Close" className="absolute inset-0 bg-ink/35" onClick={onClose} />
      <div className="relative w-full sm:max-w-[520px] max-h-[92vh] overflow-y-auto bg-surface border border-line rounded-t-2xl sm:rounded-2xl shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-line">
          <h2 className="font-display text-[19px] font-semibold">{title}</h2>
          <button className="btn-ghost !min-h-[36px] !px-2" onClick={onClose} aria-label="Close dialog"><X size={18} /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

export function Empty({ icon, title, body, action }: { icon: ReactNode; title: string; body: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center text-center px-6 py-10 gap-2">
      <div className="text-plum">{icon}</div>
      <div className="font-semibold">{title}</div>
      <p className="text-muted max-w-[42ch]">{body}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}

export function SampleBanner() {
  return (
    <div className="rounded-lg border border-marigold/40 bg-marigold/10 px-3 py-2 text-[12.5px] text-ink">
      <span className="font-semibold">Sample data.</span> Everyone and every booking here is made up so you can try the product. Changes reset when you reload.
    </div>
  )
}
