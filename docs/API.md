# Solana BetChain API Documentation

This document provides comprehensive documentation for the APIs used in the Solana BetChain application.

## Table of Contents

1. [Introduction](#introduction)
2. [Solana JSON RPC API](#solana-json-rpc-api)
3. [WalletConnect Integration](#walletconnect-integration)
4. [Airstack API (Optional)](#airstack-api-optional)
5. [Internal API Endpoints](#internal-api-endpoints)
6. [Error Handling](#error-handling)
7. [Rate Limiting](#rate-limiting)
8. [Security Considerations](#security-considerations)

## Introduction

Solana BetChain is a web application that enables users to place bets using Solana on curated events with transparent outcome resolution. The application interacts with the Solana blockchain for all transactions and uses various APIs for wallet connectivity and data retrieval.

## Solana JSON RPC API

### Overview

The Solana JSON RPC API is used for all on-chain interactions, including staking Solana and managing user funds.

### Base URL

```
https://api.devnet.solana.com
```

For production, consider using a dedicated RPC provider like QuickNode or Alchemy.

### Authentication

No authentication is required for public endpoints, but rate limits apply. For production, use an RPC provider API key.

### Key Endpoints

#### Get Account Info

```
POST /
```

Request:
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "getAccountInfo",
  "params": [
    "wallet_address",
    {
      "encoding": "jsonParsed"
    }
  ]
}
```

Response:
```json
{
  "jsonrpc": "2.0",
  "result": {
    "context": {
      "slot": 123456789
    },
    "value": {
      "data": [...],
      "executable": false,
      "lamports": 1000000000,
      "owner": "11111111111111111111111111111111",
      "rentEpoch": 123
    }
  },
  "id": 1
}
```

#### Get Balance

```
POST /
```

Request:
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "getBalance",
  "params": [
    "wallet_address"
  ]
}
```

Response:
```json
{
  "jsonrpc": "2.0",
  "result": {
    "context": {
      "slot": 123456789
    },
    "value": 1000000000
  },
  "id": 1
}
```

#### Send Transaction

```
POST /
```

Request:
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "sendTransaction",
  "params": [
    "encoded_transaction",
    {
      "skipPreflight": false,
      "preflightCommitment": "confirmed"
    }
  ]
}
```

Response:
```json
{
  "jsonrpc": "2.0",
  "result": "transaction_signature",
  "id": 1
}
```

#### Get Transaction

```
POST /
```

Request:
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "getTransaction",
  "params": [
    "transaction_signature",
    {
      "encoding": "jsonParsed",
      "maxSupportedTransactionVersion": 0
    }
  ]
}
```

Response:
```json
{
  "jsonrpc": "2.0",
  "result": {
    "meta": {...},
    "slot": 123456789,
    "transaction": {...},
    "blockTime": 1234567890
  },
  "id": 1
}
```

### Error Codes

| Code | Description |
|------|-------------|
| -32700 | Parse error |
| -32600 | Invalid request |
| -32601 | Method not found |
| -32602 | Invalid params |
| -32603 | Internal error |
| -32000 to -32099 | Server error |

### Implementation Example

```javascript
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';

const connection = new Connection('https://api.devnet.solana.com');
const publicKey = new PublicKey('wallet_address');

// Get balance
const balance = await connection.getBalance(publicKey);
console.log(`Balance: ${balance / LAMPORTS_PER_SOL} SOL`);
```

## WalletConnect Integration

### Overview

WalletConnect is used to securely connect user's external Solana wallets (e.g., Phantom, Solflare) to the dApp for transaction signing and authentication.

### Integration Method

Solana BetChain uses the Solana Wallet Adapter library, which provides a unified interface for connecting to various Solana wallets.

### Key Components

#### WalletProvider

```jsx
import { WalletProvider } from '@solana/wallet-adapter-react';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';

const wallets = [
  new PhantomWalletAdapter(),
  new SolflareWalletAdapter(),
];

<WalletProvider wallets={wallets} autoConnect>
  {children}
</WalletProvider>
```

#### WalletConnect Button

```jsx
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

<WalletMultiButton />
```

#### Wallet Hooks

```jsx
import { useWallet } from '@solana/wallet-adapter-react';

const { publicKey, connected, sendTransaction } = useWallet();
```

### Implementation Example

```jsx
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export const WalletConnector = () => {
  const { connected, publicKey } = useWallet();

  return (
    <div>
      {connected && publicKey && (
        <div>
          Connected: {publicKey.toString().slice(0, 4)}...{publicKey.toString().slice(-4)}
        </div>
      )}
      <WalletMultiButton />
    </div>
  );
};
```

## Airstack API (Optional)

### Overview

Airstack can provide aggregated blockchain data, potentially simplifying the display of market information or user's past betting activity.

### Base URL

```
https://api.airstack.xyz/graphql
```

### Authentication

Requires an API key. Add the API key to the request headers:

```
{
  "Authorization": "Bearer YOUR_API_KEY"
}
```

### Example Query

```graphql
query GetSolanaTransactions {
  SolanaTransactions(
    input: {
      filter: {
        account: { _eq: "wallet_address" }
      },
      limit: 10
    }
  ) {
    Transaction {
      signature
      blockTime
      fee
      status
    }
  }
}
```

### Implementation Example

```javascript
const fetchTransactions = async (walletAddress) => {
  const response = await fetch('https://api.airstack.xyz/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_API_KEY'
    },
    body: JSON.stringify({
      query: `
        query GetSolanaTransactions {
          SolanaTransactions(
            input: {
              filter: {
                account: { _eq: "${walletAddress}" }
              },
              limit: 10
            }
          ) {
            Transaction {
              signature
              blockTime
              fee
              status
            }
          }
        }
      `
    })
  });

  const data = await response.json();
  return data.data.SolanaTransactions.Transaction;
};
```

## Internal API Endpoints

The following endpoints are implemented within the application for data management:

### User API

#### Get User

```
GET /api/users/:walletAddress
```

Response:
```json
{
  "userId": "user_123",
  "walletAddress": "wallet_address",
  "totalStaked": 10.5,
  "wins": 5,
  "losses": 3,
  "createdAt": "2023-01-01T00:00:00Z",
  "lastActive": "2023-01-02T00:00:00Z"
}
```

#### Get User Stats

```
GET /api/users/:userId/stats
```

Response:
```json
{
  "totalStaked": 10.5,
  "wins": 5,
  "losses": 3,
  "totalWinnings": 15.75,
  "winRate": 62.5
}
```

### Bet API

#### Place Bet

```
POST /api/bets
```

Request:
```json
{
  "userId": "user_123",
  "marketId": "market_456",
  "stakeAmount": 1.5,
  "outcome": "Yes",
  "txSignature": "transaction_signature"
}
```

Response:
```json
{
  "betId": "bet_789",
  "userId": "user_123",
  "marketId": "market_456",
  "stakeAmount": 1.5,
  "outcome": "Yes",
  "status": "active",
  "createdAt": "2023-01-03T00:00:00Z",
  "txSignature": "transaction_signature"
}
```

#### Get User Bets

```
GET /api/users/:userId/bets
```

Response:
```json
[
  {
    "betId": "bet_789",
    "userId": "user_123",
    "marketId": "market_456",
    "stakeAmount": 1.5,
    "outcome": "Yes",
    "status": "active",
    "createdAt": "2023-01-03T00:00:00Z",
    "txSignature": "transaction_signature"
  }
]
```

### Market API

#### Get Markets

```
GET /api/markets
```

Response:
```json
[
  {
    "marketId": "market_456",
    "eventDescription": "SOL Price Prediction",
    "question": "Will SOL be above $100 by end of week?",
    "options": ["Yes", "No"],
    "currentPrice": "$85.40",
    "status": "active",
    "startTime": "2023-01-01T00:00:00Z",
    "endTime": "2023-01-08T00:00:00Z",
    "totalStaked": 245.7,
    "participants": 89,
    "odds": { "Yes": 1.8, "No": 2.1 }
  }
]
```

#### Get Market Details

```
GET /api/markets/:marketId
```

Response:
```json
{
  "marketId": "market_456",
  "eventDescription": "SOL Price Prediction",
  "question": "Will SOL be above $100 by end of week?",
  "options": ["Yes", "No"],
  "currentPrice": "$85.40",
  "status": "active",
  "startTime": "2023-01-01T00:00:00Z",
  "endTime": "2023-01-08T00:00:00Z",
  "totalStaked": 245.7,
  "participants": 89,
  "odds": { "Yes": 1.8, "No": 2.1 }
}
```

#### Resolve Market

```
POST /api/markets/:marketId/resolve
```

Request:
```json
{
  "outcome": "Yes",
  "resolutionSource": "CoinGecko API",
  "verificationUrl": "https://www.coingecko.com/en/coins/solana"
}
```

Response:
```json
{
  "marketId": "market_456",
  "status": "resolved",
  "outcome": "Yes",
  "resolutionSource": "CoinGecko API",
  "resolvedAt": "2023-01-08T00:00:00Z"
}
```

## Error Handling

All API endpoints return standard HTTP status codes:

| Status Code | Description |
|-------------|-------------|
| 200 | OK - The request was successful |
| 400 | Bad Request - The request was invalid |
| 401 | Unauthorized - Authentication is required |
| 403 | Forbidden - The user does not have permission |
| 404 | Not Found - The resource was not found |
| 500 | Internal Server Error - An error occurred on the server |

Error responses follow this format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message",
    "details": {}
  }
}
```

## Rate Limiting

- Solana RPC: Depends on the provider (public endpoints have strict limits)
- Internal API: 100 requests per minute per IP address

## Security Considerations

1. **Wallet Security**: User private keys are never stored or transmitted by the application. All transactions are signed by the user's wallet.

2. **Transaction Verification**: All transactions are verified on-chain before being considered confirmed.

3. **Data Integrity**: Market resolutions include verifiable sources and proofs to ensure transparency.

4. **Input Validation**: All user inputs are validated to prevent injection attacks.

5. **HTTPS**: All API requests use HTTPS to encrypt data in transit.

6. **CORS**: Cross-Origin Resource Sharing is properly configured to prevent unauthorized access.

7. **Rate Limiting**: Rate limiting is implemented to prevent abuse.

8. **Error Handling**: Errors are handled gracefully without exposing sensitive information.

