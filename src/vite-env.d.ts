/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly STRIPE_PUBLIC_KEY: string
  readonly STRIPE_SECRET_KEY: string
  readonly PORT: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}