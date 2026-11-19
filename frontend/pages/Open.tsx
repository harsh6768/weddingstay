// Pages that open a saved wedding: the couple's private link, guest links, and the private-link screen.
import { Check, Copy, Lock, Smartphone } from 'lucide-react'
import qrcode from 'qrcode-generator'
import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Mark } from '../components/AppShell'
import { WhatsAppButton } from '../components/ui'
import { authReady, useSession, userName } from '../lib/auth'
import { api } from '../store'
import { GoogleButton } from './Account'
import { appLink } from '../lib/family'
import { useStore } from '../store'

export function Centered({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen place-items-center px-4 py-10">
      <div className="w-full max-w-[440px] text-center">
        <Mark className="mx-auto h-10 w-10" />
        {children}
      </div>
    </div>
  )
}

export const Loading = ({ text = 'Opening your wedding…' }: { text?: string }) => <Centered><p className="mt-4 text-[16px] text-muted" role="status">{text}</p></Centered>

/** /w/:token, the couple's private link; /h/:link, a helper's personal link. */
export function OpenWedding({ helper = false }: { helper?: boolean }) {
  const { token = '' } = useParams()
  const { openWedding, openHelper } = useStore()
  const nav = useNavigate()
  const [failed, setFailed] = useState('')
  useEffect(() => { (helper ? openHelper : openWedding)(token).then(() => nav('/app', { replace: true }), (e) => setFailed(e.message)) }, [token, helper, openWedding, openHelper, nav])
  if (!failed) return <Loading />
  return (
    <Centered>
      <h1 className="mt-4 font-display text-[28px] font-semibold">This link didn’t open a wedding</h1>
      <p className="mt-2 text-muted">{helper && /helper link/.test(failed) ? failed : 'Please check you copied the whole link. If your internet is slow, try again in a minute.'}</p>
      <div className="mt-6 flex flex-col gap-2"><button className="btn-primary !min-h-[50px]" onClick={() => location.reload()}>Try again</button><Link to="/" className="btn-ghost !min-h-[50px]">Go to home page</Link></div>
    </Centered>
  )
}

/** Guest pages: open this family's invite from the server unless it is already loaded. */
export function GuestRoute({ children }: { children: ReactNode }) {
  const { householdId = '' } = useParams()
  const { data, status, openGuest } = useStore()
  const has = data.households.some((h) => h.id === householdId)
  useEffect(() => { if (!has && status === 'ready') openGuest(householdId).catch(() => {}) }, [has, status, householdId, openGuest])
  if (has) return <>{children}</>
  if (status !== 'missing') return <Loading text="Opening your invite…" />
  return <Centered><h1 className="mt-4 font-display text-[26px] font-semibold">This invite link isn’t working</h1><p className="mt-2 text-muted">Please check your internet, or ask the family who sent it for a new link.</p></Centered>
}

/** /demo: the sample wedding, kept only in this browser. */
export function Demo() {
  const { openDemo } = useStore()
  useEffect(() => openDemo(), [openDemo])
  return <Navigate to="/app" replace />
}

export function useCopy() {
  const [copied, setCopied] = useState(false)
  const copy = (text: string) => navigator.clipboard?.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) }, () => {})
  return { copied, copy }
}

/** A QR code for `text`, drawn as one SVG path. Always dark on white, so phone cameras read it in dark mode too. */
export function QrCode({ text, size = 168 }: { text: string; size?: number }) {
  const qr = qrcode(0, 'M')
  qr.addData(text)
  qr.make()
  const n = qr.getModuleCount()
  let d = ''
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.isDark(r, c)) d += `M${c} ${r}h1v1h-1z`
  return (
    <svg viewBox={`-2 -2 ${n + 4} ${n + 4}`} width={size} height={size} role="img" aria-label="QR code that opens this link" className="shrink-0 rounded-xl bg-white">
      <path d={d} fill="#000" />
    </svg>
  )
}

/** The couple's private link (or a helper's personal link), with ways to keep it safe. Shown right after creating or joining, and in Settings. */
export function PrivateLinkCard() {
  const { token, helperLink, data } = useStore()
  const { copied, copy } = useCopy()
  if (!token && !helperLink) return null
  const link = appLink(helperLink ? `/h/${helperLink}` : `/w/${token}`)
  const msg = `${helperLink ? 'My link for helping with' : 'Our wedding link on WeddingStay'} (${data.wedding.name}). Keep it private:\n${link}`
  return (
    <div className="card p-5 text-left">
      <div className="flex items-center gap-2 font-semibold text-[16px]"><Lock size={17} className="text-plum" /> {helperLink ? 'Your personal link' : 'Your wedding link'}</div>
      <p className="mt-1 text-[14.5px] text-muted">{helperLink
        ? 'This link is only for you. It opens the families you’re helping with, so please don’t forward it. If you lose it, ask the couple to send you a new invite.'
        : 'This link opens your wedding. Anyone who has it can change everything, so keep it between the two of you. To get family to help, invite them from Settings instead.'}</p>
      <div className="mt-3 break-all rounded-xl bg-sunk px-3 py-2.5 text-[13.5px] font-medium select-all">{link}</div>
      <div className="mt-3 grid gap-2">
        <WhatsAppButton href={`https://wa.me/?text=${encodeURIComponent(msg)}`}>Send it to myself on WhatsApp</WhatsAppButton>
        <button type="button" className="btn-ghost !min-h-[50px]" onClick={() => copy(link)}>{copied ? <><Check size={16} /> Copied</> : <><Copy size={16} /> Copy link</>}</button>
      </div>
      {/* On a laptop: scan with the phone camera to open the wedding there. Hidden on phones, where it's no use. */}
      <div className="mt-4 hidden items-center gap-4 rounded-2xl bg-sunk p-4 md:flex">
        <QrCode text={link} />
        <div>
          <div className="flex items-center gap-2 font-semibold text-[16px]"><Smartphone size={17} className="text-plum" /> Open on your phone</div>
          <p className="mt-1 text-[14px] text-muted">Point your phone’s camera at this code and tap the link that pops up. {helperLink ? 'The wedding' : 'Your wedding'} opens on your phone, and the phone remembers it. No sign-in needed.</p>
        </div>
      </div>
    </div>
  )
}

/** Links a wedding opened with its wedding link to a Google account. Finishes by itself when coming back from Google with ?claim=1. */
export function SaveWithGoogle({ next, onSaved }: { next: string; onSaved?: () => void }) {
  const { token, openMember } = useStore()
  const { session } = useSession()
  const [sp] = useSearchParams()
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const save = useCallback(() => {
    setBusy(true)
    api(`/w/${token}/claim`, {}).then(({ id }) => openMember(id)).then(() => onSaved?.(), (e) => { setError(e.message); setBusy(false) })
  }, [token, openMember, onSaved])
  useEffect(() => { if (session && sp.get('claim')) save() }, [session, sp, save])
  return (
    <div>
      {session ? <button className="btn-primary w-full !min-h-[52px] text-[16px]" disabled={busy} onClick={save}>{busy ? 'Saving…' : `Save to ${userName(session)}`}</button>
        : <GoogleButton next={next}>Save with Google</GoogleButton>}
      {error && <p className="mt-2 text-[14px] text-bad" role="alert">{error}</p>}
    </div>
  )
}

/** /app/link: right after "Create our wedding" (or a helper joining without signing in). */
export function SaveLink() {
  const [sp] = useSearchParams()
  const { mode } = useStore()
  const nav = useNavigate()
  const [skipped, setSkipped] = useState(false)
  if (mode !== 'host' && mode !== 'helper') return <Navigate to="/app" replace />
  const helper = mode === 'helper'
  // The couple: Google first, so there's nothing to remember. The wedding link only if they skip.
  if (!helper && authReady && !skipped) return (
    <div className="mx-auto max-w-[480px]">
      <h1 className="font-display text-[32px] leading-[1.1] font-semibold">{sp.get('new') ? 'Your wedding is saved 🎉' : 'Keep your wedding safe'}</h1>
      <p className="mt-2 text-[15.5px] text-muted">One last step: save it with your Google account. Then you can open it on any phone, any time, just by tapping “Log in”. Nothing to remember.</p>
      <div className="card mt-5 p-5"><SaveWithGoogle next="/app/link?claim=1" onSaved={() => nav('/app', { replace: true })} /></div>
      <button className="mt-4 min-h-[44px] w-full text-[14.5px] text-muted underline" onClick={() => setSkipped(true)}>Skip for now</button>
    </div>
  )
  return (
    <div className="mx-auto max-w-[480px]">
      <h1 className="font-display text-[32px] leading-[1.1] font-semibold">{helper ? (sp.get('new') ? 'You’re in 🎉' : 'Your personal link') : 'Your wedding link'}</h1>
      <p className="mt-2 text-[15.5px] text-muted">{helper ? 'There’s no password. You open the wedding with this link' : 'Without Google, this link is the only way back into your wedding'}, so please keep it somewhere safe. The easiest way is to send it to yourself on WhatsApp.</p>
      <div className="mt-5"><PrivateLinkCard /></div>
      <p className="mt-3 text-[13.5px] text-muted">On this device, WeddingStay will open the wedding by itself. You’ll need the link on a new phone or computer.{!helper && authReady && ' You can save it with Google later from Settings.'}</p>
      <Link to="/app" className="btn-primary mt-5 w-full !min-h-[52px] text-[16px]">{helper ? 'Done, open the wedding' : 'Done, take me to my wedding'}</Link>
    </div>
  )
}
