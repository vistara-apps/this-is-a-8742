/**
 * Data model implementations for Solana BetChain
 * 
 * This file contains the implementation of data persistence for the application.
 * For the MVP, we're using localStorage, but in a production environment,
 * this would be replaced with a proper database solution.
 */

import { User, Bet, Market, UserStats, TransactionDetails, ResolutionProof } from '../types';
import { PublicKey } from '@solana/web3.js';

// Storage keys
const USERS_STORAGE_KEY = 'betchain_users';
const BETS_STORAGE_KEY = 'betchain_bets';
const MARKETS_STORAGE_KEY = 'betchain_markets';
const TRANSACTIONS_STORAGE_KEY = 'betchain_transactions';
const RESOLUTIONS_STORAGE_KEY = 'betchain_resolutions';

/**
 * User Model
 */
export const UserModel = {
  // Create a new user
  create: (walletAddress: string): User => {
    const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const newUser: User = {
      userId,
      walletAddress,
      totalStaked: 0,
      wins: 0,
      losses: 0,
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
    };

    const users = UserModel.getAll();
    users.push(newUser);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    
    return newUser;
  },

  // Get user by wallet address
  getByWalletAddress: (walletAddress: string): User | null => {
    const users = UserModel.getAll();
    return users.find(user => user.walletAddress === walletAddress) || null;
  },

  // Get user by ID
  getById: (userId: string): User | null => {
    const users = UserModel.getAll();
    return users.find(user => user.userId === userId) || null;
  },

  // Get all users
  getAll: (): User[] => {
    const usersJson = localStorage.getItem(USERS_STORAGE_KEY);
    return usersJson ? JSON.parse(usersJson) : [];
  },

  // Update user
  update: (user: User): User => {
    const users = UserModel.getAll();
    const index = users.findIndex(u => u.userId === user.userId);
    
    if (index !== -1) {
      users[index] = {
        ...users[index],
        ...user,
        lastActive: new Date().toISOString(),
      };
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
      return users[index];
    }
    
    throw new Error(`User with ID ${user.userId} not found`);
  },

  // Get user stats
  getStats: (userId: string): UserStats => {
    const user = UserModel.getById(userId);
    if (!user) {
      return {
        totalStaked: 0,
        wins: 0,
        losses: 0,
        totalWinnings: 0,
        winRate: 0,
      };
    }

    const bets = BetModel.getByUserId(userId);
    const totalWinnings = bets
      .filter(bet => bet.status === 'won')
      .reduce((sum, bet) => sum + (bet.winnings || 0), 0);
    
    const winRate = user.wins + user.losses > 0 
      ? (user.wins / (user.wins + user.losses)) * 100 
      : 0;

    return {
      totalStaked: user.totalStaked,
      wins: user.wins,
      losses: user.losses,
      totalWinnings,
      winRate,
    };
  },
};

/**
 * Bet Model
 */
export const BetModel = {
  // Create a new bet
  create: (bet: Omit<Bet, 'betId' | 'createdAt'>): Bet => {
    const betId = `bet_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const newBet: Bet = {
      ...bet,
      betId,
      createdAt: new Date().toISOString(),
      status: 'active',
    };

    const bets = BetModel.getAll();
    bets.push(newBet);
    localStorage.setItem(BETS_STORAGE_KEY, JSON.stringify(bets));

    // Update user's total staked amount
    const user = UserModel.getById(bet.userId);
    if (user) {
      UserModel.update({
        ...user,
        totalStaked: user.totalStaked + bet.stakeAmount,
      });
    }

    // Update market's total staked amount and participants
    const market = MarketModel.getById(bet.marketId);
    if (market) {
      const userBetsOnMarket = BetModel.getAll().filter(
        b => b.marketId === bet.marketId && b.userId === bet.userId
      );
      
      const isNewParticipant = userBetsOnMarket.length === 1;
      
      MarketModel.update({
        ...market,
        totalStaked: market.totalStaked + bet.stakeAmount,
        participants: isNewParticipant 
          ? market.participants + 1 
          : market.participants,
      });
    }
    
    return newBet;
  },

  // Get bet by ID
  getById: (betId: string): Bet | null => {
    const bets = BetModel.getAll();
    return bets.find(bet => bet.betId === betId) || null;
  },

  // Get all bets
  getAll: (): Bet[] => {
    const betsJson = localStorage.getItem(BETS_STORAGE_KEY);
    return betsJson ? JSON.parse(betsJson) : [];
  },

  // Get bets by user ID
  getByUserId: (userId: string): Bet[] => {
    const bets = BetModel.getAll();
    return bets.filter(bet => bet.userId === userId);
  },

  // Get bets by market ID
  getByMarketId: (marketId: string): Bet[] => {
    const bets = BetModel.getAll();
    return bets.filter(bet => bet.marketId === marketId);
  },

  // Update bet
  update: (bet: Bet): Bet => {
    const bets = BetModel.getAll();
    const index = bets.findIndex(b => b.betId === bet.betId);
    
    if (index !== -1) {
      bets[index] = bet;
      localStorage.setItem(BETS_STORAGE_KEY, JSON.stringify(bets));
      return bets[index];
    }
    
    throw new Error(`Bet with ID ${bet.betId} not found`);
  },

  // Resolve bet
  resolve: (betId: string, won: boolean, winnings?: number): Bet => {
    const bet = BetModel.getById(betId);
    if (!bet) {
      throw new Error(`Bet with ID ${betId} not found`);
    }

    if (bet.status !== 'active') {
      throw new Error(`Bet with ID ${betId} is already resolved`);
    }

    const updatedBet: Bet = {
      ...bet,
      status: won ? 'won' : 'lost',
      resolvedAt: new Date().toISOString(),
      winnings: won ? (winnings || bet.stakeAmount * 1.8) : 0,
    };

    // Update user stats
    const user = UserModel.getById(bet.userId);
    if (user) {
      UserModel.update({
        ...user,
        wins: won ? user.wins + 1 : user.wins,
        losses: won ? user.losses : user.losses + 1,
      });
    }

    return BetModel.update(updatedBet);
  },
};

/**
 * Market Model
 */
export const MarketModel = {
  // Create a new market
  create: (market: Omit<Market, 'marketId'>): Market => {
    const marketId = `market_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const newMarket: Market = {
      ...market,
      marketId,
      totalStaked: 0,
      participants: 0,
    };

    const markets = MarketModel.getAll();
    markets.push(newMarket);
    localStorage.setItem(MARKETS_STORAGE_KEY, JSON.stringify(markets));
    
    return newMarket;
  },

  // Get market by ID
  getById: (marketId: string): Market | null => {
    const markets = MarketModel.getAll();
    return markets.find(market => market.marketId === marketId) || null;
  },

  // Get all markets
  getAll: (): Market[] => {
    const marketsJson = localStorage.getItem(MARKETS_STORAGE_KEY);
    return marketsJson ? JSON.parse(marketsJson) : [];
  },

  // Get active markets
  getActive: (): Market[] => {
    const markets = MarketModel.getAll();
    return markets.filter(market => market.status === 'active');
  },

  // Update market
  update: (market: Market): Market => {
    const markets = MarketModel.getAll();
    const index = markets.findIndex(m => m.marketId === market.marketId);
    
    if (index !== -1) {
      markets[index] = market;
      localStorage.setItem(MARKETS_STORAGE_KEY, JSON.stringify(markets));
      return markets[index];
    }
    
    throw new Error(`Market with ID ${market.marketId} not found`);
  },

  // Resolve market
  resolve: (marketId: string, outcome: string, resolutionSource: string): Market => {
    const market = MarketModel.getById(marketId);
    if (!market) {
      throw new Error(`Market with ID ${marketId} not found`);
    }

    if (market.status !== 'active') {
      throw new Error(`Market with ID ${marketId} is not active`);
    }

    const updatedMarket: Market = {
      ...market,
      status: 'resolved',
      outcome,
      resolutionSource,
    };

    // Create resolution proof
    ResolutionModel.create({
      marketId,
      outcome,
      resolvedAt: new Date().toISOString(),
      resolutionSource,
    });

    // Resolve all bets for this market
    const bets = BetModel.getByMarketId(marketId);
    bets.forEach(bet => {
      if (bet.status === 'active') {
        const won = bet.outcome === outcome;
        const winnings = won ? bet.stakeAmount * market.odds[bet.outcome] : 0;
        BetModel.resolve(bet.betId, won, winnings);
      }
    });

    return MarketModel.update(updatedMarket);
  },
};

/**
 * Transaction Model
 */
export const TransactionModel = {
  // Create a new transaction
  create: (transaction: Omit<TransactionDetails, 'timestamp'>): TransactionDetails => {
    const newTransaction: TransactionDetails = {
      ...transaction,
      timestamp: new Date().toISOString(),
    };

    const transactions = TransactionModel.getAll();
    transactions.push(newTransaction);
    localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(transactions));
    
    return newTransaction;
  },

  // Get all transactions
  getAll: (): TransactionDetails[] => {
    const transactionsJson = localStorage.getItem(TRANSACTIONS_STORAGE_KEY);
    return transactionsJson ? JSON.parse(transactionsJson) : [];
  },

  // Get transactions by wallet address
  getByWalletAddress: (walletAddress: string): TransactionDetails[] => {
    const transactions = TransactionModel.getAll();
    return transactions.filter(
      tx => tx.sender === walletAddress || tx.recipient === walletAddress
    );
  },

  // Get transactions by bet ID
  getByBetId: (betId: string): TransactionDetails[] => {
    const transactions = TransactionModel.getAll();
    return transactions.filter(tx => tx.betId === betId);
  },
};

/**
 * Resolution Model for transparent bet outcomes
 */
export const ResolutionModel = {
  // Create a new resolution proof
  create: (resolution: Omit<ResolutionProof, 'resolvedAt'>): ResolutionProof => {
    const newResolution: ResolutionProof = {
      ...resolution,
      resolvedAt: new Date().toISOString(),
    };

    const resolutions = ResolutionModel.getAll();
    resolutions.push(newResolution);
    localStorage.setItem(RESOLUTIONS_STORAGE_KEY, JSON.stringify(resolutions));
    
    return newResolution;
  },

  // Get all resolutions
  getAll: (): ResolutionProof[] => {
    const resolutionsJson = localStorage.getItem(RESOLUTIONS_STORAGE_KEY);
    return resolutionsJson ? JSON.parse(resolutionsJson) : [];
  },

  // Get resolution by market ID
  getByMarketId: (marketId: string): ResolutionProof | null => {
    const resolutions = ResolutionModel.getAll();
    return resolutions.find(resolution => resolution.marketId === marketId) || null;
  },
};

/**
 * Initialize the database with sample data if empty
 */
export const initializeDatabase = () => {
  // Only initialize if no markets exist
  if (MarketModel.getAll().length === 0) {
    // Import sample markets from markets.js
    import('./markets').then(({ markets }) => {
      markets.forEach((market: any) => {
        MarketModel.create(market);
      });
      console.log('Database initialized with sample markets');
    });
  }
};

