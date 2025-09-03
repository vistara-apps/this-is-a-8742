# Solana BetChain

A web application enabling users to place bets using Solana on curated events with transparent outcome resolution.

![Solana BetChain](https://i.imgur.com/5c948ae5.jpeg)

## Features

- **Solana Staking Interface**: A user-friendly interface allowing users to securely connect their Solana-compatible wallets, deposit Solana, view their staked amounts, and withdraw winnings.
- **Transparent Bet Resolution**: A system for clearly defining bet outcomes and verifiably resolving bets, ensuring fair distribution of winnings based on predefined rules and external data feeds.
- **Curated Betting Markets**: A selection of specific, high-demand events or scenarios (e.g., crypto price movements, sports outcomes) that users can bet on using their staked Solana.

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS
- **Blockchain**: Solana, Web3.js
- **Wallet Integration**: Solana Wallet Adapter
- **Data Visualization**: Recharts
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or yarn
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/vistara-apps/this-is-a-8742.git
cd this-is-a-8742
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Usage

1. Connect your Solana wallet using the "Connect Wallet" button
2. Browse available betting markets
3. Place bets on outcomes you want to predict
4. View your active bets and past results in the Dashboard
5. Check the Leaderboard to see how you rank against other users
6. Verify bet resolutions in the Transparency section

## Architecture

The application follows a modular architecture with the following components:

- **Components**: UI components for the application
- **Contexts**: React contexts for state management
- **Hooks**: Custom hooks for business logic
- **Services**: Service classes for specific functionality
- **Utils**: Utility functions
- **Types**: TypeScript type definitions
- **Data**: Data models and sample data

## Data Models

- **User**: Represents a bettor on the platform
- **Bet**: Represents a user's stake on a specific market outcome
- **Market**: Represents a betting event
- **Transaction**: Represents a Solana transaction
- **Resolution**: Represents the resolution of a market

## Business Model

The platform operates on a micro-transaction model, taking a small commission (e.g., 1-2%) on winning bets to fund operations and platform development.

## Documentation

- [API Documentation](docs/API.md)
- [Deployment Guide](docs/Deployment.md)
- [Configuration Guide](docs/Configuration.md)

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Solana](https://solana.com/)
- [Solana Wallet Adapter](https://github.com/solana-labs/wallet-adapter)
- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vite](https://vitejs.dev/)
- [Recharts](https://recharts.org/)
- [Lucide React](https://lucide.dev/)

