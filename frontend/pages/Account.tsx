// Google sign-in pages: log in / create account, "My weddings", and a helper's invite link (/join/:code).
import { ChevronRight, LogOut, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { shortRange } from '../lib/family'
import { authReady, signInWithGoogle, signOut, supabase, takeNext, useSession, userName } from '../lib/auth'
import { api, useStore } from '../store'
import { Centered, Loading } from './Open'

const sideText = (side: string | null) => (side === 'BRIDE' ? 'the bride’s side' : side === 'GROOM' ? 'the groom’s side' : 'the whole wedding')

function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  )
}

export function GoogleButton({ next, children = 'Continue with Google' }: { next: string; children?: string }) {
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  if (!authReady) return <p className="rounded-2xl bg-sunk px-4 py-3 text-[14px] text-muted">Google sign-in isn’t set up on this site yet.</p>
  return (
    <div>
      <button type="button" disabled={busy} className="btn w-full !min-h-[52px] border border-line bg-surface text-[16px] font-medium text-ink hover:bg-sunk"
        onClick={() => { setBusy(true); signInWithGoogle(next).catch((e) => { setError(e.message); setBusy(false) }) }}>
        <GoogleMark /> {busy ? 'Opening Google…' : children}
      </button>
      {error && <p className="mt-2 text-[14px] text-bad" role="alert">{error}</p>}
    </div>
  )
}

/** Back from Google (?code= in the address): wait for Supabase to finish signing in, then go where the sign-in started. */
export function AuthReturn() {
  const nav = useNavigate()
  useEffect(() => {
    if (!supabase || !new URLSearchParams(location.search).has('code')) return
    supabase.auth.getSession().then(() => {
      history.replaceState(null, '', location.pathname + location.hash)
      const next = takeNext()
      if (next) nav(next, { replace: true })
    })
  }, [nav])
  return null
}

/** /login and /register. Same Google button; the words differ. */
export function SignIn({ register = false }: { register?: boolean }) {
  const { session, ready } = useSession()
  if (!ready) return <Loading text="One moment…" />
  if (session) return <Navigate to="/me" replace />
  return (
    <Centered>
      <h1 className="mt-4 font-display text-[30px] leading-[1.1] font-semibold">{register ? 'Create your account' : 'Welcome back'}</h1>
      <p className="mt-2 text-[15.5px] text-muted">{register ? 'Sign in with Google to keep your wedding safe and open it on any phone.' : 'Sign in to see your weddings.'}</p>
      <div className="mt-6"><GoogleButton next="/me" /></div>
      <p className="mt-6 text-[14px] text-muted">Have a private link from WeddingStay? Just open it, no sign-in needed.</p>
      <div className="mt-4 flex flex-col gap-2">
        {register ? <Link to="/start" className="btn-ghost !min-h-[48px]">Skip, add a wedding without an account</Link> : <Link to="/register" className="btn-ghost !min-h-[48px]">New here? Create an account</Link>}
        <Link to="/" className="btn-ghost !min-h-[48px]">Go to home page</Link>
      </div>
    </Centered>
  )
}

interface MyWedding { id: string; role: 'OWNER' | 'HELPER'; side: string | null; name: string; startDate: string; endDate: string; city: string }

/** /me: the weddings in this Google account. */
export function MyWeddings() {
  const { session, ready } = useSession()
  const { openMember } = useStore()
  const nav = useNavigate()
  const [list, setList] = useState<MyWedding[] | null>(null)
  const [error, setError] = useState('')
  useEffect(() => { if (session) api('/me/weddings').then(setList, (e) => setError(e.message)) }, [session])
  if (!ready) return <Loading text="One moment…" />
  if (!session) return <Navigate to="/login" replace />
  const open = (id: string) => openMember(id).then(() => nav('/app'), (e) => setError(e.message))
  return (
    <div className="mx-auto max-w-[520px] px-4 py-10">
      <div className="flex items-center justify-between gap-3">
        <h1 className="font-display text-[32px] font-semibold">My weddings</h1>
        <button className="btn-ghost !min-h-[44px]" onClick={() => signOut().then(() => nav('/'))}><LogOut size={16} /> Sign out</button>
      </div>
      <p className="text-[14px] text-muted">Signed in as {userName(session)}</p>
      {error && <p className="mt-4 text-bad" role="alert">{error}</p>}
      {!list && !error && <p className="mt-6 text-muted" role="status">Loading…</p>}
      {list && (
        <ul className="mt-5 grid gap-3">
          {list.map((w) => (
            <li key={w.id}>
              <button className="card flex w-full items-center gap-3 p-4 text-left hover:bg-sunk" onClick={() => open(w.id)}>
                <div className="min-w-0 flex-1">
                  <div className="font-display text-[20px] font-semibold">{w.name}</div>
                  <div className="text-[14px] text-muted">{w.city} · {shortRange(w.startDate, w.endDate)}</div>
                  <div className="mt-1 text-[13px] text-plum">{w.role === 'OWNER' ? 'Your wedding' : `Helping with ${sideText(w.side)}`}</div>
                </div>
                <ChevronRight className="text-muted" />
              </button>
            </li>
          ))}
          {list.length === 0 && <li className="rounded-2xl bg-sunk p-5 text-[15px] text-muted">No weddings yet. Add yours, or if you made one with a private link, open that link and tap “Save to my Google account” in Settings.</li>}
        </ul>
      )}
      <Link to="/start" className="btn-primary mt-5 w-full !min-h-[52px] text-[16px]"><Plus size={18} /> Add a wedding</Link>
    </div>
  )
}

/** /join/:code: a helper's invite. They sign in with Google, then join. */
export function Join() {
  const { code = '' } = useParams()
  const { session, ready } = useSession()
  const { openMember, openHelper } = useStore()
  const nav = useNavigate()
  const [invite, setInvite] = useState<{ weddingName: string; name: string; side: string | null } | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  useEffect(() => { api(`/join/${code}`).then(setInvite, (e) => setError(e.message)) }, [code])
  const fail = (e: Error) => { setError(e.message); setBusy(false) }
  const join = () => { setBusy(true); api(`/join/${code}`, {}).then(({ id }) => openMember(id)).then(() => nav('/app', { replace: true }), fail) }
  // No sign-in: the server gives this helper their own personal link, which we then show them to keep.
  const joinWithLink = () => { setBusy(true); api(`/join/${code}/link`, {}).then(({ link }) => openHelper(link)).then(() => nav('/app/link?new=1', { replace: true }), fail) }
  if (!ready || (!invite && !error)) return <Loading text="Opening your invite…" />
  return (
    <Centered>
      {invite ? <>
        <h1 className="mt-4 font-display text-[28px] leading-[1.15] font-semibold">Help plan {invite.weddingName}’s wedding</h1>
        <p className="mt-2 text-[15.5px] text-muted">Namaste {invite.name}! You’ve been invited to add guests and give rooms for {sideText(invite.side)}.</p>
        <div className="mt-6">
          {session ? <>
            <button className="btn-primary w-full !min-h-[52px] text-[16px]" disabled={busy} onClick={join}>{busy ? 'Joining…' : 'Join and open the wedding'}</button>
            <p className="mt-2 text-[13.5px] text-muted">Signed in as {userName(session)}. <button className="underline" onClick={() => signOut()}>Not you?</button></p>
          </> : <div className="grid gap-3 text-left">
            <div>
              <GoogleButton next={`/join/${code}`} />
              <p className="mt-1.5 text-[13.5px] text-muted">Recommended. Opens on any phone, and the wedding stays in your account.</p>
            </div>
            <div className="flex items-center gap-3 text-[13px] text-muted"><span className="h-px flex-1 bg-line" />or<span className="h-px flex-1 bg-line" /></div>
            <div>
              <button className="btn-ghost w-full !min-h-[52px] text-[16px]" disabled={busy} onClick={joinWithLink}>{busy ? 'Joining…' : 'Continue without signing in'}</button>
              <p className="mt-1.5 text-[13.5px] text-muted">You’ll get your own personal link instead. Keep it safe: it works only on the phone you save it on, and if you lose it the couple can send you a new invite.</p>
            </div>
          </div>}
        </div>
      </> : <h1 className="mt-4 font-display text-[26px] font-semibold">This invite isn’t working</h1>}
      {error && <p className="mt-3 text-[15px] text-bad" role="alert">{error}</p>}
    </Centered>
  )
}
