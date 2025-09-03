import { MarketModel, BetModel, ResolutionModel } from '../data/models';
import { Market, Bet, ResolutionProof } from '../types';

/**
 * Service for transparent and verifiable bet resolution
 */
export class BetResolutionService {
  /**
   * Resolve a market with a specific outcome
   * @param marketId Market ID to resolve
   * @param outcome The winning outcome
   * @param resolutionSource Source of the outcome data (e.g., API URL, oracle)
   * @param verificationUrl Optional URL where users can verify the outcome
   * @returns The resolved market
   */
  static resolveMarket(
    marketId: string,
    outcome: string,
    resolutionSource: string,
    verificationUrl?: string
  ): Market {
    // Get the market
    const market = MarketModel.getById(marketId);
    if (!market) {
      throw new Error(`Market with ID ${marketId} not found`);
    }

    // Validate the outcome
    if (!market.options.includes(outcome)) {
      throw new Error(`Invalid outcome: ${outcome}. Must be one of: ${market.options.join(', ')}`);
    }

    // Create resolution proof
    const resolutionProofData: Omit<ResolutionProof, 'resolvedAt'> = {
      marketId,
      outcome,
      resolutionSource,
      verificationUrl
    };

    // Store the resolution proof
    ResolutionModel.create(resolutionProofData);

    // Resolve the market (this will also resolve all bets)
    return MarketModel.resolve(marketId, outcome, resolutionSource);
  }

  /**
   * Get resolution proof for a market
   * @param marketId Market ID
   * @returns Resolution proof if available
   */
  static getResolutionProof(marketId: string): ResolutionProof | null {
    return ResolutionModel.getByMarketId(marketId);
  }

  /**
   * Verify if a market has been resolved transparently
   * @param marketId Market ID
   * @returns True if the market has a valid resolution proof
   */
  static hasTransparentResolution(marketId: string): boolean {
    const proof = ResolutionModel.getByMarketId(marketId);
    return proof !== null && !!proof.resolutionSource;
  }

  /**
   * Get all bets for a market
   * @param marketId Market ID
   * @returns Array of bets
   */
  static getBetsForMarket(marketId: string): Bet[] {
    return BetModel.getByMarketId(marketId);
  }

  /**
   * Get winning bets for a market
   * @param marketId Market ID
   * @returns Array of winning bets
   */
  static getWinningBets(marketId: string): Bet[] {
    const market = MarketModel.getById(marketId);
    if (!market || market.status !== 'resolved' || !market.outcome) {
      return [];
    }

    return BetModel.getByMarketId(marketId).filter(
      bet => bet.status === 'won' && bet.outcome === market.outcome
    );
  }

  /**
   * Get total winnings paid for a market
   * @param marketId Market ID
   * @returns Total winnings in SOL
   */
  static getTotalWinningsPaid(marketId: string): number {
    const winningBets = this.getWinningBets(marketId);
    return winningBets.reduce((sum, bet) => sum + (bet.winnings || 0), 0);
  }

  /**
   * Get total commission earned from a market
   * @param marketId Market ID
   * @param commissionRate Commission rate (default: 0.02 = 2%)
   * @returns Total commission in SOL
   */
  static getTotalCommission(marketId: string, commissionRate: number = 0.02): number {
    const market = MarketModel.getById(marketId);
    if (!market) {
      return 0;
    }

    // Commission is calculated on the total staked amount
    return market.totalStaked * commissionRate;
  }

  /**
   * Get resolution statistics for a market
   * @param marketId Market ID
   * @returns Object with resolution statistics
   */
  static getResolutionStats(marketId: string): {
    totalBets: number;
    winningBets: number;
    losingBets: number;
    totalStaked: number;
    totalWinnings: number;
    totalCommission: number;
    resolutionTime?: string;
  } {
    const market = MarketModel.getById(marketId);
    if (!market) {
      throw new Error(`Market with ID ${marketId} not found`);
    }

    const allBets = BetModel.getByMarketId(marketId);
    const winningBets = allBets.filter(bet => bet.status === 'won');
    const losingBets = allBets.filter(bet => bet.status === 'lost');
    
    const totalWinnings = winningBets.reduce((sum, bet) => sum + (bet.winnings || 0), 0);
    const totalCommission = this.getTotalCommission(marketId);

    const resolutionProof = ResolutionModel.getByMarketId(marketId);

    return {
      totalBets: allBets.length,
      winningBets: winningBets.length,
      losingBets: losingBets.length,
      totalStaked: market.totalStaked,
      totalWinnings,
      totalCommission,
      resolutionTime: resolutionProof?.resolvedAt
    };
  }
}
