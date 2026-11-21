// Data access: the only file that writes SQL. Each wedding is one row; its data is a jsonb document.
import { sql } from '../db'
import type { WeddingData } from '../../shared/types'

export interface WeddingRow { id: string; data: WeddingData }

export async function insert(id: string, manageToken: string, data: WeddingData): Promise<void> {
  await sql`insert into weddings (id, manage_token, data) values (${id}, ${manageToken}, ${sql.json(data as never)})`
}

export async function findByManageToken(token: string): Promise<WeddingRow | undefined> {
  const [row] = await sql<WeddingRow[]>`select id, data from weddings where manage_token = ${token}`
  return row
}

export async function findByFamilyId(familyId: string): Promise<WeddingRow | undefined> {
  const [row] = await sql<WeddingRow[]>`select id, data from weddings where data->'households' @> ${sql.json([{ id: familyId }])} limit 1`
  return row
}

/** Changes a wedding under a row lock, so two changes at once (a couple's edit, a guest's reply) can't overwrite each other. */
export function update(id: string, change: (d: WeddingData) => WeddingData): Promise<WeddingData> {
  return sql.begin(async (tx) => {
    const [row] = await tx<WeddingRow[]>`select data from weddings where id = ${id} for update`
    const data = change(row.data)
    await tx`update weddings set data = ${tx.json(data as never)}, updated_at = now() where id = ${id}`
    return data
  })
}

export async function findById(id: string): Promise<WeddingRow | undefined> {
  const [row] = await sql<WeddingRow[]>`select id, data from weddings where id = ${id}`
  return row
}
