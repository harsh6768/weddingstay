// The couple's side: create a wedding, read it, change it. Business rules live here; no HTTP, no SQL.
import { sampleData } from '../../shared/sample'
import { newId, reducer, type Action } from '../../shared/reducer'
import type { WeddingData } from '../../shared/types'
import { AppError } from '../errors'
import * as weddings from '../repositories/weddingRepository'
import { validateCoupleAction, type CreateWedding } from '../validators/actions'

// shortcut: no rate limit on creating weddings; add one if spam shows up.
export async function createWedding(input: CreateWedding): Promise<{ token: string; data: WeddingData }> {
  const id = crypto.randomUUID()
  const token = newId() + newId() // ~120 random bits: this is the couple's private link
  const created = reducer(sampleData, input)
  const data = { ...created, wedding: { ...created.wedding, id } }
  await weddings.insert(id, token, data)
  return { token, data }
}

async function byToken(token: string) {
  const row = await weddings.findByManageToken(token)
  if (!row) throw new AppError(404, 'This link doesn’t open a wedding.')
  return row
}

export const getWedding = async (token: string) => (await byToken(token)).data

export async function changeWedding(token: string, a: Action): Promise<WeddingData> {
  validateCoupleAction(a)
  const row = await byToken(token)
  return weddings.update(row.id, (d) => reducer(d, a))
}
