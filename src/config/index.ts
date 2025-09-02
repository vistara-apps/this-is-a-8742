import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

/**
 * Solana BetChain Configuration
 * 
 * This file contains all configuration settings for the application.
 * Values are derived from environment variables or have sensible defaults.
 */

// Network configuration
export const SOLANA_NETWORK = 
  (import.meta.env.VITE_SOLANA_NETWORK as WalletAdapterNetwork) || 
  WalletAdapterNetwork.Devnet;

export const RPC_ENDPOINT = 
  import.meta.env.VITE_RPC_ENDPOINT || 
  'https://api.devnet.solana.com';

// Platform settings
export const COMMISSION_RATE = 
  parseFloat(import.meta.env.VITE_COMMISSION_RATE || '0.02');

export const MIN_STAKE_AMOUNT = 
  parseFloat(import.meta.env.VITE_MIN_STAKE_AMOUNT || '0.01');

export const MAX_STAKE_AMOUNT = 
  parseFloat(import.meta.env.VITE_MAX_STAKE_AMOUNT || '100');

export const MAX_WIN_MULTIPLIER = 
  parseFloat(import.meta.env.VITE_MAX_WIN_MULTIPLIER || '10');

export const WITHDRAWAL_TIMELOCK = 
  parseInt(import.meta.env.VITE_WITHDRAWAL_TIMELOCK || '0', 10);

// Feature flags
export const ENABLE_LEADERBOARD = true;
export const ENABLE_MARKET_CREATION = false; // Disabled for MVP
export const ENABLE_USER_PROFILES = true;

// UI settings
export const DEFAULT_THEME = 'dark';
export const ANIMATION_DURATION = 200; // ms

// External API settings
export const AIRSTACK_API_KEY = import.meta.env.VITE_AIRSTACK_API_KEY || '';
export const COINGECKO_API_KEY = import.meta.env.VITE_COINGECKO_API_KEY || '';

// Analytics settings
export const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN || '';
export const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || '';

/**
 * Get the Solana Explorer URL for a transaction
 * @param signature Transaction signature
 * @returns URL to view the transaction on Solana Explorer
 */
export const getSolanaExplorerUrl = (signature: string): string => {
  const cluster = SOLANA_NETWORK === WalletAdapterNetwork.MainnetBeta 
    ? 'mainnet-beta' 
    : SOLANA_NETWORK;
  
  return `https://explorer.solana.com/tx/${signature}?cluster=${cluster}`;
};

/**
 * Get the Solana Explorer URL for a wallet address
 * @param address Wallet address
 * @returns URL to view the wallet on Solana Explorer
 */
export const getSolanaExplorerAddressUrl = (address: string): string => {
  const cluster = SOLANA_NETWORK === WalletAdapterNetwork.MainnetBeta 
    ? 'mainnet-beta' 
    : SOLANA_NETWORK;
  
  return `https://explorer.solana.com/address/${address}?cluster=${cluster}`;
};

