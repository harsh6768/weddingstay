import { Pencil, UserPlus } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Choices, Modal, WhatsAppButton } from '../components/ui'
import type { Side } from '../../shared/types'
import { authReady, signOut, useSession, userName } from '../lib/auth'
import { appLink, shortRange, sideName } from '../lib/family'
import { api, useStore } from '../store'
import { PrivateLinkCard, SaveWithGoogle, SignInQr } from './Open'

export default function Settings() {
  const { data, dispatch, mode, access } = useStore()
  const owner = access.role === 'OWNER'
  const [inviting, setInviting] = useState(false)
  return (
    <div className="mx-auto max-w-[760px]">
      <h1 className="font-display text-[34px] md:text-[40px] leading-[1.05] font-semibold">Family &amp; settings</h1>

      {mode === 'member' || mode === 'helper' ? <Team /> : mode === 'host' ? (
        <section className="mt-5">
          {authReady && <SaveToAccount />}
          <p className="mb-3 mt-5 text-[15px] text-muted">{authReady ? 'Not using Google? This link is the only way back into your wedding, so keep it safe.' : 'To let parents, siblings or a cousin help with guests and rooms, send them this link.'}</p>
          <PrivateLinkCard />
        </section>
      ) : (
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
      )}

      <section className="card mt-5 p-5">
        <div className="flex items-center justify-between"><h2 className="font-display text-[22px] font-semibold">Wedding details</h2>{owner && <button className="btn-ghost !min-h-[44px]"><Pencil size={15} /> Edit</button>}</div>
        <dl className="mt-3 grid grid-cols-2 gap-4 text-[15px]">
          <div><dt className="text-[13px] text-muted">Couple</dt><dd className="font-medium">{data.wedding.name}</dd></div>
          <div><dt className="text-[13px] text-muted">City</dt><dd className="font-medium">{data.wedding.city}</dd></div>
          <div><dt className="text-[13px] text-muted">Dates</dt><dd className="font-medium">{shortRange(data.wedding.startDate, data.wedding.endDate)}</dd></div>
          <div><dt className="text-[13px] text-muted">Replies close</dt><dd className="font-medium">{shortRange(data.wedding.responseDeadline, data.wedding.responseDeadline).split(' to ')[0]}</dd></div>
        </dl>
        {owner && <Link to="/app/invitations/design" className="mt-4 inline-flex min-h-[44px] items-center font-medium text-plum">Change the invite design</Link>}
      </section>

      {mode === 'demo' && <section className="mt-5 rounded-2xl bg-sunk/70 p-5 text-[14px]">
        <div className="font-semibold">Preview tools</div>
        <p className="text-muted">This is sample data in your browser. Start your own wedding to save it for real.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link to="/start" className="btn-ghost !min-h-[44px]">Start a new wedding</Link>
          <button className="btn-ghost !min-h-[44px]" onClick={() => dispatch({ type: 'reset' })}>Load sample wedding</button>
        </div>
      </section>}

      {mode === 'helper' && <section className="mt-5"><PrivateLinkCard /></section>}
      {mode === 'member' && <SignedIn />}
      {inviting && <InviteHelper onClose={() => setInviting(false)} />}
    </div>
  )
}

/** Wedding-link mode: save it to a Google account so it opens on any phone, and helpers can be invited. */
function SaveToAccount() {
  return (
    <div className="card p-5">
      <h2 className="font-display text-[22px] font-semibold">Save with Google</h2>
      <p className="mt-1 mb-4 text-[14.5px] text-muted">Open your wedding on any phone just by logging in, and invite parents or cousins to help. Your wedding link keeps working.</p>
      <SaveWithGoogle next="/app/settings?claim=1" />
    </div>
  )
}

interface TeamData {
  me: { id: string; role: 'OWNER' | 'HELPER' }
  members: { id: string; name: string; email: string | null; role: 'OWNER' | 'HELPER'; side: 'BRIDE' | 'GROOM' | null; signedIn: boolean }[]
  invites: { code: string; name: string; side: 'BRIDE' | 'GROOM' | null }[]
}
const helps = (side: string | null) => (side ? `Helps with ${sideName[side as Side].toLowerCase()}` : 'Helps with everyone')
const joinText = (wedding: string, name: string, code: string) =>
  `Hi ${name.split(' ')[0]}! Please help us plan ${wedding}'s wedding guests and rooms on WeddingStay. Tap to join (sign in with Google):\n${appLink(`/join/${code}`)}`

/** Signed in, or a helper's personal link: the real team, from the server. Only the couple can invite or remove. */
function Team() {
  const { weddingId, teamPath, data } = useStore()
  const [team, setTeam] = useState<TeamData | null>(null)
  const [error, setError] = useState('')
  const [inviting, setInviting] = useState(false)
  const load = useCallback(() => api(`${teamPath}/team`).then((t) => { setTeam(t); setError('') }, (e) => setError(e.message)), [teamPath])
  useEffect(() => { load() }, [load])
  const owner = team?.me.role === 'OWNER'
  const act = (p: Promise<unknown>) => p.then(load, (e) => setError(e.message))
  return (
    <section className="card mt-5">
      <div className="px-5 pt-4">
        <h2 className="font-display text-[22px] font-semibold">Who’s helping</h2>
        <p className="text-[14px] text-muted">{owner ? 'Let parents, siblings or a cousin add guests and give rooms with you.' : 'The people planning this wedding.'}</p>
      </div>
      {!team && !error && <p className="px-5 py-3 text-muted" role="status">Loading…</p>}
      {team && <ul className="mt-2 divide-y divide-line">
        {team.members.map((m) => (
          <li key={m.id} className="flex items-center gap-3 px-5 py-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-plumsoft font-semibold text-plum">{m.name[0]}</div>
            <div className="min-w-0 flex-1">
              <div className="truncate font-medium">{m.name}{m.id === team.me.id && ' (you)'}</div>
              <div className="truncate text-[13px] text-muted">{m.role === 'OWNER' ? 'Can do everything' : helps(m.side)} · {m.signedIn ? m.email : 'Uses a personal link'}</div>
            </div>
            {owner && m.role === 'HELPER' && <button className="btn-ghost !min-h-[40px] !px-3 !text-[13.5px]" onClick={() => confirm(`Remove ${m.name}? They won’t be able to open this wedding.`) && act(api(`/weddings/${weddingId}/members/${m.id}`, undefined, 'DELETE'))}>Remove</button>}
          </li>
        ))}
        {team.invites.map((i) => (
          <li key={i.code} className="flex flex-wrap items-center gap-3 px-5 py-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-sunk font-semibold text-muted">{i.name[0]}</div>
            <div className="min-w-0 flex-1">
              <div className="truncate font-medium">{i.name}</div>
              <div className="text-[13px] text-muted">{helps(i.side)} · <span className="text-warn">Invite sent, not joined yet</span></div>
            </div>
            <div className="flex basis-full gap-2 pl-14">
              <WhatsAppButton small href={`https://wa.me/?text=${encodeURIComponent(joinText(data.wedding.name, i.name, i.code))}`}>Send again</WhatsAppButton>
              <button className="btn-ghost !min-h-[40px] !px-3 !text-[13.5px]" onClick={() => act(api(`/weddings/${weddingId}/invites/${i.code}`, undefined, 'DELETE'))}>Cancel</button>
            </div>
          </li>
        ))}
      </ul>}
      {error && <p className="px-5 pb-2 text-[14px] text-bad" role="alert">{error}</p>}
      {owner && <div className="p-4"><button className="btn-primary w-full !min-h-[52px] text-[16px]" onClick={() => setInviting(true)}><UserPlus size={18} /> Add a family member</button></div>}
      {inviting && <InviteHelper onClose={() => { setInviting(false); load() }} />}
    </section>
  )
}

function SignedIn() {
  const { session } = useSession()
  const nav = useNavigate()
  return (
    <section className="mt-5 flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-sunk/70 p-4 text-[14px]">
      <span className="text-muted">Signed in as {userName(session)}</span>
      <span className="flex gap-2">
        <Link to="/me" className="btn-ghost !min-h-[44px]">My weddings</Link>
        <button className="btn-ghost !min-h-[44px]" onClick={() => signOut().then(() => nav('/'))}>Sign out</button>
      </span>
      <SignInQr />
    </section>
  )
}

function InviteHelper({ onClose }: { onClose: () => void }) {
  const { data, mode, weddingId } = useStore()
  const [name, setName] = useState('')
  const [side, setSide] = useState<Side | ''>('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const clean = name.trim().replace(/\s+/g, ' ')
  const tooLong = clean.length > 60
  const ok = clean && !tooLong && side
  const real = mode === 'member'
  // In the demo the link is only an example.
  const text = real ? joinText(data.wedding.name, name.trim(), code) : `Hi ${name.trim().split(' ')[0] || ''}! Please help me plan ${data.wedding.name}'s wedding guests and rooms on WeddingStay. Tap to join: weddingstay.in/join/k7Qm`
  const create = () => api(`/weddings/${weddingId}/invites`, { name: clean, side: side === 'MUTUAL' ? null : side }).then((r) => setCode(r.code), (e) => setError(e.message))
  return (
    <Modal open onClose={onClose} title="Add a family member">
      <div className="grid gap-4">
        <div><label htmlFor="hname" className="label !text-[14px]">Their name</label><input id="hname" className="input !min-h-[50px] !text-[16px]" placeholder="e.g. Mummy, Vikram bhaiya" maxLength={80} value={name} disabled={!!code} aria-invalid={tooLong} onChange={(e) => setName(e.target.value)} />
          {tooLong && <p className="mt-1 text-[13px] text-bad" role="alert">Please keep it under 60 letters.</p>}</div>
        <div>
          <div className="label !text-[14px]">Which guests will they handle?</div>
          <Choices label="Which side" value={side} onChange={(v) => !code && setSide(v)} cols={3} options={[{ v: 'BRIDE', label: 'Bride’s side' }, { v: 'GROOM', label: 'Groom’s side' }, { v: 'MUTUAL', label: 'Everyone' }]} />
          <p className="mt-1.5 text-[13px] text-muted">They’ll see and edit only those families. You still see everything.</p>
        </div>
        {real && !code ? <button className="btn-primary !min-h-[52px]" disabled={!ok} onClick={create}>Make their invite link</button>
          : ok ? <WhatsAppButton href={`https://wa.me/?text=${encodeURIComponent(text)}`} onClick={onClose}>Send invite on WhatsApp</WhatsAppButton>
          : <button className="btn-primary !min-h-[52px] opacity-50" disabled>Send invite on WhatsApp</button>}
        {real && code && <p className="text-[13px] text-muted">The link works once, for 14 days. When they open it, they can sign in with Google or carry on without signing in and get their own personal link.</p>}
        {error && <p className="text-[14px] text-bad" role="alert">{error}</p>}
      </div>
    </Modal>
  )
}
