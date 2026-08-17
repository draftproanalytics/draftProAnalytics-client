// File: vite.config.ts
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

const projectRoot = fileURLToPath(new URL('.', import.meta.url))
const packageJsonPath = path.join(projectRoot, 'package.json')
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8')) as {
  version?: string
}

const version = packageJson.version?.trim()

if (!version) {
  throw new Error('package.json version is required to generate the DPA client release')
}

const gitSha = execFileSync('git', ['rev-parse', '--short', 'HEAD'], {
  cwd: projectRoot,
  encoding: 'utf8',
}).trim()

if (!gitSha) {
  throw new Error('Unable to determine current client Git SHA')
}

const dpaRelease = `${version}+${gitSha}`

console.info(`[release] DPA Client ${dpaRelease}`)

export default defineConfig({
  plugins: [vue()],

  define: {
    __DPA_RELEASE__: JSON.stringify(dpaRelease),
  },

  resolve: {
    alias: {
      '@': path.resolve(projectRoot, './src'),
    },
  },

  build: {
    sourcemap: true,
  },

  // Development source maps.
  css: {
    devSourcemap: true,
  },

  server: {
    port: 5173,
    open: false,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
    watch: {
      usePolling: true,
      interval: 150,
      ignored: ['**/node_modules/**', '**/.git/**'],
    },
  },
})