/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DATABASE_URL: string
  readonly VITE_DATABASE_AUTH_TOKEN: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}