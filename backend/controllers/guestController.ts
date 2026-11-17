// HTTP layer for a family's guest link.
import { json, readAction } from '../http'
import * as service from '../services/guestService'

export const getInvite = async (_req: Request, familyId: string) => json(await service.getInvite(familyId))
export const reply = async (req: Request, familyId: string) => json(await service.sendReply(familyId, await readAction(req)))
