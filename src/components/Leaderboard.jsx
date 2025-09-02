import React, { useState, useEffect } from 'react';
import { Trophy, Users, TrendingUp, Search, ArrowUp, ArrowDown } from 'lucide-react';
import { formatSol, formatAddress } from '../utils/transactions';
import { UserModel } from '../data/models';
import { getSolanaExplorerAddressUrl } from '../config';

/**
 * Leaderboard component to display top users
 */
export const Leaderboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('totalWinnings');
  const [sortDirection, setSortDirection] = useState('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFrame, setTimeFrame] = useState('all'); // 'all', 'week', 'month'

  // Load leaderboard data
  useEffect(() => {
    const loadLeaderboard = async () => {
      setLoading(true);
      try {
        // Get all users
        const allUsers = UserModel.getAll();
        
        // Calculate stats for each user
        const usersWithStats = allUsers.map(user => {
          const stats = UserModel.getStats(user.userId);
          return {
            ...user,
            ...stats,
            winRate: stats.wins + stats.losses > 0 
              ? (stats.wins / (stats.wins + stats.losses)) * 100 
              : 0
          };
        });
        
        // Filter out users with no activity
        const activeUsers = usersWithStats.filter(user => 
          user.totalStaked > 0 || user.wins > 0 || user.losses > 0
        );
        
        setUsers(activeUsers);
      } catch (error) {
        console.error('Error loading leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadLeaderboard();
  }, []);

  // Handle sort change
  const handleSortChange = (field) => {
    if (sortBy === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to descending
      setSortBy(field);
      setSortDirection('desc');
    }
  };

  // Filter and sort users
  const filteredAndSortedUsers = users
    // Filter by search query
    .filter(user => {
      if (!searchQuery) return true;
      return user.walletAddress.toLowerCase().includes(searchQuery.toLowerCase());
    })
    // Sort by selected field
    .sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'walletAddress') {
        comparison = a.walletAddress.localeCompare(b.walletAddress);
      } else {
        comparison = a[sortBy] - b[sortBy];
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });

  // Render loading state
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Leaderboard</h2>
        </div>
        
        <div className="gradient-card rounded-lg p-6 animate-pulse">
          <div className="h-8 bg-white/10 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-10 w-10 bg-white/10 rounded-full"></div>
                <div className="h-6 bg-white/10 rounded w-1/3"></div>
                <div className="h-6 bg-white/10 rounded w-1/4 ml-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Render empty state
  if (filteredAndSortedUsers.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Leaderboard</h2>
          
          <div className="relative">
            <input
              type="text"
              placeholder="Search by wallet"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 pr-10"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        </div>
        
        <div className="gradient-card rounded-lg p-6 text-center">
          <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            No users found
          </h3>
          <p className="text-gray-400">
            {searchQuery 
              ? 'No users match your search criteria. Try a different search.'
              : 'Be the first to place a bet and appear on the leaderboard!'}
          </p>
        </div>
      </div>
    );
  }

  // Render leaderboard
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-2xl font-bold text-white">Leaderboard</h2>
        
        <div className="flex items-center gap-4">
          {/* Time frame selector */}
          <div className="flex rounded-lg overflow-hidden">
            <button
              onClick={() => setTimeFrame('all')}
              className={`px-3 py-1.5 text-sm ${
                timeFrame === 'all' 
                  ? 'bg-purple-500 text-white' 
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => setTimeFrame('month')}
              className={`px-3 py-1.5 text-sm ${
                timeFrame === 'month' 
                  ? 'bg-purple-500 text-white' 
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setTimeFrame('week')}
              className={`px-3 py-1.5 text-sm ${
                timeFrame === 'week' 
                  ? 'bg-purple-500 text-white' 
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              Week
            </button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search by wallet"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 pr-10"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        </div>
      </div>
      
      <div className="gradient-card rounded-lg overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-5 gap-4 p-4 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-1">
            <span className="text-gray-300 font-medium">Rank</span>
          </div>
          
          <div 
            className="flex items-center gap-1 cursor-pointer"
            onClick={() => handleSortChange('walletAddress')}
          >
            <span className="text-gray-300 font-medium">Wallet</span>
            {sortBy === 'walletAddress' && (
              sortDirection === 'asc' ? 
                <ArrowUp className="w-4 h-4 text-purple-400" /> : 
                <ArrowDown className="w-4 h-4 text-purple-400" />
            )}
          </div>
          
          <div 
            className="flex items-center gap-1 cursor-pointer"
            onClick={() => handleSortChange('totalWinnings')}
          >
            <span className="text-gray-300 font-medium">Winnings</span>
            {sortBy === 'totalWinnings' && (
              sortDirection === 'asc' ? 
                <ArrowUp className="w-4 h-4 text-purple-400" /> : 
                <ArrowDown className="w-4 h-4 text-purple-400" />
            )}
          </div>
          
          <div 
            className="flex items-center gap-1 cursor-pointer"
            onClick={() => handleSortChange('winRate')}
          >
            <span className="text-gray-300 font-medium">Win Rate</span>
            {sortBy === 'winRate' && (
              sortDirection === 'asc' ? 
                <ArrowUp className="w-4 h-4 text-purple-400" /> : 
                <ArrowDown className="w-4 h-4 text-purple-400" />
            )}
          </div>
          
          <div 
            className="flex items-center gap-1 cursor-pointer"
            onClick={() => handleSortChange('totalStaked')}
          >
            <span className="text-gray-300 font-medium">Total Staked</span>
            {sortBy === 'totalStaked' && (
              sortDirection === 'asc' ? 
                <ArrowUp className="w-4 h-4 text-purple-400" /> : 
                <ArrowDown className="w-4 h-4 text-purple-400" />
            )}
          </div>
        </div>
        
        {/* Table body */}
        <div className="divide-y divide-white/10">
          {filteredAndSortedUsers.map((user, index) => (
            <div key={user.userId} className="grid grid-cols-5 gap-4 p-4 hover:bg-white/5">
              <div className="flex items-center">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                  index === 1 ? 'bg-gray-400/20 text-gray-300' :
                  index === 2 ? 'bg-amber-600/20 text-amber-500' :
                  'bg-white/10 text-gray-400'
                }`}>
                  {index + 1}
                </div>
              </div>
              
              <div className="flex items-center">
                <a 
                  href={getSolanaExplorerAddressUrl(user.walletAddress)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-purple-300 transition-colors"
                >
                  {formatAddress(user.walletAddress, 4, 4)}
                </a>
              </div>
              
              <div className="text-green-400 font-medium">
                {formatSol(user.totalWinnings)}
              </div>
              
              <div className="text-white">
                {user.winRate.toFixed(1)}%
              </div>
              
              <div className="text-white">
                {formatSol(user.totalStaked)}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Stats summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="gradient-card rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Users className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <div className="text-gray-400 text-sm">Total Players</div>
              <div className="text-white text-lg font-semibold">
                {users.length}
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
              <div className="text-gray-400 text-sm">Total Winnings Paid</div>
              <div className="text-white text-lg font-semibold">
                {formatSol(users.reduce((sum, user) => sum + user.totalWinnings, 0))}
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
              <div className="text-gray-400 text-sm">Average Win Rate</div>
              <div className="text-white text-lg font-semibold">
                {users.length > 0 
                  ? (users.reduce((sum, user) => sum + user.winRate, 0) / users.length).toFixed(1)
                  : '0.0'}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

