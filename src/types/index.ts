/**
 * Data models for Solana BetChain application
 * Based on the PRD specifications
 */

import { PublicKey } from '@solana/web3.js';

/**
 * User entity representing a bettor on the platform
 */
export interface User {
  userId: string;
  walletAddress: string;
  totalStaked: number;
  wins: number;
  losses: number;
  createdAt: string;
  lastActive: string;
}

/**
 * Bet entity representing a user's stake on a specific market outcome
 */
export interface Bet {
  betId: string;
  userId: string;
  marketId: string;
  stakeAmount: number;
  outcome: string;
  status: 'active' | 'won' | 'lost' | 'cancelled';
  createdAt: string;
  resolvedAt?: string;
  winnings?: number;
  txSignature?: string;
}

/**
 * Market entity representing a betting event
 */
export interface Market {
  marketId: string;
  eventDescription: string;
  question: string;
  options: string[];
  currentPrice?: string;
  outcome?: string;
  status: 'upcoming' | 'active' | 'resolved' | 'cancelled';
  startTime: string;
  endTime: string;
  totalStaked: number;
  participants: number;
  odds: Record<string, number>;
  resolutionSource?: string;
  createdBy?: string;
}

/**
 * User statistics derived from betting activity
 */
export interface UserStats {
  totalStaked: number;
  wins: number;
  losses: number;
  totalWinnings: number;
  winRate?: number;
  rank?: number;
}

/**
 * Transaction details for Solana transfers
 */
export interface TransactionDetails {
  signature: string;
  amount: number;
  sender: string;
  recipient: string;
  timestamp: string;
  status: 'pending' | 'confirmed' | 'failed';
  type: 'stake' | 'withdrawal' | 'commission';
  betId?: string;
}

/**
 * Resolution proof for transparent bet outcomes
 */
export interface ResolutionProof {
  marketId: string;
  outcome: string;
  resolvedAt: string;
  resolutionSource: string;
  verificationUrl?: string;
  resolverSignature?: string;
  transactionHash?: string;
}

/**
 * Platform settings including commission rates
 */
export interface PlatformSettings {
  commissionRate: number;
  minStakeAmount: number;
  maxStakeAmount: number;
  maxWinMultiplier: number;
  withdrawalTimelock: number;
}

