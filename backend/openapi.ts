// API description shown by Swagger UI at /api/docs.
const json = (schema: object) => ({ content: { 'application/json': { schema } } })
const wedding = { $ref: '#/components/schemas/WeddingData' }
const err = (description: string) => ({ description, ...json({ $ref: '#/components/schemas/Error' }) })
const action = (example: object) => ({ required: true, ...json({ type: 'object', required: ['type'], properties: { type: { type: 'string' } }, additionalProperties: true, example }) })
const token = { name: 'token', in: 'path', required: true, description: 'The couple’s private token, from the private link #/w/<token>', schema: { type: 'string' } }
const id = { name: 'id', in: 'path', required: true, description: 'The wedding id (data.wedding.id)', schema: { type: 'string', format: 'uuid' } }
const code = { name: 'code', in: 'path', required: true, description: 'Invite code, from #/join/<code>', schema: { type: 'string' } }
const signedIn = [{ google: [] }]
const helperLink = { name: 'link', in: 'path', required: true, description: 'A helper’s personal link token, from #/h/<link>', schema: { type: 'string' } }
const ok = { description: 'Done', ...json({ type: 'object' }) }
const family = { name: 'familyId', in: 'path', required: true, description: 'A family’s id, from their guest link #/g/<id>', schema: { type: 'string' } }

export const openapi = {
  openapi: '3.0.3',
  info: { title: 'WeddingStay API', version: '1.0.0', description: 'The couple’s private token opens a wedding; signed-in people (Google, via Supabase Auth) open the weddings they belong to; a helper who chose not to sign in uses a personal link; a family id opens one family’s invite. Click Authorize and paste a Supabase access token to try the signed-in routes. Every change is an action (see shared/reducer.ts) applied on the server.' },
  servers: [{ url: '/api' }],
  paths: {
    '/weddings': {
      post: {
        summary: 'Create a wedding', tags: ['Couple'], description: 'If signed in, the wedding is also added to that account as its owner.',
        requestBody: action({ type: 'wedding/create', brideName: 'Priya Sharma', groomName: 'Arjun Mehta', city: 'Jaipur', venueName: 'Rambagh Palace', startDate: '2027-02-12', endDate: '2027-02-14', functions: ['Mehendi', 'Haldi', 'Sangeet', 'Wedding'] }),
        responses: { 200: { description: 'Created. Keep the token: it is the private link.', ...json({ type: 'object', properties: { token: { type: 'string' }, data: wedding } }) }, 400: err('Missing or bad details') },
      },
    },
    '/w/{token}': {
      parameters: [token],
      get: { summary: 'Read the whole wedding', tags: ['Couple'], responses: { 200: { description: 'The wedding', ...json(wedding) }, 404: err('Unknown token') } },
      post: {
        summary: 'Change the wedding', tags: ['Couple'],
        description: 'Allowed types: household/add, invitation/state, guest/respond, function/add, function/publish, wedding/template, hotel/add, allocation/add, allocation/remove, allocation/status, allocation/publish. Field shapes are in shared/reducer.ts.',
        requestBody: action({ type: 'invitation/state', householdId: 'habc123def456', state: 'SENT' }),
        responses: { 200: { description: 'The wedding after the change', ...json(wedding) }, 400: err('Action not allowed'), 404: err('Unknown token') },
      },
    },
    '/w/{token}/claim': {
      parameters: [token],
      post: { summary: 'Save this wedding to my Google account', tags: ['Signed in'], security: signedIn, responses: { 200: { description: 'You are now its owner', ...json({ type: 'object', properties: { id: { type: 'string' } } }) }, 401: err('Not signed in'), 404: err('Unknown token') } },
    },
    '/me/weddings': {
      get: { summary: 'My weddings', tags: ['Signed in'], security: signedIn, responses: { 200: { description: 'id, role (OWNER or HELPER), side, name, dates, city', ...json({ type: 'array', items: { type: 'object' } }) }, 401: err('Not signed in') } },
    },
    '/weddings/{id}': {
      parameters: [id],
      get: { summary: 'Read a wedding I belong to', tags: ['Signed in'], security: signedIn, description: 'A helper sees only their side’s families (and those shared by both).', responses: { 200: { description: 'The wedding', ...json(wedding) }, 401: err('Not signed in'), 404: err('Not in your account') } },
      post: {
        summary: 'Change a wedding I belong to', tags: ['Signed in'], security: signedIn,
        description: 'Same actions as POST /w/{token}. Helpers can’t change functions or the invite design, and only touch families on their side.',
        requestBody: action({ type: 'invitation/state', householdId: 'habc123def456', state: 'SENT' }),
        responses: { 200: { description: 'The wedding after the change', ...json(wedding) }, 400: err('Action not allowed'), 403: err('Not allowed for a helper'), 404: err('Not in your account') },
      },
    },
    '/weddings/{id}/team': {
      parameters: [id],
      get: { summary: 'Who’s helping', tags: ['Signed in'], security: signedIn, responses: { 200: { description: 'me, members, and open invites (owner only)', ...json({ type: 'object' }) }, 404: err('Not in your account') } },
    },
    '/weddings/{id}/invites': {
      parameters: [id],
      post: {
        summary: 'Invite a helper (owner)', tags: ['Signed in'], security: signedIn,
        description: 'name: 1 to 60 letters, shown to the helper and in Who’s helping. side: BRIDE or GROOM limits them to that side’s families (plus those shared by both); null or missing = every family. Up to 30 helpers and open invites per wedding.',
        requestBody: { required: true, ...json({ type: 'object', required: ['name'], properties: { name: { type: 'string', minLength: 1, maxLength: 60 }, side: { type: 'string', enum: ['BRIDE', 'GROOM'], nullable: true } }, example: { name: 'Sunita (Mummy)', side: 'BRIDE' } }) },
        responses: { 200: { description: 'The code for #/join/<code>; works once, for 14 days', ...json({ type: 'object', properties: { code: { type: 'string' }, expiresInDays: { type: 'integer' } } }) }, 400: err('Bad name or side, or too many helpers'), 403: err('Only the couple') },
      },
    },
    '/weddings/{id}/invites/{code}': { parameters: [id, code], delete: { summary: 'Cancel an invite (owner)', tags: ['Signed in'], security: signedIn, responses: { 200: ok, 403: err('Only the couple') } } },
    '/weddings/{id}/members/{memberId}': {
      parameters: [id, { name: 'memberId', in: 'path', required: true, description: 'members[].id from GET /weddings/{id}/team', schema: { type: 'string', format: 'uuid' } }],
      delete: { summary: 'Remove a helper (owner)', tags: ['Signed in'], security: signedIn, description: 'Works for helpers who signed in and for those using a personal link (their link stops working). The couple can’t be removed.', responses: { 200: ok, 403: err('Only the couple'), 404: err('No such helper') } },
    },
    '/join/{code}': {
      parameters: [code],
      get: { summary: 'Read an invite', tags: ['Signed in'], responses: { 200: { description: 'weddingName, name, side', ...json({ type: 'object' }) }, 404: err('Used or expired') } },
      post: { summary: 'Join as a helper (signed in)', tags: ['Signed in'], security: signedIn, description: 'Uses the invite. The wedding then shows in GET /me/weddings.', responses: { 200: { description: 'The wedding id', ...json({ type: 'object', properties: { id: { type: 'string' } } }) }, 401: err('Not signed in'), 404: err('Used or expired') } },
    },
    '/join/{code}/link': {
      parameters: [code],
      post: { summary: 'Join as a helper without signing in', tags: ['Helper link'], description: 'Uses the invite and returns a personal link token for #/h/<link>. Anyone with it can work on this helper’s families, so the app asks them to keep it safe. Removing the helper turns it off.', responses: { 200: { description: 'The personal link token', ...json({ type: 'object', properties: { link: { type: 'string' } } }) }, 404: err('Used or expired') } },
    },
    '/h/{link}': {
      parameters: [helperLink],
      get: { summary: 'Read the wedding with a helper’s personal link', tags: ['Helper link'], description: 'Same view as a signed-in helper: their side’s families only.', responses: { 200: { description: 'The wedding', ...json(wedding) }, 404: err('Unknown or removed') } },
      post: { summary: 'Change the wedding with a helper’s personal link', tags: ['Helper link'], description: 'Same rules as a signed-in helper.', requestBody: action({ type: 'invitation/state', householdId: 'habc123def456', state: 'SENT' }), responses: { 200: { description: 'The wedding after the change', ...json(wedding) }, 400: err('Action not allowed'), 403: err('Not allowed for a helper'), 404: err('Unknown or removed') } },
    },
    '/h/{link}/team': {
      parameters: [helperLink],
      get: { summary: 'Who’s helping, seen from a personal link', tags: ['Helper link'], responses: { 200: { description: 'me and members (no invites)', ...json({ type: 'object' }) }, 404: err('Unknown or removed') } },
    },
    '/g/{familyId}': {
      parameters: [family],
      get: { summary: 'Read one family’s invite', tags: ['Guest'], description: 'Only this family’s people and rooms, and the published functions.', responses: { 200: { description: 'The invite', ...json(wedding) }, 404: err('Unknown family') } },
      post: {
        summary: 'Send this family’s reply', tags: ['Guest'],
        description: 'Only type guest/respond, and only for people already in this family.',
        requestBody: action({ type: 'guest/respond', householdId: 'habc123def456', guests: ['…the family’s guests from GET, with rsvp, attendance, stay and travel filled in'] }),
        responses: { 200: { description: 'The invite after the reply', ...json(wedding) }, 400: err('Reply not allowed'), 404: err('Unknown family') },
      },
    },
  },
  components: {
    securitySchemes: { google: { type: 'http', scheme: 'bearer', bearerFormat: 'Supabase access token (JWT)' } },
    schemas: {
      Error: { type: 'object', properties: { error: { type: 'string' } } },
      WeddingData: { type: 'object', description: 'See shared/types.ts', properties: Object.fromEntries(['wedding', 'functions', 'members', 'households', 'guests', 'hotels', 'roomTypes', 'blocks', 'allocations', 'audit'].map((k) => [k, k === 'wedding' ? { type: 'object' } : { type: 'array', items: { type: 'object' } }])) },
    },
  },
}

export const docsPage = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>WeddingStay API</title>
<link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.17.14/swagger-ui.css"></head><body><div id="ui"></div>
<script src="https://unpkg.com/swagger-ui-dist@5.17.14/swagger-ui-bundle.js"></script>
<script>SwaggerUIBundle({ url: 'openapi.json', dom_id: '#ui' })</script></body></html>`
