// App state. Three modes:
//   demo  - the sample wedding, kept in this browser only (what visitors explore)
//   host  - a real wedding opened with its private link; every change is saved on the server
//   guest - one family's invite, opened from their guest link
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { sampleData } from './data/sample'
import type { WeddingData } from './data/types'
import { reducer, type Action } from './lib/reducer'

type Mode = 'demo' | 'host' | 'guest'
type Status = 'ready' | 'loading' | 'missing'
const TOKEN = 'weddingstay.token'

export const savedToken = () => { try { return localStorage.getItem(TOKEN) } catch { return null } }
const remember = (t: string | null) => { try { if (t) localStorage.setItem(TOKEN, t); else localStorage.removeItem(TOKEN) } catch { /* private mode: link still works */ } }

async function api(path: string, body?: unknown): Promise<any> {
  const r = await fetch(`/api${path}`, body === undefined ? undefined : { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
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
  openWedding: (token: string) => Promise<void>
  openGuest: (householdId: string) => Promise<void>
  createWedding: (a: Extract<Action, { type: 'wedding/create' }>) => Promise<void>
  openDemo: () => void
}

const Ctx = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<WeddingData>(sampleData)
  const [mode, setMode] = useState<Mode>('demo')
  const [status, setStatus] = useState<Status>(() => (savedToken() ? 'loading' : 'ready'))
  const [problem, setProblem] = useState('')
  const live = useRef({ mode: 'demo' as Mode, key: '' })
  const queue = useRef(Promise.resolve())
  const pending = useRef(0)

  const load = useCallback(async (m: Mode, key: string, d: Promise<WeddingData>) => {
    setStatus('loading')
    try {
      setData(await d)
      setMode(m)
      live.current = { mode: m, key }
      if (m === 'host') remember(key)
      setStatus('ready')
    } catch (e) {
      if (m === 'host' && (e as { status?: number }).status === 404 && savedToken() === key) remember(null)
      setStatus('missing')
      throw e
    }
  }, [])

  const openWedding = useCallback((t: string) => load('host', t, api(`/w/${t}`)), [load])
  const openGuest = useCallback((h: string) => load('guest', h, api(`/g/${h}`)), [load])
  const createWedding = useCallback(async (a: Extract<Action, { type: 'wedding/create' }>) => {
    const { token, data } = await api('/weddings', a)
    await load('host', token, Promise.resolve(data))
  }, [load])
  const openDemo = useCallback(() => { live.current = { mode: 'demo', key: '' }; setMode('demo'); setData(sampleData); setStatus('ready') }, [])

  // On a phone that already has a wedding, open it straight away.
  useEffect(() => { const t = savedToken(); if (t) openWedding(t).catch(() => openDemo()) }, [openWedding, openDemo])

  /** Applies a change at once and saves it. Resolves false if saving failed. */
  const dispatch = useCallback((a: Action): Promise<boolean> => {
    setData((d) => reducer(d, a)) // show the change at once
    const { mode, key } = live.current
    if (mode === 'demo') return Promise.resolve(true)
    const path = mode === 'host' ? `/w/${key}` : `/g/${key}`
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

  const value = useMemo(() => ({ data, dispatch, mode, status, problem, token: mode === 'host' ? live.current.key : null, openWedding, openGuest, createWedding, openDemo }),
    [data, dispatch, mode, status, problem, openWedding, openGuest, createWedding, openDemo])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useStore() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useStore outside StoreProvider')
  return v
}
