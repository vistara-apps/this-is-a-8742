import React, { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletConnector } from './components/WalletConnector';
import { UserDashboard } from './components/UserDashboard';
import { MarketList } from './components/MarketList';
import { Leaderboard } from './components/Leaderboard';
import { ResolutionDetails } from './components/ResolutionDetails';
import { useBetChain } from './hooks/useBetChain';
import { TrendingUp, BarChart3, Trophy, Menu, X, Shield } from 'lucide-react';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider, useToast } from './components/Toast';
import { initializeDatabase } from './data/models';

// Initialize database with sample data
initializeDatabase();

function AppContent() {
  const { connected } = useWallet();
  const { 
    balance, 
    userStats, 
    userBets, 
    markets,
    placeBet, 
    resolveBet,
    resolveMarket,
    getMarketDetails
  } = useBetChain();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedMarketId, setSelectedMarketId] = useState(null);
  const { showToast } = useToast();

  // Mock auto-resolve bets for demo
  useEffect(() => {
    const interval = setInterval(() => {
      const activeBets = userBets.filter(bet => bet.status === 'active');
      if (activeBets.length > 0) {
        const randomBet = activeBets[Math.floor(Math.random() * activeBets.length)];
        const won = Math.random() > 0.4; // 60% win rate for demo
        resolveBet(randomBet.betId, won);
        
        showToast(
          `Your bet on "${randomBet.outcome}" has been ${won ? 'won' : 'lost'}!`,
          won ? 'success' : 'error'
        );
      }
    }, 30000); // Resolve bets every 30 seconds for demo

    return () => clearInterval(interval);
  }, [userBets, resolveBet, showToast]);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'markets', label: 'Markets', icon: TrendingUp },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'transparency', label: 'Transparency', icon: Shield },
  ];

  const handlePlaceBet = async (marketId, stakeAmount, prediction) => {
    const success = await placeBet(marketId, stakeAmount, prediction);
    
    if (success) {
      showToast(
        `Successfully placed bet of ${stakeAmount} SOL on "${prediction}"`,
        'success'
      );
    } else {
      showToast(
        'Failed to place bet. Please try again.',
        'error'
      );
    }
    
    return success;
  };

  const handleViewResolution = (marketId) => {
    setSelectedMarketId(marketId);
    setActiveTab('transparency');
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-sm bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <div>
                <h1 className="text-white text-xl font-bold">Solana BetChain</h1>
                <p className="text-gray-400 text-xs hidden sm:block">
                  Stake Solana, Predict Outcomes, Win Big
                </p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                      activeTab === item.id
                        ? 'bg-white/10 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </button>
                );
              })}
            </nav>

            <div className="flex items-center gap-4">
              <WalletConnector />
              
              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-gray-400 hover:text-white"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-white/10">
              <nav className="space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                        activeTab === item.id
                          ? 'bg-white/10 text-white'
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ErrorBoundary resetOnError={true}>
          {!connected ? (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Welcome to Solana BetChain
              </h2>
              <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
                Connect your Solana wallet to start betting on curated markets with transparent outcomes and fair payouts.
              </p>
              <WalletConnector />
            </div>
          ) : (
            <div>
              {activeTab === 'dashboard' && (
                <div>
                  <h1 className="text-3xl font-bold text-white mb-8">Dashboard</h1>
                  <UserDashboard 
                    balance={balance}
                    userStats={userStats}
                    userBets={userBets}
                  />
                </div>
              )}
              
              {activeTab === 'markets' && (
                <div>
                  <h1 className="text-3xl font-bold text-white mb-8">Betting Markets</h1>
                  <MarketList 
                    markets={markets} 
                    onPlaceBet={handlePlaceBet}
                    onViewResolution={handleViewResolution}
                  />
                </div>
              )}
              
              {activeTab === 'leaderboard' && (
                <div>
                  <h1 className="text-3xl font-bold text-white mb-8">Leaderboard</h1>
                  <Leaderboard />
                </div>
              )}
              
              {activeTab === 'transparency' && (
                <div>
                  <h1 className="text-3xl font-bold text-white mb-8">Transparent Resolution</h1>
                  {selectedMarketId ? (
                    <ResolutionDetails marketId={selectedMarketId} />
                  ) : (
                    <div className="gradient-card rounded-lg p-6">
                      <div className="text-center py-12">
                        <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">
                          Select a Market to View Resolution Details
                        </h3>
                        <p className="text-gray-400 max-w-md mx-auto">
                          All bet resolutions on Solana BetChain are transparent and verifiable.
                          Select a market from the Markets tab to view its resolution details.
                        </p>
                        <button
                          onClick={() => setActiveTab('markets')}
                          className="mt-6 px-4 py-2 bg-white/10 rounded-lg text-white hover:bg-white/20 transition-colors"
                        >
                          View Markets
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </ErrorBoundary>
      </main>
    </div>
  );
}

function App() {
  return (
    <ToastProvider>
      <ErrorBoundary>
        <AppContent />
      </ErrorBoundary>
    </ToastProvider>
  );
}

export default App;

