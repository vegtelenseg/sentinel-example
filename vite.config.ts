import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

function sentinelVersion(): string {
  const pkgPath = resolve(
    import.meta.dirname,
    'node_modules/@siremzam/sentinel/package.json',
  )
  return JSON.parse(readFileSync(pkgPath, 'utf-8')).version as string
}

export default defineConfig({
  base: '/sentinel-example/',
  plugins: [react()],
  define: {
    __SENTINEL_VERSION__: JSON.stringify(sentinelVersion()),
  },
})
