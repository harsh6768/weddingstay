// Data access for who manages a wedding (members) and their one-time invite links (invites).
import { sql } from '../db'
import type { User } from '../auth'

export type Role = 'OWNER' | 'HELPER'
export type HelperSide = 'BRIDE' | 'GROOM' | null
/** signedIn: false = a helper who opens the wedding with their personal link instead of Google. */
export interface MemberRow { id: string; weddingId: string; name: string; email: string | null; role: Role; side: HelperSide; signedIn: boolean }
export interface InviteRow { code: string; name: string; side: HelperSide; createdAt: string }

export const INVITE_DAYS = 14
export const MAX_TEAM = 30 // helpers + open invites per wedding

const member = sql`id, wedding_id as "weddingId", name, email, role, side, user_id is not null as "signedIn"`

export async function findMember(weddingId: string, userId: string): Promise<MemberRow | undefined> {
  const [m] = await sql<MemberRow[]>`select ${member} from members where wedding_id = ${weddingId} and user_id = ${userId}`
  return m
}

export async function findByLink(linkToken: string): Promise<MemberRow | undefined> {
  const [m] = await sql<MemberRow[]>`select ${member} from members where link_token = ${linkToken}`
  return m
}

/** Adds a signed-in person, or makes an existing helper the owner. Never turns an owner into a helper. */
export async function addMember(weddingId: string, user: User, name: string, role: Role, side: HelperSide): Promise<void> {
  await sql`insert into members (wedding_id, user_id, name, email, role, side) values (${weddingId}, ${user.id}, ${name.slice(0, 60)}, ${user.email}, ${role}, ${side})
    on conflict (wedding_id, user_id) do update set role = 'OWNER', side = null where excluded.role = 'OWNER'`
}

export async function addLinkHelper(weddingId: string, linkToken: string, name: string, side: HelperSide): Promise<void> {
  await sql`insert into members (wedding_id, link_token, name, role, side) values (${weddingId}, ${linkToken}, ${name}, 'HELPER', ${side})`
}

export const listMembers = (weddingId: string) =>
  sql<MemberRow[]>`select ${member} from members where wedding_id = ${weddingId} order by role desc, created_at`

export async function removeHelper(weddingId: string, memberId: string): Promise<boolean> {
  return (await sql`delete from members where wedding_id = ${weddingId} and id = ${memberId} and role = 'HELPER'`).count > 0
}

export async function teamSize(weddingId: string): Promise<number> {
  const [r] = await sql<{ n: number }[]>`select (select count(*) from members where wedding_id = ${weddingId} and role = 'HELPER')
    + (select count(*) from invites where wedding_id = ${weddingId} and used_at is null and created_at > now() - make_interval(days => ${INVITE_DAYS})) as n`
  return Number(r.n)
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

export async function deleteInvite(weddingId: string, code: string): Promise<boolean> {
  return (await sql`delete from invites where wedding_id = ${weddingId} and code = ${code} and used_at is null`).count > 0
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
