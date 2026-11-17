// Data access for who manages a wedding (members) and their invite links (invites).
import { sql } from '../db'
import type { User } from '../auth'

export type Role = 'OWNER' | 'HELPER'
export type HelperSide = 'BRIDE' | 'GROOM' | null
export interface MemberRow { userId: string; name: string; email: string; role: Role; side: HelperSide }
export interface InviteRow { code: string; name: string; side: HelperSide; createdAt: string }

const INVITE_DAYS = 14

export async function findMember(weddingId: string, userId: string): Promise<MemberRow | undefined> {
  const [m] = await sql<MemberRow[]>`select user_id as "userId", name, email, role, side from members where wedding_id = ${weddingId} and user_id = ${userId}`
  return m
}

/** Adds the person, or makes an existing helper the owner. Never turns an owner into a helper. */
export async function addMember(weddingId: string, user: User, name: string, role: Role, side: HelperSide): Promise<void> {
  await sql`insert into members (wedding_id, user_id, name, email, role, side) values (${weddingId}, ${user.id}, ${name}, ${user.email}, ${role}, ${side})
    on conflict (wedding_id, user_id) do update set role = 'OWNER', side = null where excluded.role = 'OWNER'`
}

export const listMembers = (weddingId: string) =>
  sql<MemberRow[]>`select user_id as "userId", name, email, role, side from members where wedding_id = ${weddingId} order by role desc, created_at`

export async function removeHelper(weddingId: string, userId: string): Promise<boolean> {
  return (await sql`delete from members where wedding_id = ${weddingId} and user_id = ${userId} and role = 'HELPER'`).count > 0
}

export const weddingsOf = (userId: string) =>
  sql<{ id: string; role: Role; side: HelperSide; name: string; startDate: string; endDate: string; city: string }[]>`
    select w.id, m.role, m.side, w.data->'wedding'->>'name' as name, w.data->'wedding'->>'startDate' as "startDate",
      w.data->'wedding'->>'endDate' as "endDate", w.data->'wedding'->>'city' as city
    from members m join weddings w on w.id = m.wedding_id where m.user_id = ${userId} order by w.created_at desc`

export async function createInvite(code: string, weddingId: string, name: string, side: HelperSide): Promise<void> {
  await sql`insert into invites (code, wedding_id, name, side) values (${code}, ${weddingId}, ${name}, ${side})`
}

export const listInvites = (weddingId: string) =>
  sql<InviteRow[]>`select code, name, side, created_at as "createdAt" from invites
    where wedding_id = ${weddingId} and used_at is null and created_at > now() - make_interval(days => ${INVITE_DAYS}) order by created_at`

export async function deleteInvite(weddingId: string, code: string): Promise<void> {
  await sql`delete from invites where wedding_id = ${weddingId} and code = ${code}`
}

/** An invite that can still be used, with the wedding's name. */
export async function findOpenInvite(code: string) {
  const [i] = await sql<{ weddingId: string; weddingName: string; name: string; side: HelperSide }[]>`
    select i.wedding_id as "weddingId", w.data->'wedding'->>'name' as "weddingName", i.name, i.side
    from invites i join weddings w on w.id = i.wedding_id
    where i.code = ${code} and i.used_at is null and i.created_at > now() - make_interval(days => ${INVITE_DAYS})`
  return i
}

/** Uses an invite once: two people opening the same link can't both join. */
export async function useInvite(code: string) {
  const [i] = await sql<{ weddingId: string; name: string; side: HelperSide }[]>`
    update invites set used_at = now() where code = ${code} and used_at is null and created_at > now() - make_interval(days => ${INVITE_DAYS})
    returning wedding_id as "weddingId", name, side`
  return i
}
