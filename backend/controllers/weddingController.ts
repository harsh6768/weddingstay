// HTTP layer for the couple and helpers: read the request, call the service, send the response.
import { requireUser, userFrom } from '../auth'
import { json, readAction } from '../http'
import * as service from '../services/weddingService'
import { validateCreate } from '../validators/actions'

export const create = async (req: Request) => json(await service.createWedding(validateCreate(await readAction(req)), await userFrom(req)))
// With the private link
export const get = async (_req: Request, token: string) => json(await service.getWedding(token))
export const change = async (req: Request, token: string) => json(await service.changeWedding(token, await readAction(req)))
// Signed in with Google
export const getAsMember = async (req: Request, id: string) => json(await service.getAsMember(id, await requireUser(req)))
export const changeAsMember = async (req: Request, id: string) => json(await service.changeAsMember(id, await requireUser(req), await readAction(req)))
// A helper's personal link (no sign-in)
export const getByLink = async (_req: Request, link: string) => json(await service.getByLink(link))
export const changeByLink = async (req: Request, link: string) => json(await service.changeByLink(link, await readAction(req)))
