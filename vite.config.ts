import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// `--mode preview` builds one self-contained HTML file (used for shareable previews).
export default defineConfig(({ mode }) => ({
  base: './',
  plugins: [react(), ...(mode === 'preview' ? [viteSingleFile()] : [])],
  build: { outDir: mode === 'preview' ? 'dist-preview' : 'dist' },
}))
