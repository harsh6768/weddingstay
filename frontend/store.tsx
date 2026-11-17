// App state. Four modes:
//   demo   - the sample wedding, kept in this browser only (what visitors explore)
//   host   - a real wedding opened with its private link; every change is saved on the server
//   member - a real wedding opened by someone signed in with Google (the couple or a helper)
//   helper - a real wedding opened by a helper who chose not to sign in, with their personal link
//   guest  - one family's invite, opened from their guest link
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { sampleData } from '../shared/sample'
import type { WeddingData } from '../shared/types'
import { reducer, type Action } from '../shared/reducer'
import { accessToken } from './lib/auth'

type Mode = 'demo' | 'host' | 'member' | 'helper' | 'guest'
/** What the person may do: the couple manages everything; a helper works on one side's families (side null = all). */
export interface Access { role: 'OWNER' | 'HELPER'; side: 'BRIDE' | 'GROOM' | null }
type Status = 'ready' | 'loading' | 'missing'
const TOKEN = 'weddingstay.token'
const WEDDING = 'weddingstay.wedding' // last wedding opened while signed in
const HELPER = 'weddingstay.helper' // a helper's personal link

const read = (k: string) => { try { return localStorage.getItem(k) } catch { return null } }
const write = (k: string, v: string | null) => { try { if (v) localStorage.setItem(k, v); else localStorage.removeItem(k) } catch { /* private mode: link still works */ } }
export const savedToken = () => read(TOKEN)
export const savedWedding = () => read(WEDDING)
export const savedHelper = () => read(HELPER)

/** Calls the backend, sending the Google sign-in when there is one. */
export async function api(path: string, body?: unknown, method = body === undefined ? 'GET' : 'POST'): Promise<any> {
  const jwt = await accessToken()
  const headers: Record<string, string> = { ...(body !== undefined && { 'content-type': 'application/json' }), ...(jwt && { authorization: `Bearer ${jwt}` }) }
  const r = await fetch(`/api${path}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) })
  const out = await r.json().catch(() => ({}))
  if (!r.ok) throw Object.assign(new Error(out.error ?? 'Something went wrong'), { status: r.status })
  return out
}

interface Store {
  data: WeddingData
  dispatch: (a: Action) => Promise<boolean>
  mode: Mode
  status: Status
  /** The couple's private link token, in host mode. */
  token: string | null
  /** Shown when a change could not be saved. */
  problem: string
  /** The wedding's id, in member mode. */
  weddingId: string | null
  /** A helper's personal link token, in helper mode. */
  helperLink: string | null
  access: Access
  /** Where team calls go: /weddings/<id> (signed in) or /h/<link> (helper link). */
  teamPath: string | null
  openWedding: (token: string) => Promise<void>
  openMember: (weddingId: string) => Promise<void>
  openHelper: (link: string) => Promise<void>
  openGuest: (householdId: string) => Promise<void>
  createWedding: (a: Extract<Action, { type: 'wedding/create' }>) => Promise<void>
  openDemo: () => void
}

const Ctx = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<WeddingData>(sampleData)
  const [mode, setMode] = useState<Mode>('demo')
  const [status, setStatus] = useState<Status>(() => (savedToken() || savedWedding() || savedHelper() ? 'loading' : 'ready'))
  const [problem, setProblem] = useState('')
  const [access, setAccess] = useState<Access>({ role: 'OWNER', side: null })
  const live = useRef({ mode: 'demo' as Mode, key: '' })
  const queue = useRef(Promise.resolve())
  const pending = useRef(0)

  const load = useCallback(async (m: Mode, key: string, d: Promise<WeddingData>) => {
    setStatus('loading')
    try {
      const team = m === 'member' ? api(`/weddings/${key}/team`) : m === 'helper' ? api(`/h/${key}/team`) : null
      const [wedding, t] = await Promise.all([d, team])
      setData(wedding)
      setAccess(t ? { role: t.me.role, side: t.me.side } : { role: 'OWNER', side: null })
      setMode(m)
      live.current = { mode: m, key }
      if (m === 'host') write(TOKEN, key)
      if (m === 'member') write(WEDDING, key)
      if (m === 'helper') write(HELPER, key)
      setStatus('ready')
    } catch (e) {
      const gone = [401, 404].includes((e as { status?: number }).status ?? 0)
      if (m === 'host' && gone && savedToken() === key) write(TOKEN, null)
      if (m === 'member' && gone && savedWedding() === key) write(WEDDING, null)
      if (m === 'helper' && gone && savedHelper() === key) write(HELPER, null)
      setStatus('missing')
      throw e
    }
  }, [])

  const openWedding = useCallback((t: string) => load('host', t, api(`/w/${t}`)), [load])
  const openMember = useCallback((id: string) => load('member', id, api(`/weddings/${id}`)), [load])
  const openHelper = useCallback((link: string) => load('helper', link, api(`/h/${link}`)), [load])
  const openGuest = useCallback((h: string) => load('guest', h, api(`/g/${h}`)), [load])
  const createWedding = useCallback(async (a: Extract<Action, { type: 'wedding/create' }>) => {
    const { token, data } = await api('/weddings', a)
    write(TOKEN, token) // the private link still works, signed in or not
    if (await accessToken()) await load('member', data.wedding.id, Promise.resolve(data)) // already in their account
    else await load('host', token, Promise.resolve(data))
  }, [load])
  const openDemo = useCallback(() => { live.current = { mode: 'demo', key: '' }; setMode('demo'); setData(sampleData); setAccess({ role: 'OWNER', side: null }); setStatus('ready') }, [])

  // On a phone that already has a wedding, open it straight away.
  useEffect(() => {
    // Signed in first, then a helper link, then the couple's private link.
    const w = savedWedding(), h = savedHelper(), t = savedToken()
    const host = () => (t ? openWedding(t) : Promise.reject())
    const helper = () => (h ? openHelper(h).catch((e) => {
      if (e.status === 404) setProblem('Your helper link isn’t working any more. Ask the couple to send you a new invite.')
      return host()
    }) : host())
    ;(w ? openMember(w).catch(helper) : helper()).catch(() => openDemo())
  }, [openWedding, openMember, openHelper, openDemo])

  /** Applies a change at once and saves it. Resolves false if saving failed. */
  const dispatch = useCallback((a: Action): Promise<boolean> => {
    setData((d) => reducer(d, a)) // show the change at once
    const { mode, key } = live.current
    if (mode === 'demo') return Promise.resolve(true)
    const path = { host: `/w/${key}`, member: `/weddings/${key}`, helper: `/h/${key}`, guest: `/g/${key}` }[mode]
    pending.current++
    const saved = queue.current.then(() => api(path, a)).then(
      // The server's copy also has replies families sent meanwhile; take it once our own changes are all in.
      (d: WeddingData) => { if (--pending.current === 0 && live.current.key === key) setData(d); setProblem(''); return true },
      async () => {
        pending.current--
        setProblem('That change wasn’t saved. Please check your internet and try again.')
        await api(path).then((d) => { if (live.current.key === key) setData(d) }).catch(() => {})
        return false
      })
    queue.current = saved.then(() => {})
    return saved
  }, [])

  const value = useMemo(() => ({ data, dispatch, mode, status, problem, token: mode === 'host' ? live.current.key : null, weddingId: mode === 'member' ? live.current.key : null,
    helperLink: mode === 'helper' ? live.current.key : null, access, teamPath: mode === 'member' ? `/weddings/${live.current.key}` : mode === 'helper' ? `/h/${live.current.key}` : null,
    openWedding, openMember, openHelper, openGuest, createWedding, openDemo }),
    [data, dispatch, mode, status, problem, access, openWedding, openMember, openHelper, openGuest, createWedding, openDemo])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useStore() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useStore outside StoreProvider')
  return v
}
