import React, { useState } from 'react'
import { ArrowRight, X } from 'lucide-react'

export const StakeInput = ({ option, odds, onSubmit, onCancel }) => {
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const stakeAmount = parseFloat(amount)
    
    if (stakeAmount <= 0 || !stakeAmount) return
    
    setLoading(true)
    await onSubmit(stakeAmount)
    setLoading(false)
  }

  const potentialWin = parseFloat(amount) * odds || 0

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="gradient-card rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Place Bet</h3>
          <button
            onClick={onCancel}
            className="p-1 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="mb-4 p-3 bg-white/5 rounded-lg">
          <div className="text-sm text-gray-400">Betting on</div>
          <div className="text-white font-medium">{option}</div>
          <div className="text-sm text-purple-300">{odds}x multiplier</div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm text-gray-300 mb-2">
              Stake Amount (SOL)
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
              placeholder="0.1"
              required
            />
          </div>

          {amount && (
            <div className="mb-4 p-3 bg-white/5 rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Potential Return:</span>
                <span className="text-green-400 font-medium">
                  {potentialWin.toFixed(3)} SOL
                </span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-gray-400">Platform Fee (2%):</span>
                <span className="text-gray-400">
                  {(potentialWin * 0.02).toFixed(3)} SOL
                </span>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 bg-gray-600/50 text-white rounded-lg hover:bg-gray-600/70 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !amount}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Bet <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}