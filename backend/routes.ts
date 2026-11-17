// Every API route in one place: method + path -> controller. Paths are under /api.
import * as docs from './controllers/docsController'
import * as guests from './controllers/guestController'
import * as weddings from './controllers/weddingController'

type Handler = (req: Request, param: string) => Promise<Response>

export const routes: [method: string, path: string, handler: Handler][] = [
  ['POST', '/weddings', weddings.create],
  ['GET', '/w/:token', weddings.get],
  ['POST', '/w/:token', weddings.change],
  ['GET', '/g/:familyId', guests.getInvite],
  ['POST', '/g/:familyId', guests.reply],
  ['GET', '/openapi.json', docs.spec],
  ['GET', '/docs', docs.page],
]
