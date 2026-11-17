import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// In `npm run dev`, answer /api/* with the same code the Netlify Function runs (needs DATABASE_URL).
const devApi = (): Plugin => ({
  name: 'dev-api',
  configureServer(server) {
    server.middlewares.use('/api', async (req, res) => {
      const chunks: Buffer[] = []
      for await (const c of req) chunks.push(c as Buffer)
      const { default: api } = await server.ssrLoadModule('/src/server/api.ts')
      const r: Response = await api(new Request(`http://localhost/api${req.url}`, { method: req.method, headers: req.headers as HeadersInit, body: req.method === 'GET' ? undefined : Buffer.concat(chunks) }))
      res.writeHead(r.status, Object.fromEntries(r.headers)).end(await r.text())
    })
  },
})

// `--mode preview` builds one self-contained HTML file (used for shareable previews).
export default defineConfig(({ mode }) => ({
  base: './',
  plugins: [react(), devApi(), ...(mode === 'preview' ? [viteSingleFile()] : [])],
  build: { outDir: mode === 'preview' ? 'dist-preview' : 'dist' },
}))
