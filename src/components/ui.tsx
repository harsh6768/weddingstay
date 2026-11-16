import clsx from 'clsx'
import { X } from 'lucide-react'
import { useEffect, type ReactNode } from 'react'
import type { AllocationStatus, BlockStatus, InvitationState, Rsvp } from '../data/types'

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-7">
      <div className="min-w-0">
        <h1 className="font-display text-[30px] md:text-[38px] leading-[1.05] font-semibold text-ink">{title}</h1>
        {subtitle && <p className="mt-1 text-muted text-[14px] max-w-[65ch]">{subtitle}</p>}
      </div>
      {actions && <div className="flex w-full sm:w-auto gap-2 overflow-x-auto sm:overflow-visible sm:flex-wrap [&>*]:shrink-0">{actions}</div>}
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
    <span className={clsx('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[12px] font-medium whitespace-nowrap', toneCls[tone])}>
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
    <div className="card p-5 min-w-0">
      <div className="eyebrow">{label}</div>
      <div className={clsx('mt-3 font-display text-[40px] leading-none font-semibold num', tone === 'bad' ? 'text-bad' : tone === 'warn' ? 'text-warn' : tone === 'good' ? 'text-good' : 'text-ink')}>{value}</div>
      {hint && <div className="mt-2 text-[12.5px] text-muted">{hint}</div>}
    </div>
  )
}

export function Section({ title, action, children, className }: { title: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={clsx('card', className)}>
      <div className="flex items-center justify-between gap-3 px-5 pt-4 pb-3">
        <h2 className="font-display text-[18px] font-semibold text-ink">{title}</h2>
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
      <button aria-label="Close" className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className={clsx('relative h-full w-full bg-bg border-l border-line shadow-2xl overflow-y-auto', wide ? 'max-w-[640px]' : 'max-w-[480px]')}
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
      <button aria-label="Close" className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full sm:max-w-[540px] max-h-[92vh] overflow-y-auto bg-surface border border-line rounded-t-[24px] sm:rounded-[24px] shadow-2xl">
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
    <div className="inline-block rounded-full border border-marigold/35 bg-marigold/10 px-3.5 py-1 text-[12.5px] text-ink">
      <span className="font-semibold">Preview</span> · sample data, nothing is saved
    </div>
  )
}

/** Filter chips: one tap, no dropdowns. */
export function Chips<T extends string>({ value, onChange, options, label }: { value: T; onChange: (v: T) => void; options: { v: T; label: string; count?: number }[]; label: string }) {
  return (
    <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:px-0" role="tablist" aria-label={label}>
      {options.map((o) => (
        <button key={o.v} type="button" role="tab" aria-selected={value === o.v} onClick={() => onChange(o.v)}
          className={clsx('shrink-0 whitespace-nowrap rounded-full border px-3.5 min-h-[44px] text-[14px] font-medium transition-colors',
            value === o.v ? 'border-ink bg-ink text-bg' : 'border-line bg-surface text-ink hover:bg-sunk')}>
          {o.label}{o.count !== undefined && <span className={clsx('ml-1.5 num', value === o.v ? 'opacity-70' : 'text-muted')}>{o.count}</span>}
        </button>
      ))}
    </div>
  )
}

/** Big tappable choice buttons, used for side, yes/no and similar questions. */
export function Choices<T extends string>({ value, onChange, options, label, cols }: { value: T | ''; onChange: (v: T) => void; options: { v: T; label: string; sub?: string }[]; label: string; cols?: number }) {
  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${cols ?? options.length}, minmax(0, 1fr))` }} role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <button key={o.v} type="button" role="radio" aria-checked={value === o.v} onClick={() => onChange(o.v)}
          className={clsx('rounded-2xl border px-3 py-2.5 min-h-[52px] text-center transition-colors',
            value === o.v ? 'border-plum bg-plumsoft text-plum shadow-[0_0_0_1px_rgb(var(--plum))_inset]' : 'border-line bg-surface text-ink hover:bg-sunk')}>
          <div className="text-[15px] font-semibold leading-tight">{o.label}</div>
          {o.sub && <div className="mt-0.5 text-[12.5px] opacity-75">{o.sub}</div>}
        </button>
      ))}
    </div>
  )
}

export function Stepper({ value, onChange, label, min = 0, max = 20 }: { value: number; onChange: (n: number) => void; label: string; min?: number; max?: number }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-surface px-3 py-2">
      <span className="text-[15px] font-medium">{label}</span>
      <div className="flex items-center gap-3">
        <button type="button" className="grid h-11 w-11 place-items-center rounded-full border border-line text-[22px] leading-none disabled:opacity-40" onClick={() => onChange(value - 1)} disabled={value <= min} aria-label={`Fewer ${label}`}>−</button>
        <span className="w-6 text-center font-display text-[22px] font-semibold num" aria-live="polite">{value}</span>
        <button type="button" className="grid h-11 w-11 place-items-center rounded-full border border-line text-[22px] leading-none disabled:opacity-40" onClick={() => onChange(value + 1)} disabled={value >= max} aria-label={`More ${label}`}>+</button>
      </div>
    </div>
  )
}

export function WhatsAppIcon({ size = 18 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" fill="currentColor">
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.4.1-.2 0-.3 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2s.2-1.1.1-1.2l-.4-.2Z" />
    </svg>
  )
}

/** The green WhatsApp button. Opens WhatsApp with the message ready; the person presses send there. */
export function WhatsAppButton({ href, children, onClick, className, small }: { href: string; children: ReactNode; onClick?: () => void; className?: string; small?: boolean }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" onClick={onClick}
      className={clsx('inline-flex items-center justify-center gap-2 rounded-full bg-[#1f9d55] font-semibold text-white shadow-[0_8px_20px_-10px_rgb(31_157_85/0.8)] transition active:scale-[0.98] hover:brightness-110',
        small ? 'min-h-[44px] px-4 text-[14px]' : 'min-h-[52px] px-5 text-[16px]', className)}>
      <WhatsAppIcon size={small ? 17 : 20} /> {children}
    </a>
  )
}

/** A WhatsApp-style preview of the message the person is about to send. */
export function ChatBubble({ text }: { text: string }) {
  return (
    <div className="rounded-2xl bg-[#e7f7dc] p-3 text-[14px] leading-relaxed text-[#1b2b1b] whitespace-pre-line shadow-sm dark:bg-[#1f3a2a] dark:text-[#e3f2e3]">
      {text}
    </div>
  )
}
