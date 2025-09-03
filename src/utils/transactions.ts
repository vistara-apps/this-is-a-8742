import { 
  Connection, 
  PublicKey, 
  Transaction, 
  SystemProgram, 
  LAMPORTS_PER_SOL,
  TransactionInstruction,
  ConfirmedTransaction,
  ParsedTransactionWithMeta,
  PartiallyDecodedInstruction
} from '@solana/web3.js';

/**
 * Calculate the platform commission for a bet
 * @param amount Bet amount in SOL
 * @param commissionRate Commission rate (0.02 = 2%)
 * @returns Commission amount in SOL
 */
export const calculateCommission = (amount: number, commissionRate: number = 0.02): number => {
  return amount * commissionRate;
};

/**
 * Calculate potential winnings for a bet
 * @param amount Bet amount in SOL
 * @param odds Odds multiplier (e.g., 1.8)
 * @param commissionRate Commission rate (0.02 = 2%)
 * @returns Potential winnings in SOL (including original stake)
 */
export const calculatePotentialWinnings = (
  amount: number, 
  odds: number, 
  commissionRate: number = 0.02
): number => {
  const grossWinnings = amount * odds;
  const commission = calculateCommission(grossWinnings - amount, commissionRate);
  return grossWinnings - commission;
};

/**
 * Format a Solana address for display
 * @param address Solana address as string
 * @param prefixLength Number of characters to show at the beginning
 * @param suffixLength Number of characters to show at the end
 * @returns Formatted address (e.g., "Ax12...3Yz7")
 */
export const formatAddress = (
  address: string, 
  prefixLength: number = 4, 
  suffixLength: number = 4
): string => {
  if (!address) return '';
  if (address.length <= prefixLength + suffixLength) return address;
  
  return `${address.slice(0, prefixLength)}...${address.slice(-suffixLength)}`;
};

/**
 * Format SOL amount for display
 * @param amount Amount in SOL
 * @param decimals Number of decimal places to show
 * @returns Formatted amount (e.g., "1.23 SOL")
 */
export const formatSol = (amount: number, decimals: number = 3): string => {
  return `${amount.toFixed(decimals)} SOL`;
};

/**
 * Get transaction URL for Solana Explorer
 * @param signature Transaction signature
 * @param cluster Network cluster ('mainnet-beta', 'testnet', 'devnet')
 * @returns URL to view transaction on Solana Explorer
 */
export const getTransactionUrl = (
  signature: string, 
  cluster: 'mainnet-beta' | 'testnet' | 'devnet' = 'devnet'
): string => {
  return `https://explorer.solana.com/tx/${signature}?cluster=${cluster}`;
};

/**
 * Get wallet URL for Solana Explorer
 * @param address Wallet address
 * @param cluster Network cluster ('mainnet-beta', 'testnet', 'devnet')
 * @returns URL to view wallet on Solana Explorer
 */
export const getWalletUrl = (
  address: string, 
  cluster: 'mainnet-beta' | 'testnet' | 'devnet' = 'devnet'
): string => {
  return `https://explorer.solana.com/address/${address}?cluster=${cluster}`;
};

/**
 * Extract memo from a transaction
 * @param transaction Transaction object from getTransaction
 * @returns Memo string if found, null otherwise
 */
export const extractMemoFromTransaction = (
  transaction: ParsedTransactionWithMeta
): string | null => {
  if (!transaction || !transaction.meta || !transaction.transaction) {
    return null;
  }

  // Look for memo program instructions
  const instructions = transaction.transaction.message.instructions;
  const memoInstruction = instructions.find(instruction => {
    // Memo program ID
    return instruction.programId.toString() === 'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr';
  });

  if (memoInstruction && 'data' in memoInstruction && memoInstruction.data) {
    // For PartiallyDecodedInstruction, data is a string
    try {
      // Try to decode as UTF-8 directly first
      return memoInstruction.data;
    } catch (error) {
      console.error('Error decoding memo data:', error);
      return null;
    }
  }

  return null;
};

/**
 * Verify a transaction on-chain
 * @param connection Solana connection
 * @param signature Transaction signature
 * @returns True if transaction is confirmed and successful
 */
export const verifyTransaction = async (
  connection: Connection, 
  signature: string
): Promise<boolean> => {
  try {
    const transaction = await connection.getTransaction(signature, {
      maxSupportedTransactionVersion: 0,
    });
    
    if (!transaction || !transaction.meta) {
      return false;
    }
    
    // Check if transaction was successful
    return transaction.meta.err === null;
  } catch (error) {
    console.error('Error verifying transaction:', error);
    return false;
  }
};
