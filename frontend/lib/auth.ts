// Google sign-in through Supabase Auth. Only the couple and their helpers sign in; guests never do.
import { createClient, type Session } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
export const authReady = !!(url && key)

// PKCE puts ?code= in the query string, which leaves the #/hash routes alone.
export const supabase = authReady ? createClient(url!, key!, { auth: { flowType: 'pkce', detectSessionInUrl: true, persistSession: true } }) : null

const NEXT = 'weddingstay.next'

/** Leaves for Google, then comes back to `next` (a #/ route) once signed in. */
export async function signInWithGoogle(next: string) {
  if (!supabase) throw new Error('Google sign-in isn’t set up yet.')
  try { localStorage.setItem(NEXT, next) } catch { /* private mode: lands on the home page instead */ }
  const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: location.origin + location.pathname } })
  if (error) throw error
}

/** Where to go after coming back from Google (read once). */
export function takeNext(): string | null {
  try { const n = localStorage.getItem(NEXT); localStorage.removeItem(NEXT); return n } catch { return null }
}

export async function signOut() {
  try { localStorage.removeItem('weddingstay.wedding') } catch { /* nothing saved */ }
  await supabase?.auth.signOut()
}

export async function accessToken(): Promise<string | null> {
  return (await supabase?.auth.getSession())?.data.session?.access_token ?? null
}

export const userName = (s: Session | null) => (s?.user.user_metadata?.full_name as string | undefined) || s?.user.email || ''

/** The current sign-in. `ready` is false until Supabase has checked (including finishing a Google return). */
export function useSession() {
  const [state, setState] = useState<{ session: Session | null; ready: boolean }>({ session: null, ready: !supabase })
  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => setState({ session: data.session, ready: true }))
    const { data } = supabase.auth.onAuthStateChange((_e, session) => setState({ session, ready: true }))
    return () => data.subscription.unsubscribe()
  }, [])
  return state
}
