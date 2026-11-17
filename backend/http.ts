// Small helpers for reading requests and writing responses.
import type { Action } from '../shared/reducer'
import { AppError } from './errors'

const MAX_BODY = 300_000

export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } })

export const html = (body: string) => new Response(body, { headers: { 'content-type': 'text/html; charset=utf-8' } })

/** Reads the request body as an action: a JSON object with a string `type`. */
export async function readAction(req: Request): Promise<Action> {
  const text = await req.text()
  if (text.length > MAX_BODY) throw new AppError(413, 'That’s too much data at once.')
  try {
    const a = JSON.parse(text)
    if (a && typeof a.type === 'string') return a
  } catch { /* falls through */ }
  throw new AppError(400, 'That request wasn’t understood.')
}
