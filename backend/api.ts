// Entry point for /api/* (a Netlify Function in production, Vite middleware in `npm run dev`).
// Layers: routes -> controllers (HTTP) -> services (rules) -> repositories (SQL). See README "How the backend works".
import { hasDatabase } from './db'
import { AppError } from './errors'
import { json } from './http'
import { routes } from './routes'

function match(method: string, pathname: string) {
  const parts = pathname.replace(/^\/api/, '').split('/')
  for (const [m, path, handler] of routes) {
    const want = path.split('/')
    if (m !== method || want.length !== parts.length) continue
    const params: string[] = []
    if (want.every((w, i) => (w.startsWith(':') ? (params.push(decodeURIComponent(parts[i])), !!parts[i]) : w === parts[i]))) return { handler, params }
  }
}

export default async function api(req: Request): Promise<Response> {
  const route = match(req.method, new URL(req.url).pathname)
  if (!route) return json({ error: 'Not found' }, 404)
  if (!hasDatabase && !/^\/api\/(docs|openapi\.json)$/.test(new URL(req.url).pathname))
    return json({ error: 'No database is set up. Add DATABASE_URL to .env.local and restart npm run dev.' }, 503)
  try {
    return await route.handler(req, ...route.params)
  } catch (e) {
    if (e instanceof AppError) return json({ error: e.message }, e.status)
    console.error(e)
    return json({ error: 'Something went wrong. Please try again.' }, 500)
  }
}
