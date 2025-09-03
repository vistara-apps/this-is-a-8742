/**
 * Error handling utilities for Solana BetChain
 */

// Error codes
export enum ErrorCode {
  // General errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  
  // Wallet errors
  WALLET_NOT_CONNECTED = 'WALLET_NOT_CONNECTED',
  WALLET_CONNECTION_REJECTED = 'WALLET_CONNECTION_REJECTED',
  WALLET_DISCONNECTED = 'WALLET_DISCONNECTED',
  WALLET_ACCOUNT_CHANGED = 'WALLET_ACCOUNT_CHANGED',
  
  // Transaction errors
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  TRANSACTION_REJECTED = 'TRANSACTION_REJECTED',
  TRANSACTION_TIMEOUT = 'TRANSACTION_TIMEOUT',
  
  // Bet errors
  INVALID_BET_AMOUNT = 'INVALID_BET_AMOUNT',
  MARKET_CLOSED = 'MARKET_CLOSED',
  MARKET_RESOLVED = 'MARKET_RESOLVED',
  BET_ALREADY_PLACED = 'BET_ALREADY_PLACED',
  
  // Data errors
  DATA_NOT_FOUND = 'DATA_NOT_FOUND',
  INVALID_DATA = 'INVALID_DATA',
  STORAGE_ERROR = 'STORAGE_ERROR',
}

// Error types
export interface AppError {
  code: ErrorCode;
  message: string;
  details?: any;
  originalError?: Error;
}

/**
 * Create a standardized application error
 * @param code Error code
 * @param message User-friendly error message
 * @param details Additional error details
 * @param originalError Original error object
 * @returns Standardized AppError object
 */
export const createError = (
  code: ErrorCode,
  message: string,
  details?: any,
  originalError?: Error
): AppError => {
  return {
    code,
    message,
    details,
    originalError,
  };
};

/**
 * Handle wallet connection errors
 * @param error Original error from wallet adapter
 * @returns Standardized AppError
 */
export const handleWalletError = (error: any): AppError => {
  console.error('Wallet error:', error);
  
  // Check for specific wallet error types
  if (error.name === 'WalletNotConnectedError') {
    return createError(
      ErrorCode.WALLET_NOT_CONNECTED,
      'Wallet is not connected. Please connect your wallet to continue.',
      {},
      error
    );
  }
  
  if (error.name === 'WalletConnectionError') {
    return createError(
      ErrorCode.WALLET_CONNECTION_REJECTED,
      'Wallet connection was rejected. Please try again.',
      {},
      error
    );
  }
  
  if (error.name === 'WalletDisconnectedError') {
    return createError(
      ErrorCode.WALLET_DISCONNECTED,
      'Wallet was disconnected. Please reconnect to continue.',
      {},
      error
    );
  }
  
  if (error.name === 'WalletAccountError') {
    return createError(
      ErrorCode.WALLET_ACCOUNT_CHANGED,
      'Wallet account changed. Please refresh the page.',
      {},
      error
    );
  }
  
  // Default wallet error
  return createError(
    ErrorCode.UNKNOWN_ERROR,
    'An unknown wallet error occurred. Please try again.',
    {},
    error
  );
};

/**
 * Handle transaction errors
 * @param error Original error from transaction
 * @returns Standardized AppError
 */
export const handleTransactionError = (error: any): AppError => {
  console.error('Transaction error:', error);
  
  // Check for specific transaction error types
  if (error.message && error.message.includes('insufficient funds')) {
    return createError(
      ErrorCode.INSUFFICIENT_FUNDS,
      'Insufficient funds to complete this transaction. Please add more SOL to your wallet.',
      {},
      error
    );
  }
  
  if (error.message && error.message.includes('User rejected')) {
    return createError(
      ErrorCode.TRANSACTION_REJECTED,
      'Transaction was rejected. Please try again.',
      {},
      error
    );
  }
  
  if (error.message && error.message.includes('timeout')) {
    return createError(
      ErrorCode.TRANSACTION_TIMEOUT,
      'Transaction timed out. The network may be congested, please try again.',
      {},
      error
    );
  }
  
  // Default transaction error
  return createError(
    ErrorCode.TRANSACTION_FAILED,
    'Transaction failed. Please try again.',
    {},
    error
  );
};

/**
 * Handle bet errors
 * @param error Original error
 * @param details Additional details
 * @returns Standardized AppError
 */
export const handleBetError = (error: any, details?: any): AppError => {
  console.error('Bet error:', error);
  
  // Check for specific bet error types
  if (error.message && error.message.includes('invalid amount')) {
    return createError(
      ErrorCode.INVALID_BET_AMOUNT,
      'Invalid bet amount. Please enter a valid amount within the allowed range.',
      details,
      error
    );
  }
  
  if (error.message && error.message.includes('market closed')) {
    return createError(
      ErrorCode.MARKET_CLOSED,
      'This market is closed for betting. Please try another market.',
      details,
      error
    );
  }
  
  if (error.message && error.message.includes('market resolved')) {
    return createError(
      ErrorCode.MARKET_RESOLVED,
      'This market has already been resolved. Please try another market.',
      details,
      error
    );
  }
  
  // Default bet error
  return createError(
    ErrorCode.UNKNOWN_ERROR,
    'An error occurred while placing your bet. Please try again.',
    details,
    error
  );
};

/**
 * Handle data errors
 * @param error Original error
 * @param entityType Type of entity (user, bet, market)
 * @param entityId ID of the entity
 * @returns Standardized AppError
 */
export const handleDataError = (
  error: any,
  entityType?: string,
  entityId?: string
): AppError => {
  console.error(`Data error (${entityType}/${entityId}):`, error);
  
  // Check for specific data error types
  if (error.message && error.message.includes('not found')) {
    return createError(
      ErrorCode.DATA_NOT_FOUND,
      `The requested ${entityType || 'data'} was not found.`,
      { entityType, entityId },
      error
    );
  }
  
  if (error.message && error.message.includes('invalid')) {
    return createError(
      ErrorCode.INVALID_DATA,
      `Invalid ${entityType || 'data'} format.`,
      { entityType, entityId },
      error
    );
  }
  
  if (error.message && error.message.includes('storage')) {
    return createError(
      ErrorCode.STORAGE_ERROR,
      'A storage error occurred. Please try again.',
      { entityType, entityId },
      error
    );
  }
  
  // Default data error
  return createError(
    ErrorCode.UNKNOWN_ERROR,
    'An unknown data error occurred. Please try again.',
    { entityType, entityId },
    error
  );
};

/**
 * Get a user-friendly error message
 * @param error Error object
 * @returns User-friendly error message
 */
export const getUserFriendlyErrorMessage = (error: any): string => {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error.message) {
    return error.message;
  }
  
  if (error.code) {
    switch (error.code) {
      case ErrorCode.WALLET_NOT_CONNECTED:
        return 'Please connect your wallet to continue.';
      case ErrorCode.INSUFFICIENT_FUNDS:
        return 'You don\'t have enough SOL to complete this transaction.';
      case ErrorCode.TRANSACTION_REJECTED:
        return 'You rejected the transaction. Please try again.';
      case ErrorCode.MARKET_CLOSED:
        return 'This market is no longer accepting bets.';
      default:
        return 'An error occurred. Please try again.';
    }
  }
  
  return 'An unknown error occurred. Please try again.';
};

