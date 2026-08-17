/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string7
  readonly VITE_SENTRY_DSN: string
  readonly VITE_SENTRY_ENABLED: string
  // Add other env variables here as needed
  // readonly VITE_ANOTHER_VAR: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
