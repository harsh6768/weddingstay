// Pages that open a saved wedding: the couple's private link, guest links, and the private-link screen.
import { Check, Copy, Lock } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Mark } from '../components/AppShell'
import { WhatsAppButton } from '../components/ui'
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

/** /w/:token, the couple's private link. */
export function OpenWedding() {
  const { token = '' } = useParams()
  const { openWedding } = useStore()
  const nav = useNavigate()
  const [failed, setFailed] = useState(false)
  useEffect(() => { openWedding(token).then(() => nav('/app', { replace: true }), () => setFailed(true)) }, [token, openWedding, nav])
  if (!failed) return <Loading />
  return (
    <Centered>
      <h1 className="mt-4 font-display text-[28px] font-semibold">This link didn’t open a wedding</h1>
      <p className="mt-2 text-muted">Please check you copied the whole link. If your internet is slow, try again in a minute.</p>
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

/** The couple's private link, with ways to keep it safe. Shown right after creating a wedding and in Settings. */
export function PrivateLinkCard() {
  const { token, data } = useStore()
  const { copied, copy } = useCopy()
  if (!token) return null
  const link = appLink(`/w/${token}`)
  const msg = `Our wedding on WeddingStay (${data.wedding.name}). Private link, don’t share it:\n${link}`
  return (
    <div className="card p-5 text-left">
      <div className="flex items-center gap-2 font-semibold text-[16px]"><Lock size={17} className="text-plum" /> Your private link</div>
      <p className="mt-1 text-[14.5px] text-muted">This link opens your wedding. Anyone who has it can see and change your guest list, so only share it with family who are helping you plan.</p>
      <div className="mt-3 break-all rounded-xl bg-sunk px-3 py-2.5 text-[13.5px] font-medium select-all">{link}</div>
      <div className="mt-3 grid gap-2">
        <WhatsAppButton href={`https://wa.me/?text=${encodeURIComponent(msg)}`}>Send it to myself on WhatsApp</WhatsAppButton>
        <button type="button" className="btn-ghost !min-h-[50px]" onClick={() => copy(link)}>{copied ? <><Check size={16} /> Copied</> : <><Copy size={16} /> Copy link</>}</button>
      </div>
    </div>
  )
}

/** /app/link: right after "Create our wedding". */
export function SaveLink() {
  const [sp] = useSearchParams()
  const { mode } = useStore()
  if (mode !== 'host') return <Navigate to="/app" replace />
  return (
    <div className="mx-auto max-w-[480px]">
      <h1 className="font-display text-[32px] leading-[1.1] font-semibold">{sp.get('new') ? 'Your wedding is saved 🎉' : 'Your private link'}</h1>
      <p className="mt-2 text-[15.5px] text-muted">There’s no password. You open your wedding with this link, so please keep it somewhere safe. The easiest way is to send it to yourself on WhatsApp.</p>
      <div className="mt-5"><PrivateLinkCard /></div>
      <p className="mt-3 text-[13.5px] text-muted">On this phone, WeddingStay will open your wedding by itself. You’ll need the link on a new phone or computer.</p>
      <Link to="/app" className="btn-primary mt-5 w-full !min-h-[52px] text-[16px]">Done, take me to my wedding</Link>
    </div>
  )
}

/** /login: there are no passwords yet, so explain how to get back in. */
export function OpenHelp() {
  return (
    <Centered>
      <h1 className="mt-4 font-display text-[30px] leading-[1.1] font-semibold">Open your wedding</h1>
      <p className="mt-3 text-[15.5px] text-muted">There’s no password. When you created your wedding, you got a private link. Open that link on this phone and your wedding will open. If you sent it to yourself on WhatsApp, search your chats for “WeddingStay”.</p>
      <div className="mt-6 flex flex-col gap-2">
        <Link to="/start" className="btn-primary !min-h-[50px]">Add a new wedding</Link>
        <Link to="/" className="btn-ghost !min-h-[50px]">Go to home page</Link>
      </div>
    </Centered>
  )
}
