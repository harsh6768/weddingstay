// HTTP layer for signed-in people: my weddings, the wedding's team, invite links.
import { requireUser } from '../auth'
import { AppError } from '../errors'
import { json } from '../http'
import * as service from '../services/teamService'

async function body(req: Request): Promise<Record<string, unknown>> {
  const text = await req.text()
  if (text.length > 2000) throw new AppError(413, 'That’s too much data at once.')
  try { const b = JSON.parse(text || '{}'); if (b && typeof b === 'object') return b } catch { /* falls through */ }
  throw new AppError(400, 'That request wasn’t understood.')
}

export const mine = async (req: Request) => json(await service.myWeddings(await requireUser(req)))
export const claim = async (req: Request, token: string) => json(await service.claim(token, await requireUser(req)))
export const get = async (req: Request, id: string) => json(await service.getTeam(id, await requireUser(req)))
export const invite = async (req: Request, id: string) => json(await service.invite(id, await requireUser(req), await body(req)))
export const cancelInvite = async (req: Request, id: string, code: string) => json(await service.cancelInvite(id, await requireUser(req), code))
export const remove = async (req: Request, id: string, userId: string) => json(await service.removeHelper(id, await requireUser(req), userId))
export const inviteInfo = async (_req: Request, code: string) => json(await service.inviteInfo(code))
export const join = async (req: Request, code: string) => json(await service.join(code, await requireUser(req)))
