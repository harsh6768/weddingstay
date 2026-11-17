// Checks on helper invites and the ids in team URLs. Throws AppError(400/404) when something isn't right.
import { AppError } from '../errors'
import type { HelperSide } from '../repositories/teamRepository'

/** Codes and personal links are two newId()s: 24 characters from newId's alphabet. */
export const isSecret = (s: string) => /^[a-km-np-z2-9]{24}$/.test(s)
export const isUuid = (s: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s)

/** A malformed link gets the same answer as an unknown one. */
export function secretOr404(s: string, message: string): string {
  if (!isSecret(s)) throw new AppError(404, message)
  return s
}

export function validateInvite(input: Record<string, unknown>): { name: string; side: HelperSide } {
  const name = typeof input.name === 'string' ? input.name.trim().replace(/\s+/g, ' ') : ''
  if (!name) throw new AppError(400, 'Please add their name.')
  if (name.length > 60) throw new AppError(400, 'Please keep the name under 60 letters.')
  if (!(input.side === 'BRIDE' || input.side === 'GROOM' || input.side === null || input.side === undefined)) throw new AppError(400, 'Please pick which guests they’ll handle.')
  return { name, side: (input.side ?? null) as HelperSide }
}
