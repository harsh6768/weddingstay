// In-memory store for the prototype. Changes last until the page reloads.
// Later this is replaced by API calls; the action names map to the planned endpoints.
import { templateById } from './lib/templates'
import { createContext, useContext, useMemo, useReducer, type ReactNode } from 'react'
import { sampleData } from './data/sample'
import type { AllocationStatus, Guest, InvitationState, RoomAllocation, WeddingData } from './data/types'

type Action =
  | { type: 'allocation/add'; allocation: RoomAllocation; actor: string; note: string }
  | { type: 'allocation/remove'; id: string; actor: string; note: string }
  | { type: 'allocation/status'; id: string; status: AllocationStatus }
  | { type: 'allocation/publish'; householdId: string; published: boolean }
  | { type: 'invitation/state'; householdId: string; state: InvitationState }
  | { type: 'function/publish'; id: string; published: boolean }
  | { type: 'wedding/template'; id: string }
  | { type: 'guest/respond'; householdId: string; guests: Guest[] }
  | { type: 'reset' }

const now = () => new Date().toISOString()
const event = (actor: string, action: string, detail: string) => ({ id: `e${Math.random().toString(36).slice(2, 8)}`, at: now(), actor, action, detail })

function reducer(s: WeddingData, a: Action): WeddingData {
  switch (a.type) {
    case 'allocation/add':
      return { ...s, allocations: [...s.allocations, a.allocation], audit: [event(a.actor, 'Room allocated', a.note), ...s.audit] }
    case 'allocation/remove':
      return { ...s, allocations: s.allocations.filter((x) => x.id !== a.id), audit: [event(a.actor, 'Room allocation removed', a.note), ...s.audit] }
    case 'allocation/status':
      return { ...s, allocations: s.allocations.map((x) => (x.id === a.id ? { ...x, status: a.status } : x)) }
    case 'allocation/publish':
      return {
        ...s,
        allocations: s.allocations.map((x) => (x.householdId === a.householdId ? { ...x, publishedToGuest: a.published } : x)),
        audit: [event('Ananya Iyer', a.published ? 'Stay details published' : 'Stay details hidden', s.households.find((h) => h.id === a.householdId)?.name ?? ''), ...s.audit],
      }
    case 'invitation/state':
      return { ...s, households: s.households.map((h) => (h.id === a.householdId ? { ...h, invitation: a.state, sentAt: h.sentAt ?? now().slice(0, 10) } : h)) }
    case 'wedding/template':
      return { ...s, wedding: { ...s.wedding, rsvpTemplate: a.id }, audit: [event('Ananya Iyer', 'RSVP design changed', templateById(a.id).name), ...s.audit] }
    case 'function/publish':
      return { ...s, functions: s.functions.map((f) => (f.id === a.id ? { ...f, isPublished: a.published } : f)) }
    case 'guest/respond': {
      const ids = new Set(a.guests.map((g) => g.id))
      const h = s.households.find((x) => x.id === a.householdId)!
      const was = h.invitation
      return {
        ...s,
        guests: [...s.guests.filter((g) => !ids.has(g.id)), ...a.guests],
        households: s.households.map((x) => (x.id === a.householdId ? { ...x, invitation: was === 'SUBMITTED' || was === 'UPDATED' ? 'UPDATED' : 'SUBMITTED', respondedAt: now().slice(0, 10) } : x)),
        audit: [event(`${h.name} (guest link)`, was === 'SUBMITTED' ? 'Response updated' : 'Response submitted', `${a.guests.length} people, ${a.guests.filter((g) => g.rsvp === 'YES').length} attending`), ...s.audit],
      }
    }
    case 'reset':
      return sampleData
  }
}

const Ctx = createContext<{ data: WeddingData; dispatch: (a: Action) => void } | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, dispatch] = useReducer(reducer, sampleData)
  const value = useMemo(() => ({ data, dispatch }), [data])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useStore() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useStore outside StoreProvider')
  return v
}
