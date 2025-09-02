import { useState, useEffect, useCallback } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { LAMPORTS_PER_SOL, SystemProgram, Transaction } from '@solana/web3.js'

export const useBetChain = () => {
  const { connection } = useConnection()
  const { publicKey, sendTransaction } = useWallet()
  const [balance, setBalance] = useState(0)
  const [loading, setLoading] = useState(false)
  const [userStats, setUserStats] = useState({
    totalStaked: 0,
    wins: 0,
    losses: 0,
    totalWinnings: 0
  })
  const [userBets, setUserBets] = useState([])

  // Fetch wallet balance
  const fetchBalance = useCallback(async () => {
    if (!publicKey || !connection) return
    
    try {
      const balance = await connection.getBalance(publicKey)
      setBalance(balance / LAMPORTS_PER_SOL)
    } catch (error) {
      console.error('Error fetching balance:', error)
    }
  }, [publicKey, connection])

  // Load user data from localStorage
  const loadUserData = useCallback(() => {
    if (!publicKey) return
    
    const userData = localStorage.getItem(`betchain_${publicKey.toString()}`)
    if (userData) {
      const parsed = JSON.parse(userData)
      setUserStats(parsed.stats || { totalStaked: 0, wins: 0, losses: 0, totalWinnings: 0 })
      setUserBets(parsed.bets || [])
    }
  }, [publicKey])

  // Save user data to localStorage
  const saveUserData = useCallback(() => {
    if (!publicKey) return
    
    const userData = {
      stats: userStats,
      bets: userBets
    }
    localStorage.setItem(`betchain_${publicKey.toString()}`, JSON.stringify(userData))
  }, [publicKey, userStats, userBets])

  // Place a bet
  const placeBet = useCallback(async (marketId, stakeAmount, prediction) => {
    if (!publicKey || !sendTransaction) return false
    
    setLoading(true)
    try {
      // Create a mock transaction (in real implementation, this would interact with a program)
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: publicKey, // Mock - would be program account
          lamports: stakeAmount * LAMPORTS_PER_SOL * 0.02, // 2% commission simulation
        })
      )

      const signature = await sendTransaction(transaction, connection)
      await connection.confirmTransaction(signature)

      // Record the bet
      const newBet = {
        betId: Date.now().toString(),
        marketId,
        stakeAmount,
        prediction,
        status: 'active',
        createdAt: new Date().toISOString(),
        txSignature: signature
      }

      setUserBets(prev => [...prev, newBet])
      setUserStats(prev => ({
        ...prev,
        totalStaked: prev.totalStaked + stakeAmount
      }))

      await fetchBalance()
      setLoading(false)
      return true
    } catch (error) {
      console.error('Error placing bet:', error)
      setLoading(false)
      return false
    }
  }, [publicKey, sendTransaction, connection, fetchBalance])

  // Resolve bet (mock implementation)
  const resolveBet = useCallback((betId, won) => {
    setUserBets(prev => prev.map(bet => {
      if (bet.betId === betId && bet.status === 'active') {
        const updatedBet = {
          ...bet,
          status: won ? 'won' : 'lost',
          resolvedAt: new Date().toISOString(),
          winnings: won ? bet.stakeAmount * 1.8 : 0 // 1.8x multiplier minus 2% commission
        }
        
        if (won) {
          setUserStats(prev => ({
            ...prev,
            wins: prev.wins + 1,
            totalWinnings: prev.totalWinnings + updatedBet.winnings
          }))
        } else {
          setUserStats(prev => ({
            ...prev,
            losses: prev.losses + 1
          }))
        }
        
        return updatedBet
      }
      return bet
    }))
  }, [])

  useEffect(() => {
    fetchBalance()
    loadUserData()
  }, [fetchBalance, loadUserData])

  useEffect(() => {
    saveUserData()
  }, [saveUserData])

  return {
    balance,
    loading,
    userStats,
    userBets,
    placeBet,
    resolveBet,
    fetchBalance
  }
}