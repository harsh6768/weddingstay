// Signed-in people: their weddings, who helps with a wedding, and invite links. Business rules only; no HTTP, no SQL.
import { newId } from '../../shared/reducer'
import type { User } from '../auth'
import { AppError } from '../errors'
import * as team from '../repositories/teamRepository'
import * as weddings from '../repositories/weddingRepository'
import type { HelperSide } from '../repositories/teamRepository'

const isUuid = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s)

/** The caller's place in a wedding; 404 if they aren't part of it (so ids can't be probed). */
export async function membership(weddingId: string, user: User) {
  const m = isUuid(weddingId) ? await team.findMember(weddingId, user.id) : undefined
  if (!m) throw new AppError(404, 'This wedding isn’t in your account.')
  return m
}

async function ownerOf(weddingId: string, user: User) {
  const m = await membership(weddingId, user)
  if (m.role !== 'OWNER') throw new AppError(403, 'Only the couple can do that.')
  return m
}

export const myWeddings = (user: User) => team.weddingsOf(user.id)

/** Whoever holds the private link is the couple: link the wedding to their Google account. */
export async function claim(token: string, user: User) {
  const row = await weddings.findByManageToken(token)
  if (!row) throw new AppError(404, 'This link doesn’t open a wedding.')
  await team.addMember(row.id, user, user.name, 'OWNER', null)
  return { id: row.id }
}

export async function getTeam(weddingId: string, user: User) {
  const me = await membership(weddingId, user)
  return { me, members: await team.listMembers(weddingId), invites: me.role === 'OWNER' ? await team.listInvites(weddingId) : [] }
}

export async function invite(weddingId: string, user: User, input: { name?: unknown; side?: unknown }) {
  await ownerOf(weddingId, user)
  const name = typeof input.name === 'string' ? input.name.trim().slice(0, 80) : ''
  const side = (input.side === 'BRIDE' || input.side === 'GROOM' ? input.side : null) as HelperSide
  if (!name) throw new AppError(400, 'Please add their name.')
  const code = newId() + newId() // ~120 random bits, used once
  await team.createInvite(code, weddingId, name, side)
  return { code }
}

export async function cancelInvite(weddingId: string, user: User, code: string) {
  await ownerOf(weddingId, user)
  await team.deleteInvite(weddingId, code)
  return { ok: true }
}

export async function removeHelper(weddingId: string, user: User, userId: string) {
  await ownerOf(weddingId, user)
  if (!(await team.removeHelper(weddingId, userId))) throw new AppError(404, 'That helper isn’t on this wedding.')
  return { ok: true }
}

export async function inviteInfo(code: string) {
  const i = await team.findOpenInvite(code)
  if (!i) throw new AppError(404, 'This invite link has been used or has expired. Ask the couple for a new one.')
  return { weddingName: i.weddingName, name: i.name, side: i.side }
}

export async function join(code: string, user: User) {
  const i = await team.useInvite(code)
  if (!i) throw new AppError(404, 'This invite link has been used or has expired. Ask the couple for a new one.')
  await team.addMember(i.weddingId, user, i.name, 'HELPER', i.side) // an owner opening it stays the owner
  return { id: i.weddingId }
}
