// The database connection. Settings come from DATABASE_URL (.env.local locally, Netlify env in production).
import postgres from 'postgres'

declare const process: { env: Record<string, string | undefined> }

export const hasDatabase = !!process.env.DATABASE_URL

// prepare: false because Supabase's transaction pooler doesn't support prepared statements.
// Without DATABASE_URL, postgres() would quietly try a local database named after your computer user, so api.ts refuses first.
export const sql = postgres(process.env.DATABASE_URL || 'postgres://not-configured', { prepare: false, max: 1, idle_timeout: 20 })
