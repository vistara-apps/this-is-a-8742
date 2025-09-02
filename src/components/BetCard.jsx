import React, { useState } from 'react'
import { Clock, Users, TrendingUp, Trophy } from 'lucide-react'
import { StakeInput } from './StakeInput'

export const BetCard = ({ market, onPlaceBet, variant = 'active' }) => {
  const [showStakeInput, setShowStakeInput] = useState(false)
  const [selectedOption, setSelectedOption] = useState(null)

  const handleBetClick = (option) => {
    setSelectedOption(option)
    setShowStakeInput(true)
  }

  const handleStakeSubmit = async (amount) => {
    const success = await onPlaceBet(market.marketId, amount, selectedOption)
    if (success) {
      setShowStakeInput(false)
      setSelectedOption(null)
    }
  }

  const isResolved = variant === 'resolved'
  const timeLeft = new Date(market.endTime) - new Date()
  const daysLeft = Math.max(0, Math.ceil(timeLeft / (1000 * 60 * 60 * 24)))

  return (
    <div className="gradient-card rounded-lg p-6 text-white">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold mb-1">{market.eventDescription}</h3>
          <p className="text-gray-300 text-sm">{market.question}</p>
        </div>
        {isResolved && (
          <div className="flex items-center gap-1 px-2 py-1 bg-green-500/20 rounded-full">
            <Trophy className="w-3 h-3 text-green-400" />
            <span className="text-xs text-green-400">Resolved</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-400" />
          <span className="text-gray-300">
            {isResolved ? 'Ended' : `${daysLeft}d left`}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-400" />
          <span className="text-gray-300">{market.participants} players</span>
        </div>
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-gray-400" />
          <span className="text-gray-300">{market.totalStaked.toFixed(1)} SOL</span>
        </div>
      </div>

      <div className="mb-4">
        <div className="text-xs text-gray-400 mb-2">Current: {market.currentPrice}</div>
        {isResolved && market.outcome && (
          <div className="text-sm text-green-400 font-medium">
            Outcome: {market.outcome}
          </div>
        )}
      </div>

      {!isResolved && (
        <div className="grid grid-cols-2 gap-3">
          {market.options.map((option) => (
            <button
              key={option}
              onClick={() => handleBetClick(option)}
              className="p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-200 group"
            >
              <div className="text-center">
                <div className="font-medium text-white group-hover:text-purple-200">
                  {option}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {market.odds[option]}x
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {showStakeInput && (
        <StakeInput
          option={selectedOption}
          odds={market.odds[selectedOption]}
          onSubmit={handleStakeSubmit}
          onCancel={() => setShowStakeInput(false)}
        />
      )}
    </div>
  )
}