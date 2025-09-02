import React from 'react'
import { BetCard } from './BetCard'

export const MarketList = ({ markets, onPlaceBet }) => {
  const activeMarkets = markets.filter(m => m.status === 'active')
  const resolvedMarkets = markets.filter(m => m.status === 'resolved')

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-6">Active Markets</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activeMarkets.map((market) => (
            <BetCard
              key={market.marketId}
              market={market}
              onPlaceBet={onPlaceBet}
              variant="active"
            />
          ))}
        </div>
      </div>

      {resolvedMarkets.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Recent Results</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {resolvedMarkets.slice(0, 4).map((market) => (
              <BetCard
                key={market.marketId}
                market={market}
                onPlaceBet={onPlaceBet}
                variant="resolved"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}