// Every API route in one place: method + path -> controller. Paths are under /api.
import * as docs from './controllers/docsController'
import * as guests from './controllers/guestController'
import * as team from './controllers/teamController'
import * as weddings from './controllers/weddingController'

type Handler = (req: Request, ...params: string[]) => Promise<Response>

export const routes: [method: string, path: string, handler: Handler][] = [
  ['POST', '/weddings', weddings.create],
  // The couple's private link
  ['GET', '/w/:token', weddings.get],
  ['POST', '/w/:token', weddings.change],
  ['POST', '/w/:token/claim', team.claim],
  // Signed in with Google
  ['GET', '/me/weddings', team.mine],
  ['GET', '/weddings/:id', weddings.getAsMember],
  ['POST', '/weddings/:id', weddings.changeAsMember],
  ['GET', '/weddings/:id/team', team.get],
  ['POST', '/weddings/:id/invites', team.invite],
  ['DELETE', '/weddings/:id/invites/:code', team.cancelInvite],
  ['DELETE', '/weddings/:id/members/:userId', team.remove],
  ['GET', '/join/:code', team.inviteInfo],
  ['POST', '/join/:code', team.join],
  // A family's guest link
  ['GET', '/g/:familyId', guests.getInvite],
  ['POST', '/g/:familyId', guests.reply],
  ['GET', '/openapi.json', docs.spec],
  ['GET', '/docs', docs.page],
]
