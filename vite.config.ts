// File: vite.config.ts
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { sentryVitePlugin } from '@sentry/vite-plugin'
import vue from '@vitejs/plugin-vue'
import { defineConfig, loadEnv } from 'vite'

const projectRoot = fileURLToPath(new URL('.', import.meta.url))
const packageJsonPath = path.join(projectRoot, 'package.json')

const packageJson = JSON.parse(
  fs.readFileSync(packageJsonPath, 'utf8'),
) as {
  version?: string
}

const version = packageJson.version?.trim()

if (!version) {
  throw new Error(
    'package.json version is required to generate the DPA client release',
  )
}

const gitSha = execFileSync(
  'git',
  ['rev-parse', '--short', 'HEAD'],
  {
    cwd: projectRoot,
    encoding: 'utf8',
  },
).trim()

if (!gitSha) {
  throw new Error('Unable to determine current client Git SHA')
}

const dpaRelease = `${version}+${gitSha}`

console.info(`[release] DPA Client ${dpaRelease}`)

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, projectRoot, '')

  const bugsinkUrl = env.BUGSINK_URL?.trim()
  const bugsinkAuthToken = env.BUGSINK_AUTH_TOKEN?.trim()

  const sourceMapUploadEnabled =
    mode === 'production' &&
    Boolean(bugsinkUrl) &&
    Boolean(bugsinkAuthToken)

  if (mode === 'production' && !sourceMapUploadEnabled) {
    console.warn(
      '[bugsink] production sourcemap upload disabled: ' +
        'BUGSINK_URL or BUGSINK_AUTH_TOKEN is missing',
    )
  }

  return {
    plugins: [
      vue(),

      ...(sourceMapUploadEnabled
        ? [
            sentryVitePlugin({
              // Bugsink does not use Sentry organizations, but the
              // Sentry upload tooling requires these fields.
              org: 'bugsinkhasnoorgs',
              project: 'dpa-client',

              url: bugsinkUrl,
              authToken: bugsinkAuthToken,

              release: {
                name: dpaRelease,
                create: false,
                finalize: false,
                inject: true,
              },

              sourcemaps: {
                filesToDeleteAfterUpload: ['./dist/**/*.map'],
              },
            }),
          ]
        : []),
    ],

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
  }
})