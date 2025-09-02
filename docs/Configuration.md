# Solana BetChain Configuration Guide

This document provides detailed information about configuring the Solana BetChain application for different environments and use cases.

## Table of Contents

1. [Environment Variables](#environment-variables)
2. [Application Configuration](#application-configuration)
3. [UI Theme Configuration](#ui-theme-configuration)
4. [Network Configuration](#network-configuration)
5. [Commission and Fee Settings](#commission-and-fee-settings)
6. [Market Configuration](#market-configuration)
7. [Advanced Configuration](#advanced-configuration)

## Environment Variables

Environment variables can be set in a `.env` file in the root directory or through your hosting provider's environment settings.

### Core Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| VITE_SOLANA_NETWORK | Solana network to use (devnet, testnet, mainnet-beta) | devnet | Yes |
| VITE_RPC_ENDPOINT | URL of the Solana RPC endpoint | https://api.devnet.solana.com | Yes |
| VITE_COMMISSION_RATE | Platform commission rate (e.g., 0.02 for 2%) | 0.02 | No |
| VITE_MIN_STAKE_AMOUNT | Minimum stake amount in SOL | 0.01 | No |
| VITE_MAX_STAKE_AMOUNT | Maximum stake amount in SOL | 100 | No |
| VITE_MAX_WIN_MULTIPLIER | Maximum win multiplier allowed | 10 | No |
| VITE_WITHDRAWAL_TIMELOCK | Timelock for withdrawals in seconds | 0 | No |

### Analytics and Monitoring Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| VITE_SENTRY_DSN | Sentry DSN for error tracking | - | No |
| VITE_GA_MEASUREMENT_ID | Google Analytics measurement ID | - | No |

### External API Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| VITE_AIRSTACK_API_KEY | Airstack API key for blockchain data | - | No |
| VITE_COINGECKO_API_KEY | CoinGecko API key for price data | - | No |

## Application Configuration

The main application configuration is stored in `src/config/index.ts`. This file contains settings that are derived from environment variables or have default values.

```typescript
// src/config/index.ts
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

// Network configuration
export const SOLANA_NETWORK = 
  (import.meta.env.VITE_SOLANA_NETWORK as WalletAdapterNetwork) || 
  WalletAdapterNetwork.Devnet;

export const RPC_ENDPOINT = 
  import.meta.env.VITE_RPC_ENDPOINT || 
  'https://api.devnet.solana.com';

// Platform settings
export const COMMISSION_RATE = 
  parseFloat(import.meta.env.VITE_COMMISSION_RATE || '0.02');

export const MIN_STAKE_AMOUNT = 
  parseFloat(import.meta.env.VITE_MIN_STAKE_AMOUNT || '0.01');

export const MAX_STAKE_AMOUNT = 
  parseFloat(import.meta.env.VITE_MAX_STAKE_AMOUNT || '100');

export const MAX_WIN_MULTIPLIER = 
  parseFloat(import.meta.env.VITE_MAX_WIN_MULTIPLIER || '10');

export const WITHDRAWAL_TIMELOCK = 
  parseInt(import.meta.env.VITE_WITHDRAWAL_TIMELOCK || '0', 10);

// Feature flags
export const ENABLE_LEADERBOARD = true;
export const ENABLE_MARKET_CREATION = false; // Disabled for MVP
export const ENABLE_USER_PROFILES = true;

// UI settings
export const DEFAULT_THEME = 'dark';
export const ANIMATION_DURATION = 200; // ms
```

## UI Theme Configuration

The UI theme is configured in `tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'hsl(210, 99%, 35%)',
        accent: 'hsl(48, 99%, 50%)',
        surface: 'hsl(0, 0%, 100%)',
        bg: 'hsl(210, 36%, 96%)',
      },
      borderRadius: {
        'sm': '6px',
        'md': '10px',
        'lg': '16px',
      },
      spacing: {
        'sm': '8px',
        'md': '12px',
        'lg': '20px',
      },
      boxShadow: {
        'card': '0 4px 12px hsla(0,0%,0%,0.08)',
      }
    },
  },
  plugins: [],
}
```

To customize the theme, modify the values in the `extend` section. The application uses these theme values throughout the UI components.

## Network Configuration

### Solana Network Selection

The application can be configured to use different Solana networks:

- **Devnet**: For development and testing
- **Testnet**: For staging and pre-production testing
- **Mainnet-beta**: For production

To change the network, set the `VITE_SOLANA_NETWORK` environment variable:

```
VITE_SOLANA_NETWORK=mainnet-beta
```

### RPC Endpoint Configuration

For production, it's recommended to use a dedicated RPC provider instead of the public endpoints. Set the `VITE_RPC_ENDPOINT` environment variable to your RPC provider's URL:

```
VITE_RPC_ENDPOINT=https://your-rpc-provider.com/your-endpoint
```

### RPC Provider Recommendations

- **QuickNode**: Offers dedicated Solana RPC nodes with high performance
- **Alchemy**: Provides reliable Solana RPC endpoints with good documentation
- **Helius**: Specialized in Solana with additional features like NFT indexing
- **RunNode**: Cost-effective Solana RPC provider

## Commission and Fee Settings

### Platform Commission

The platform takes a commission on winning bets. This is configured with the `VITE_COMMISSION_RATE` environment variable:

```
VITE_COMMISSION_RATE=0.02  # 2% commission
```

### Stake Limits

To prevent abuse and manage risk, you can set minimum and maximum stake amounts:

```
VITE_MIN_STAKE_AMOUNT=0.01  # Minimum 0.01 SOL
VITE_MAX_STAKE_AMOUNT=100   # Maximum 100 SOL
```

### Win Multiplier Limit

To prevent excessive risk, you can limit the maximum win multiplier:

```
VITE_MAX_WIN_MULTIPLIER=10  # Maximum 10x multiplier
```

### Withdrawal Timelock

For security, you can implement a timelock for withdrawals:

```
VITE_WITHDRAWAL_TIMELOCK=3600  # 1 hour timelock
```

## Market Configuration

Markets are defined in `src/data/markets.js`. For the MVP, this file contains static market definitions. In a production environment, this would be replaced with a database-backed system.

Example market structure:

```javascript
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
}
```

### Market Types

The application supports different types of markets:

1. **Binary Markets**: Yes/No outcomes
2. **Multiple Choice Markets**: Several possible outcomes
3. **Range Markets**: Outcome within a specific range

To add a new market type, extend the `Market` interface in `src/types/index.ts` and update the UI components accordingly.

## Advanced Configuration

### Custom Wallet Adapters

To add support for additional wallets, modify the `SolanaWalletProvider.jsx` file:

```jsx
import { SolletWalletAdapter, LedgerWalletAdapter } from '@solana/wallet-adapter-wallets';

// Add new wallet adapters to the list
const wallets = useMemo(
  () => [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter({ network }),
    new SolletWalletAdapter(),
    new LedgerWalletAdapter(),
  ],
  [network]
);
```

### Custom Resolution Sources

For market resolution, you can configure custom data sources in the `BetResolutionService.ts` file. Add new resolution sources by implementing additional verification methods.

### Database Integration

To replace localStorage with a database, modify the data model implementations in `src/data/models.ts`. The file is structured to make it easy to swap out the storage mechanism while maintaining the same interface.

Example Firebase integration:

```typescript
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

export const UserModel = {
  // Create a new user
  create: async (walletAddress: string): Promise<User> => {
    const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const newUser: User = {
      userId,
      walletAddress,
      totalStaked: 0,
      wins: 0,
      losses: 0,
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
    };

    await addDoc(collection(db, 'users'), newUser);
    return newUser;
  },

  // Get user by wallet address
  getByWalletAddress: async (walletAddress: string): Promise<User | null> => {
    const q = query(collection(db, 'users'), where('walletAddress', '==', walletAddress));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    return querySnapshot.docs[0].data() as User;
  },
  
  // ... other methods
};
```

### Custom Styling

To customize the application's appearance beyond the Tailwind configuration, you can modify the following files:

- `src/index.css`: Global CSS styles
- `src/components/*.jsx`: Component-specific styles

Example of adding a custom gradient:

```css
/* src/index.css */
@layer components {
  .custom-gradient {
    background: linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 100%);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255,255,255,0.1);
  }
}
```

Then use it in your components:

```jsx
<div className="custom-gradient rounded-lg p-6">
  {/* Component content */}
</div>
```

