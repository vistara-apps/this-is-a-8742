import React, { useState, useEffect } from 'react';
import { ExternalLink, Check, AlertTriangle, Info } from 'lucide-react';
import { BetResolutionService } from '../services/BetResolutionService';
import { formatSol } from '../utils/transactions';

/**
 * Component to display transparent bet resolution details
 */
export const ResolutionDetails = ({ marketId }) => {
  const [resolutionProof, setResolutionProof] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!marketId) return;

    try {
      // Get resolution proof and stats
      const proof = BetResolutionService.getResolutionProof(marketId);
      const resolutionStats = BetResolutionService.getResolutionStats(marketId);
      
      setResolutionProof(proof);
      setStats(resolutionStats);
    } catch (error) {
      console.error('Error loading resolution details:', error);
    } finally {
      setLoading(false);
    }
  }, [marketId]);

  if (loading) {
    return (
      <div className="gradient-card rounded-lg p-4 animate-pulse">
        <div className="h-6 bg-white/10 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-white/10 rounded w-full mb-2"></div>
        <div className="h-4 bg-white/10 rounded w-2/3"></div>
      </div>
    );
  }

  if (!resolutionProof) {
    return (
      <div className="gradient-card rounded-lg p-4">
        <div className="flex items-center gap-2 text-yellow-400 mb-2">
          <AlertTriangle className="w-5 h-5" />
          <h3 className="text-lg font-semibold">Resolution Pending</h3>
        </div>
        <p className="text-gray-300 text-sm">
          This market has not been resolved yet. Resolution details will be available once the outcome is determined.
        </p>
      </div>
    );
  }

  return (
    <div className="gradient-card rounded-lg p-6">
      <div className="flex items-center gap-2 text-green-400 mb-4">
        <Check className="w-5 h-5" />
        <h3 className="text-lg font-semibold">Verified Resolution</h3>
      </div>

      <div className="space-y-4">
        <div>
          <div className="text-gray-400 text-sm mb-1">Outcome</div>
          <div className="text-white font-medium">{resolutionProof.outcome}</div>
        </div>

        <div>
          <div className="text-gray-400 text-sm mb-1">Resolution Source</div>
          <div className="text-white">
            {resolutionProof.resolutionSource}
            {resolutionProof.verificationUrl && (
              <a 
                href={resolutionProof.verificationUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-purple-400 ml-2 hover:text-purple-300 transition-colors"
              >
                Verify <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>

        <div>
          <div className="text-gray-400 text-sm mb-1">Resolved At</div>
          <div className="text-white">
            {new Date(resolutionProof.resolvedAt).toLocaleString()}
          </div>
        </div>

        {stats && (
          <>
            <div className="border-t border-white/10 my-4 pt-4">
              <div className="text-white font-medium mb-3">Resolution Statistics</div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-gray-400 text-sm">Total Bets</div>
                  <div className="text-white">{stats.totalBets}</div>
                </div>
                
                <div>
                  <div className="text-gray-400 text-sm">Total Staked</div>
                  <div className="text-white">{formatSol(stats.totalStaked)}</div>
                </div>
                
                <div>
                  <div className="text-gray-400 text-sm">Winning Bets</div>
                  <div className="text-green-400">{stats.winningBets}</div>
                </div>
                
                <div>
                  <div className="text-gray-400 text-sm">Losing Bets</div>
                  <div className="text-red-400">{stats.losingBets}</div>
                </div>
                
                <div>
                  <div className="text-gray-400 text-sm">Total Winnings Paid</div>
                  <div className="text-white">{formatSol(stats.totalWinnings)}</div>
                </div>
                
                <div>
                  <div className="text-gray-400 text-sm">Platform Commission</div>
                  <div className="text-white">{formatSol(stats.totalCommission)}</div>
                </div>
              </div>
            </div>

            <div className="bg-white/5 rounded-lg p-3 text-sm">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-gray-300">
                  All bet resolutions on Solana BetChain are transparent and verifiable. 
                  The outcome is determined based on reliable data sources and recorded on-chain.
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

