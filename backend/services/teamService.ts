// Who manages a wedding: signed-in people's weddings, helpers, and their invite links. Business rules only; no HTTP, no SQL.
import { newId } from '../../shared/reducer'
import type { User } from '../auth'
import { AppError } from '../errors'
import * as team from '../repositories/teamRepository'
import * as weddings from '../repositories/weddingRepository'
import { isUuid, secretOr404, validateInvite } from '../validators/team'

const NOT_YOURS = 'This wedding isn’t in your account.'
const BAD_INVITE = 'This invite link has been used or has expired. Ask the couple for a new one.'
const BAD_LINK = 'This helper link isn’t working any more. Ask the couple to send you a new invite.'

/** The caller's place in a wedding; 404 if they aren't part of it (so ids can't be probed). */
export async function membership(weddingId: string, user: User): Promise<team.MemberRow> {
  const m = isUuid(weddingId) ? await team.findMember(weddingId, user.id) : undefined
  if (!m) throw new AppError(404, NOT_YOURS)
  return m
}

/** A helper who didn't sign in, by their personal link. */
export async function linkHelper(linkToken: string): Promise<team.MemberRow> {
  const m = await team.findByLink(secretOr404(linkToken, BAD_LINK))
  if (!m) throw new AppError(404, BAD_LINK)
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

/** Everyone on the wedding. Open invites only for the couple. */
async function teamOf(me: team.MemberRow) {
  return { me, members: await team.listMembers(me.weddingId), invites: me.role === 'OWNER' ? await team.listInvites(me.weddingId) : [] }
}
export const getTeam = async (weddingId: string, user: User) => teamOf(await membership(weddingId, user))
export const getTeamByLink = async (linkToken: string) => teamOf(await linkHelper(linkToken))

export async function invite(weddingId: string, user: User, input: Record<string, unknown>) {
  await ownerOf(weddingId, user)
  const { name, side } = validateInvite(input)
  if ((await team.teamSize(weddingId)) >= team.MAX_TEAM) throw new AppError(400, `A wedding can have up to ${team.MAX_TEAM} helpers. Remove someone or cancel an invite first.`)
  const code = newId() + newId() // ~120 random bits, used once
  await team.createInvite(code, weddingId, name, side)
  return { code, expiresInDays: team.INVITE_DAYS }
}

export async function cancelInvite(weddingId: string, user: User, code: string) {
  await ownerOf(weddingId, user)
  if (!(await team.deleteInvite(weddingId, secretOr404(code, 'That invite isn’t open any more.')))) throw new AppError(404, 'That invite isn’t open any more.')
  return { ok: true }
}

export async function removeHelper(weddingId: string, user: User, memberId: string) {
  await ownerOf(weddingId, user)
  if (!isUuid(memberId) || !(await team.removeHelper(weddingId, memberId))) throw new AppError(404, 'That helper isn’t on this wedding.')
  return { ok: true }
}

export async function inviteInfo(code: string) {
  const i = await team.findOpenInvite(secretOr404(code, BAD_INVITE))
  if (!i) throw new AppError(404, BAD_INVITE)
  return { weddingName: i.weddingName, name: i.name, side: i.side }
}

/** Join with Google. */
export async function join(code: string, user: User) {
  const i = await team.useInvite(secretOr404(code, BAD_INVITE))
  if (!i) throw new AppError(404, BAD_INVITE)
  await team.addMember(i.weddingId, user, i.name, 'HELPER', i.side) // an owner opening it stays the owner
  return { id: i.weddingId }
}

/** Join without signing in: the helper gets their own personal link instead. */
export async function joinWithLink(code: string) {
  const i = await team.useInvite(secretOr404(code, BAD_INVITE))
  if (!i) throw new AppError(404, BAD_INVITE)
  const link = newId() + newId() // ~120 random bits, like the couple's private link
  await team.addLinkHelper(i.weddingId, link, i.name, i.side)
  return { link }
}
