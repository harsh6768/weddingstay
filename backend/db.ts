// The database connection. Settings come from DATABASE_URL (.env.local locally, Netlify env in production).
import postgres from 'postgres'

declare const process: { env: Record<string, string | undefined> }

// prepare: false because Supabase's transaction pooler doesn't support prepared statements.
export const sql = postgres(process.env.DATABASE_URL ?? '', { prepare: false, max: 1, idle_timeout: 20 })
