export const markets = [
  {
    marketId: '1',
    eventDescription: 'SOL Price Prediction',
    question: 'Will SOL be above $100 by end of week?',
    options: ['Yes', 'No'],
    currentPrice: '$85.40',
    status: 'active',
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    totalStaked: 245.7,
    participants: 89,
    odds: { Yes: 1.8, No: 2.1 }
  },
  {
    marketId: '2',
    eventDescription: 'Bitcoin Halving Impact',
    question: 'Will BTC reach new ATH within 30 days of halving?',
    options: ['Yes', 'No'],
    currentPrice: '$67,890',
    status: 'active',
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    totalStaked: 189.3,
    participants: 56,
    odds: { Yes: 2.2, No: 1.7 }
  },
  {
    marketId: '3',
    eventDescription: 'ETH Gas Fees',
    question: 'Will average ETH gas fees drop below 20 gwei this month?',
    options: ['Yes', 'No'],
    currentPrice: '32 gwei',
    status: 'active',
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
    totalStaked: 156.8,
    participants: 67,
    odds: { Yes: 2.5, No: 1.5 }
  },
  {
    marketId: '4',
    eventDescription: 'NFT Market Recovery',
    question: 'Will OpenSea volume exceed 10k ETH this week?',
    options: ['Yes', 'No'],
    currentPrice: '4.2k ETH',
    status: 'resolved',
    outcome: 'No',
    startTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date().toISOString(),
    totalStaked: 98.4,
    participants: 34,
    odds: { Yes: 3.1, No: 1.3 }
  }
]