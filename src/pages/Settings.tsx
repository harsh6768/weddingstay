import { Pencil, UserPlus } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Choices, Modal, WhatsAppButton } from '../components/ui'
import type { Side } from '../data/types'
import { shortRange, sideName } from '../lib/family'
import { useStore } from '../store'

export default function Settings() {
  const { data, dispatch } = useStore()
  const [inviting, setInviting] = useState(false)
  return (
    <div className="mx-auto max-w-[760px]">
      <h1 className="font-display text-[34px] md:text-[40px] leading-[1.05] font-semibold">Family &amp; settings</h1>

      <section className="card mt-5">
        <div className="px-5 pt-4">
          <h2 className="font-display text-[22px] font-semibold">Who’s helping</h2>
          <p className="text-[14px] text-muted">Let parents, siblings or a cousin add guests and give rooms with you.</p>
        </div>
        <ul className="mt-2 divide-y divide-line">
          {data.members.map((m) => (
            <li key={m.id} className="flex items-center gap-3 px-5 py-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-plumsoft font-semibold text-plum">{m.name[0]}</div>
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">{m.name}</div>
                <div className="text-[13px] text-muted">{m.role === 'OWNER' ? 'Can do everything' : m.side ? `Helps with ${sideName[m.side].toLowerCase()}` : 'Helper'}</div>
              </div>
              {m.status === 'INVITED' && <span className="shrink-0 rounded-full bg-warn/10 px-2.5 py-0.5 text-[12px] font-medium text-warn">Invite sent</span>}
            </li>
          ))}
        </ul>
        <div className="p-4"><button className="btn-primary w-full !min-h-[52px] text-[16px]" onClick={() => setInviting(true)}><UserPlus size={18} /> Add a family member</button></div>
      </section>

      <section className="card mt-5 p-5">
        <div className="flex items-center justify-between"><h2 className="font-display text-[22px] font-semibold">Wedding details</h2><button className="btn-ghost !min-h-[44px]"><Pencil size={15} /> Edit</button></div>
        <dl className="mt-3 grid grid-cols-2 gap-4 text-[15px]">
          <div><dt className="text-[13px] text-muted">Couple</dt><dd className="font-medium">{data.wedding.name}</dd></div>
          <div><dt className="text-[13px] text-muted">City</dt><dd className="font-medium">{data.wedding.city}</dd></div>
          <div><dt className="text-[13px] text-muted">Dates</dt><dd className="font-medium">{shortRange(data.wedding.startDate, data.wedding.endDate)}</dd></div>
          <div><dt className="text-[13px] text-muted">Replies close</dt><dd className="font-medium">{shortRange(data.wedding.responseDeadline, data.wedding.responseDeadline).split(' to ')[0]}</dd></div>
        </dl>
        <Link to="/app/invitations/design" className="mt-4 inline-flex min-h-[44px] items-center font-medium text-plum">Change the invite design</Link>
      </section>

      <section className="mt-5 rounded-2xl bg-sunk/70 p-5 text-[14px]">
        <div className="font-semibold">Preview tools</div>
        <p className="text-muted">This is sample data in your browser. Try it from scratch, or go back to the sample wedding.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link to="/start" className="btn-ghost !min-h-[44px]">Start a new wedding</Link>
          <button className="btn-ghost !min-h-[44px]" onClick={() => dispatch({ type: 'reset' })}>Load sample wedding</button>
        </div>
      </section>

      {inviting && <InviteHelper onClose={() => setInviting(false)} />}
    </div>
  )
}

function InviteHelper({ onClose }: { onClose: () => void }) {
  const { data } = useStore()
  const [name, setName] = useState('')
  const [side, setSide] = useState<Side | ''>('')
  const ok = name.trim() && side
  const text = `Hi ${name.trim().split(' ')[0] || ''}! Please help me plan ${data.wedding.name}'s wedding guests and rooms on WeddingStay. Tap to join: weddingstay.in/join/k7Qm`
  return (
    <Modal open onClose={onClose} title="Add a family member">
      <div className="grid gap-4">
        <div><label htmlFor="hname" className="label !text-[14px]">Their name</label><input id="hname" className="input !min-h-[50px] !text-[16px]" placeholder="e.g. Mummy, Vikram bhaiya" value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div>
          <div className="label !text-[14px]">Which guests will they handle?</div>
          <Choices label="Which side" value={side} onChange={setSide} cols={3} options={[{ v: 'BRIDE', label: 'Bride’s side' }, { v: 'GROOM', label: 'Groom’s side' }, { v: 'MUTUAL', label: 'Everyone' }]} />
          <p className="mt-1.5 text-[13px] text-muted">They’ll see and edit only those families. You still see everything.</p>
        </div>
        {ok ? <WhatsAppButton href={`https://wa.me/?text=${encodeURIComponent(text)}`} onClick={onClose}>Send invite on WhatsApp</WhatsAppButton>
          : <button className="btn-primary !min-h-[52px] opacity-50" disabled>Send invite on WhatsApp</button>}
      </div>
    </Modal>
  )
}
