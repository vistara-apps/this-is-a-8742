/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SOLANA_NETWORK: string
  readonly VITE_RPC_ENDPOINT: string
  readonly VITE_COMMISSION_RATE: string
  readonly VITE_MIN_STAKE_AMOUNT: string
  readonly VITE_MAX_STAKE_AMOUNT: string
  readonly VITE_MAX_WIN_MULTIPLIER: string
  readonly VITE_WITHDRAWAL_TIMELOCK: string
  readonly VITE_AIRSTACK_API_KEY: string
  readonly VITE_COINGECKO_API_KEY: string
  readonly VITE_SENTRY_DSN: string
  readonly VITE_GA_MEASUREMENT_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
