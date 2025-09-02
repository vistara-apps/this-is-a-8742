import { useState, useEffect, useCallback } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL, SystemProgram, Transaction } from '@solana/web3.js';
import { 
  UserModel, 
  BetModel, 
  MarketModel, 
  TransactionModel, 
  initializeDatabase 
} from '../data/models';
import { Bet, Market, UserStats, TransactionDetails } from '../types';

/**
 * Custom hook for managing betting functionality
 * Provides methods for placing bets, resolving bets, and managing user data
 */
export const useBetChain = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [userStats, setUserStats] = useState<UserStats>({
    totalStaked: 0,
    wins: 0,
    losses: 0,
    totalWinnings: 0,
    winRate: 0
  });
  const [userBets, setUserBets] = useState<Bet[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);

  // Initialize database with sample data
  useEffect(() => {
    initializeDatabase();
  }, []);

  // Fetch wallet balance
  const fetchBalance = useCallback(async () => {
    if (!publicKey || !connection) return;
    
    try {
      const balance = await connection.getBalance(publicKey);
      setBalance(balance / LAMPORTS_PER_SOL);
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  }, [publicKey, connection]);

  // Load user data
  const loadUserData = useCallback(() => {
    if (!publicKey) return;
    
    // Get or create user
    let user = UserModel.getByWalletAddress(publicKey.toString());
    if (!user) {
      user = UserModel.create(publicKey.toString());
    }

    // Update user's last active timestamp
    UserModel.update({
      ...user,
      lastActive: new Date().toISOString()
    });

    // Get user stats and bets
    const stats = UserModel.getStats(user.userId);
    const bets = BetModel.getByUserId(user.userId);
    
    setUserStats(stats);
    setUserBets(bets);
    
    // Load markets
    const allMarkets = MarketModel.getAll();
    setMarkets(allMarkets);
  }, [publicKey]);

  // Place a bet
  const placeBet = useCallback(async (marketId: string, stakeAmount: number, prediction: string): Promise<boolean> => {
    if (!publicKey || !sendTransaction || !connection) return false;
    
    setLoading(true);
    try {
      // Get user
      let user = UserModel.getByWalletAddress(publicKey.toString());
      if (!user) {
        user = UserModel.create(publicKey.toString());
      }

      // Get market
      const market = MarketModel.getById(marketId);
      if (!market) {
        throw new Error(`Market with ID ${marketId} not found`);
      }

      // Create a transaction (in real implementation, this would interact with a program)
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: publicKey, // Mock - would be program account
          lamports: stakeAmount * LAMPORTS_PER_SOL * 0.02, // 2% commission simulation
        })
      );

      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature);

      // Record the transaction
      TransactionModel.create({
        signature,
        amount: stakeAmount,
        sender: publicKey.toString(),
        recipient: 'platform', // Mock - would be program account
        status: 'confirmed',
        type: 'stake',
      });

      // Record the bet
      const newBet = BetModel.create({
        userId: user.userId,
        marketId,
        stakeAmount,
        outcome: prediction,
        status: 'active',
        txSignature: signature,
      });

      // Refresh user data
      loadUserData();
      await fetchBalance();
      
      setLoading(false);
      return true;
    } catch (error) {
      console.error('Error placing bet:', error);
      setLoading(false);
      return false;
    }
  }, [publicKey, sendTransaction, connection, fetchBalance, loadUserData]);

  // Resolve bet
  const resolveBet = useCallback((betId: string, won: boolean): void => {
    try {
      const bet = BetModel.getById(betId);
      if (!bet) {
        throw new Error(`Bet with ID ${betId} not found`);
      }

      // Calculate winnings based on market odds
      const market = MarketModel.getById(bet.marketId);
      if (!market) {
        throw new Error(`Market with ID ${bet.marketId} not found`);
      }

      const odds = market.odds[bet.outcome] || 1.8;
      const winnings = won ? bet.stakeAmount * odds : 0;

      // Resolve the bet
      BetModel.resolve(betId, won, winnings);

      // Refresh user data
      loadUserData();
    } catch (error) {
      console.error('Error resolving bet:', error);
    }
  }, [loadUserData]);

  // Resolve market
  const resolveMarket = useCallback((marketId: string, outcome: string, resolutionSource: string): void => {
    try {
      MarketModel.resolve(marketId, outcome, resolutionSource);
      
      // Refresh markets and user data
      loadUserData();
    } catch (error) {
      console.error('Error resolving market:', error);
    }
  }, [loadUserData]);

  // Get market details
  const getMarketDetails = useCallback((marketId: string): Market | null => {
    return MarketModel.getById(marketId);
  }, []);

  // Get all markets
  const getAllMarkets = useCallback((): Market[] => {
    return MarketModel.getAll();
  }, []);

  // Get active markets
  const getActiveMarkets = useCallback((): Market[] => {
    return MarketModel.getActive();
  }, []);

  // Initialize data
  useEffect(() => {
    fetchBalance();
    loadUserData();
  }, [fetchBalance, loadUserData]);

  return {
    balance,
    loading,
    userStats,
    userBets,
    markets,
    placeBet,
    resolveBet,
    resolveMarket,
    fetchBalance,
    getMarketDetails,
    getAllMarkets,
    getActiveMarkets,
  };
};

