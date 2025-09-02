import React from 'react'
import { Wallet, TrendingUp, Trophy, Target } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, BarChart, Bar } from 'recharts'

export const UserDashboard = ({ balance, userStats, userBets }) => {
  // Mock chart data
  const performanceData = [
    { name: 'Jan', value: 0 },
    { name: 'Feb', value: 12 },
    { name: 'Mar', value: 8 },
    { name: 'Apr', value: 25 },
    { name: 'May', value: 18 },
    { name: 'Jun', value: userStats.totalWinnings }
  ]

  const betsData = [
    { name: 'Won', value: userStats.wins },
    { name: 'Lost', value: userStats.losses },
    { name: 'Active', value: userBets.filter(b => b.status === 'active').length }
  ]

  const winRate = userStats.wins + userStats.losses > 0 
    ? ((userStats.wins / (userStats.wins + userStats.losses)) * 100).toFixed(1)
    : 0

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="gradient-card rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Wallet className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <div className="text-gray-400 text-sm">Balance</div>
              <div className="text-white text-lg font-semibold">
                {balance.toFixed(3)} SOL
              </div>
            </div>
          </div>
        </div>

        <div className="gradient-card rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <div className="text-gray-400 text-sm">Total Winnings</div>
              <div className="text-white text-lg font-semibold">
                {userStats.totalWinnings.toFixed(2)} SOL
              </div>
            </div>
          </div>
        </div>

        <div className="gradient-card rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Trophy className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="text-gray-400 text-sm">Win Rate</div>
              <div className="text-white text-lg font-semibold">{winRate}%</div>
            </div>
          </div>
        </div>

        <div className="gradient-card rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <Target className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <div className="text-gray-400 text-sm">Total Staked</div>
              <div className="text-white text-lg font-semibold">
                {userStats.totalStaked.toFixed(2)} SOL
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="gradient-card rounded-lg p-6">
          <h3 className="text-white text-lg font-semibold mb-4">Performance</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#8B5CF6"
                  fillOpacity={1}
                  fill="url(#colorValue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="gradient-card rounded-lg p-6">
          <h3 className="text-white text-lg font-semibold mb-4">Bet Summary</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={betsData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                <Bar dataKey="value" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Bets */}
      {userBets.length > 0 && (
        <div className="gradient-card rounded-lg p-6">
          <h3 className="text-white text-lg font-semibold mb-4">Recent Bets</h3>
          <div className="space-y-3">
            {userBets.slice(-5).reverse().map((bet) => (
              <div key={bet.betId} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div>
                  <div className="text-white font-medium">{bet.prediction}</div>
                  <div className="text-gray-400 text-sm">
                    Staked: {bet.stakeAmount} SOL
                  </div>
                </div>
                <div className="text-right">
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    bet.status === 'won' ? 'bg-green-500/20 text-green-400' :
                    bet.status === 'lost' ? 'bg-red-500/20 text-red-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {bet.status}
                  </div>
                  {bet.winnings && (
                    <div className="text-green-400 text-sm mt-1">
                      +{bet.winnings.toFixed(3)} SOL
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}