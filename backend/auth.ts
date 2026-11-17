// Who is calling: checks the Supabase sign-in token (Google login) sent as "Authorization: Bearer <token>".
import { createRemoteJWKSet, decodeProtectedHeader, jwtVerify } from 'jose'
import { AppError } from './errors'

declare const process: { env: Record<string, string | undefined> }

export interface User { id: string; email: string; name: string }

const url = process.env.VITE_SUPABASE_URL
// Newer Supabase projects sign tokens with public keys (JWKS); older ones with a shared secret (HS256).
const jwks = url ? createRemoteJWKSet(new URL(`${url}/auth/v1/.well-known/jwks.json`)) : null
const secret = process.env.SUPABASE_JWT_SECRET ? new TextEncoder().encode(process.env.SUPABASE_JWT_SECRET) : null

/** The signed-in person, or null when the request has no token. A bad or expired token is a 401. */
export async function userFrom(req: Request): Promise<User | null> {
  const token = req.headers.get('authorization')?.match(/^Bearer (.+)$/)?.[1]
  if (!token) return null
  if (!url || !jwks) throw new AppError(503, 'Google sign-in isn’t set up. Add VITE_SUPABASE_URL to .env.local and restart npm run dev.')
  try {
    const opts = { issuer: `${url}/auth/v1`, audience: 'authenticated' }
    const hs = decodeProtectedHeader(token).alg === 'HS256'
    if (hs && !secret) throw new Error('HS256 token but SUPABASE_JWT_SECRET is not set')
    const { payload: p } = hs ? await jwtVerify(token, secret!, opts) : await jwtVerify(token, jwks, opts)
    const meta = (p.user_metadata ?? {}) as Record<string, string>
    const email = String(p.email ?? '')
    return { id: String(p.sub), email, name: meta.full_name || meta.name || email }
  } catch (e) {
    console.warn('Sign-in token rejected:', (e as Error).message)
    throw new AppError(401, 'Please sign in again.')
  }
}

export async function requireUser(req: Request): Promise<User> {
  const user = await userFrom(req)
  if (!user) throw new AppError(401, 'Please sign in with Google first.')
  return user
}
