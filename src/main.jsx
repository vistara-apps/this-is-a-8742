import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { SolanaWalletProvider } from './contexts/SolanaWalletProvider.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary showDetails={false}>
      <SolanaWalletProvider>
        <App />
      </SolanaWalletProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);

