import { Copy, ExternalLink, MessageCircle, Palette, Share2 } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { InvitationPill, Modal, PageHeader, Pill } from '../components/ui'
import { templateById } from '../lib/templates'
import type { Household, InvitationState } from '../data/types'
import { sideLabel } from '../lib/stats'
import { useStore } from '../store'

const tabs: { key: string; label: string; states: InvitationState[] }[] = [
  { key: 'pending', label: 'Waiting on', states: ['NOT_SENT', 'SENT', 'STARTED'] },
  { key: 'done', label: 'Responded', states: ['SUBMITTED', 'UPDATED', 'DECLINED'] },
  { key: 'all', label: 'All families', states: ['NOT_SENT', 'SENT', 'STARTED', 'SUBMITTED', 'UPDATED', 'DECLINED'] },
]

async function copy(text: string, el?: HTMLElement | null) {
  try { await navigator.clipboard.writeText(text); return true } catch {
    if (el) { const r = document.createRange(); r.selectNodeContents(el); const s = window.getSelection(); s?.removeAllRanges(); s?.addRange(r) }
    return false
  }
}

export default function Invitations() {
  const { data } = useStore()
  const [tab, setTab] = useState('pending')
  const [share, setShare] = useState<Household | null>(null)
  const [copied, setCopied] = useState(false)
  const t = tabs.find((x) => x.key === tab)!
  const list = data.households.filter((h) => t.states.includes(h.invitation))
  const count = (k: string) => data.households.filter((h) => tabs.find((x) => x.key === k)!.states.includes(h.invitation)).length
  const reminder = `Hi! Gentle reminder from Ananya & Rohan: please fill in your RSVP and travel dates for Udaipur by 25 Nov so we can book your rooms. Your family's link is in our earlier message. Thank you!`

  return (
    <>
      <PageHeader title="Invitations & responses" subtitle="Each family gets one private link. You share it from your own WhatsApp; we track who has replied."
        actions={<Link to="/app/invitations/design" className="btn-primary"><Palette size={16} /> RSVP design: {templateById(data.wedding.rsvpTemplate).name}</Link>} />

      <div className="grid gap-3 sm:grid-cols-3 mb-5">
        {(['NOT_SENT', 'SENT', 'STARTED'] as InvitationState[]).map((s) => (
          <div key={s} className="card p-4">
            <div className="eyebrow">{s === 'NOT_SENT' ? 'Link not shared' : s === 'SENT' ? 'Shared, not opened or no reply' : 'Started, not submitted'}</div>
            <div className="mt-1.5 font-display text-[28px] font-semibold num">{data.households.filter((h) => h.invitation === s).length}<span className="text-[14px] text-muted font-sans font-normal"> families</span></div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 border-b border-line">
          <div className="flex gap-1" role="tablist">
            {tabs.map((x) => (
              <button key={x.key} role="tab" aria-selected={tab === x.key} onClick={() => setTab(x.key)}
                className={`rounded-lg px-3 py-1.5 text-[13.5px] font-medium ${tab === x.key ? 'bg-sunk text-ink' : 'text-muted hover:text-ink'}`}>
                {x.label} <span className="num text-muted">{count(x.key)}</span>
              </button>
            ))}
          </div>
          {tab === 'pending' && (
            <button className="btn-ghost !min-h-[36px]" onClick={async () => { await copy(reminder); setCopied(true); setTimeout(() => setCopied(false), 1800) }}>
              <Copy size={15} /> {copied ? 'Reminder copied' : 'Copy reminder text'}
            </button>
          )}
        </div>
        <ul className="divide-y divide-line">
          {list.map((h) => {
            const members = data.guests.filter((g) => g.householdId === h.id)
            const contact = members[0]
            return (
              <li key={h.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <div className="font-medium">{h.name}</div>
                  <div className="text-[12.5px] text-muted">{contact.firstName} {contact.lastName} · {members.length} people · {sideLabel[h.side]}{h.sentAt ? ` · shared ${Number(h.sentAt.slice(8))} ${h.sentAt.slice(5, 7) === '10' ? 'Oct' : 'Nov'}` : ''}</div>
                </div>
                <InvitationPill s={h.invitation} />
                <button className="btn-ghost !min-h-[36px]" onClick={() => setShare(h)}><Share2 size={15} /> {h.invitation === 'NOT_SENT' ? 'Share link' : 'Share again'}</button>
              </li>
            )
          })}
          {list.length === 0 && <li className="px-4 py-10 text-center text-muted">Every family has responded.</li>}
        </ul>
      </div>

      <ShareModal household={share} onClose={() => setShare(null)} />
    </>
  )
}

function ShareModal({ household, onClose }: { household: Household | null; onClose: () => void }) {
  const { data, dispatch } = useStore()
  const [done, setDone] = useState<string | null>(null)
  if (!household) return null
  const contact = data.guests.find((g) => g.id === household.primaryContactId)!
  const link = `https://weddingstay.in/r/${btoa(household.id + 'k7Qm').replace(/=/g, '')}x9Lp2`
  const msg = `Hi ${contact.firstName}, we're excited to celebrate with you at Ananya & Rohan's wedding in Udaipur (11 to 13 Dec). Please confirm who from your family is coming and share your travel and stay details here: ${link} Thank you!`
  return (
    <Modal open onClose={() => { setDone(null); onClose() }} title={`Share with ${household.name}`}>
      <div className="eyebrow mb-1.5">Private link</div>
      <div className="flex gap-2">
        <code id="share-link" className="flex-1 min-w-0 truncate rounded-lg bg-sunk px-3 py-2.5 text-[13px]">{link}</code>
        <button className="btn-ghost" onClick={async () => { await copy(link, document.getElementById('share-link')); setDone('Link copied') }}><Copy size={15} /> Copy</button>
      </div>
      <p className="mt-1.5 text-[12px] text-muted">Only this family can see their own details with this link. You can revoke or regenerate it anytime.</p>

      <label htmlFor="share-msg" className="label mt-4">Message</label>
      <textarea id="share-msg" className="input min-h-[120px]" defaultValue={msg} />

      <div className="mt-4 flex flex-wrap gap-2">
        <a className="btn-primary" href={`https://wa.me/?text=${encodeURIComponent(msg)}`} target="_blank" rel="noreferrer"
          onClick={() => dispatch({ type: 'invitation/state', householdId: household.id, state: household.invitation === 'NOT_SENT' ? 'SENT' : household.invitation })}>
          <MessageCircle size={16} /> Open in WhatsApp
        </a>
        <button className="btn-ghost" onClick={() => { dispatch({ type: 'invitation/state', householdId: household.id, state: household.invitation === 'NOT_SENT' ? 'SENT' : household.invitation }); setDone('Marked as shared') }}>Mark as shared</button>
        <Link className="btn-ghost" to={`/g/${household.id}`}><ExternalLink size={15} /> Preview form</Link>
      </div>
      <p className="mt-3 text-[12px] text-muted">WhatsApp opens with this message ready to send from your own number. WeddingStay doesn't send messages for you yet.</p>
      {done && <div className="mt-3"><Pill tone="good">{done}</Pill></div>}
    </Modal>
  )
}
