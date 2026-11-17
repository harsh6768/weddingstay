// HTTP layer for the couple: read the request, call the service, send the response.
import { json, readAction } from '../http'
import * as service from '../services/weddingService'
import { validateCreate } from '../validators/actions'

export const create = async (req: Request) => json(await service.createWedding(validateCreate(await readAction(req))))
export const get = async (_req: Request, token: string) => json(await service.getWedding(token))
export const change = async (req: Request, token: string) => json(await service.changeWedding(token, await readAction(req)))
