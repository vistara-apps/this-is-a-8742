# Solana BetChain Deployment Guide

This document provides comprehensive instructions for deploying the Solana BetChain application to various environments.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development](#local-development)
3. [Production Deployment](#production-deployment)
4. [Environment Configuration](#environment-configuration)
5. [Database Setup](#database-setup)
6. [Solana Network Configuration](#solana-network-configuration)
7. [Monitoring and Logging](#monitoring-and-logging)
8. [Security Considerations](#security-considerations)
9. [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying Solana BetChain, ensure you have the following:

- Node.js (v16 or later)
- npm or yarn
- Git
- Access to a Solana RPC endpoint (devnet for testing, mainnet for production)
- (Optional) Database for production deployment
- (Optional) CI/CD pipeline for automated deployments

## Local Development

### Clone the Repository

```bash
git clone https://github.com/vistara-apps/this-is-a-8742.git
cd this-is-a-8742
```

### Install Dependencies

```bash
npm install
# or
yarn install
```

### Configure Environment Variables

Create a `.env` file in the root directory:

```
VITE_SOLANA_NETWORK=devnet
VITE_RPC_ENDPOINT=https://api.devnet.solana.com
```

### Start Development Server

```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:5173`.

## Production Deployment

### Build the Application

```bash
npm run build
# or
yarn build
```

This will create a `dist` directory with the production-ready files.

### Deployment Options

#### Option 1: Static Hosting (Recommended)

Since Solana BetChain is a client-side application, it can be deployed to any static hosting service:

1. **Vercel**

```bash
npm install -g vercel
vercel login
vercel
```

2. **Netlify**

```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod
```

3. **GitHub Pages**

```bash
# Add this to package.json
"scripts": {
  "deploy": "gh-pages -d dist"
}

npm install -g gh-pages
npm run deploy
```

4. **AWS S3 + CloudFront**

```bash
# Install AWS CLI and configure credentials
aws s3 sync dist/ s3://your-bucket-name/ --delete
```

#### Option 2: Docker Deployment

1. Create a `Dockerfile`:

```dockerfile
FROM node:16-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

2. Create `nginx.conf`:

```
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

3. Build and run the Docker container:

```bash
docker build -t solana-betchain .
docker run -p 80:80 solana-betchain
```

## Environment Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| VITE_SOLANA_NETWORK | Solana network to use (devnet, testnet, mainnet-beta) | devnet | Yes |
| VITE_RPC_ENDPOINT | URL of the Solana RPC endpoint | https://api.devnet.solana.com | Yes |
| VITE_COMMISSION_RATE | Platform commission rate (e.g., 0.02 for 2%) | 0.02 | No |
| VITE_MIN_STAKE_AMOUNT | Minimum stake amount in SOL | 0.01 | No |
| VITE_MAX_STAKE_AMOUNT | Maximum stake amount in SOL | 100 | No |

### Configuration Files

For more complex configurations, edit the following files:

- `src/config/index.ts`: Application configuration
- `tailwind.config.js`: UI theme configuration
- `vite.config.js`: Build configuration

## Database Setup

The current implementation uses localStorage for data persistence, which is suitable for MVP testing. For production, consider implementing one of the following database solutions:

### Option 1: Firebase Firestore

1. Create a Firebase project and enable Firestore
2. Install Firebase SDK:

```bash
npm install firebase
```

3. Create a Firebase configuration file (`src/config/firebase.ts`):

```typescript
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_AUTH_DOMAIN',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_STORAGE_BUCKET',
  messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
  appId: 'YOUR_APP_ID'
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
```

4. Update data models to use Firestore instead of localStorage

### Option 2: Supabase (PostgreSQL)

1. Create a Supabase project
2. Install Supabase SDK:

```bash
npm install @supabase/supabase-js
```

3. Create a Supabase configuration file (`src/config/supabase.ts`):

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_KEY';

export const supabase = createClient(supabaseUrl, supabaseKey);
```

4. Update data models to use Supabase instead of localStorage

## Solana Network Configuration

### Devnet (Testing)

For development and testing, use the Solana devnet:

```
VITE_SOLANA_NETWORK=devnet
VITE_RPC_ENDPOINT=https://api.devnet.solana.com
```

### Mainnet (Production)

For production, use a reliable RPC provider:

```
VITE_SOLANA_NETWORK=mainnet-beta
VITE_RPC_ENDPOINT=https://your-rpc-provider.com/your-endpoint
```

Recommended RPC providers:
- QuickNode
- Alchemy
- Helius
- RunNode

## Monitoring and Logging

### Application Monitoring

1. **Sentry Integration**

```bash
npm install @sentry/react
```

```typescript
// src/main.jsx
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN',
  environment: import.meta.env.MODE,
  tracesSampleRate: 1.0,
});
```

2. **Google Analytics**

```bash
npm install react-ga4
```

```typescript
// src/utils/analytics.ts
import ReactGA from 'react-ga4';

export const initGA = () => {
  ReactGA.initialize('YOUR_GA_MEASUREMENT_ID');
};

export const logPageView = () => {
  ReactGA.send({ hitType: 'pageview', page: window.location.pathname });
};

export const logEvent = (category, action) => {
  ReactGA.event({
    category,
    action,
  });
};
```

### Server Monitoring (if applicable)

- Use AWS CloudWatch, Datadog, or New Relic for server monitoring
- Set up alerts for high CPU usage, memory usage, and error rates

## Security Considerations

1. **RPC Endpoint Security**
   - Use a dedicated RPC endpoint with API key authentication
   - Set up rate limiting to prevent abuse

2. **Frontend Security**
   - Implement Content Security Policy (CSP)
   - Use Subresource Integrity (SRI) for external scripts
   - Enable HTTPS for all connections

3. **Wallet Security**
   - Never store private keys
   - Use established wallet adapters
   - Implement transaction confirmation screens

4. **Smart Contract Security** (if applicable)
   - Conduct thorough audits of any smart contracts
   - Implement emergency pause functionality
   - Use multisig for administrative functions

## Troubleshooting

### Common Issues

1. **RPC Connection Errors**
   - Check if the RPC endpoint is correct and accessible
   - Verify network settings (devnet vs mainnet)
   - Consider using a different RPC provider

2. **Wallet Connection Issues**
   - Ensure the wallet adapter is properly configured
   - Check if the wallet extension is installed and up to date
   - Verify that the wallet supports the selected Solana network

3. **Transaction Failures**
   - Check if the user has sufficient SOL for the transaction
   - Verify that the transaction is properly constructed
   - Check for any program errors in the transaction logs

### Support Resources

- GitHub Issues: [https://github.com/vistara-apps/this-is-a-8742/issues](https://github.com/vistara-apps/this-is-a-8742/issues)
- Solana Developer Documentation: [https://docs.solana.com/](https://docs.solana.com/)
- Solana Wallet Adapter Documentation: [https://github.com/solana-labs/wallet-adapter](https://github.com/solana-labs/wallet-adapter)

