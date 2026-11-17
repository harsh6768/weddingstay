// API description shown by Swagger UI at /api/docs.
const json = (schema: object) => ({ content: { 'application/json': { schema } } })
const wedding = { $ref: '#/components/schemas/WeddingData' }
const err = (description: string) => ({ description, ...json({ $ref: '#/components/schemas/Error' }) })
const action = (example: object) => ({ required: true, ...json({ type: 'object', required: ['type'], properties: { type: { type: 'string' } }, additionalProperties: true, example }) })
const token = { name: 'token', in: 'path', required: true, description: 'The couple’s private token, from the private link #/w/<token>', schema: { type: 'string' } }
const family = { name: 'familyId', in: 'path', required: true, description: 'A family’s id, from their guest link #/g/<id>', schema: { type: 'string' } }

export const openapi = {
  openapi: '3.0.3',
  info: { title: 'WeddingStay API', version: '1.0.0', description: 'No accounts. The couple’s private token opens a wedding; a family id opens one family’s invite. Every change is an action (see shared/reducer.ts) applied on the server.' },
  servers: [{ url: '/api' }],
  paths: {
    '/weddings': {
      post: {
        summary: 'Create a wedding', tags: ['Couple'],
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
