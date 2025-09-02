import { useCallback, useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { 
  Connection, 
  PublicKey, 
  Transaction, 
  SystemProgram, 
  LAMPORTS_PER_SOL,
  TransactionInstruction,
  sendAndConfirmTransaction,
  Keypair
} from '@solana/web3.js';
import { TransactionModel } from '../data/models';
import { TransactionDetails } from '../types';

/**
 * Custom hook for handling Solana transactions
 * Provides methods for sending, confirming, and tracking transactions
 */
export const useSolanaTransactions = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [lastSignature, setLastSignature] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Send SOL to another wallet
   * @param recipient Recipient wallet address
   * @param amount Amount in SOL
   * @param memo Optional memo to include with the transaction
   */
  const sendSol = useCallback(async (
    recipient: string, 
    amount: number, 
    memo?: string
  ): Promise<string | null> => {
    if (!publicKey || !connection || !sendTransaction) {
      setError('Wallet not connected');
      return null;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const recipientPubkey = new PublicKey(recipient);
      const lamports = amount * LAMPORTS_PER_SOL;

      // Create transaction
      const transaction = new Transaction();

      // Add transfer instruction
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: recipientPubkey,
          lamports,
        })
      );

      // Add memo if provided
      if (memo) {
        transaction.add(
          new TransactionInstruction({
            keys: [{ pubkey: publicKey, isSigner: true, isWritable: true }],
            programId: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'),
            data: Buffer.from(memo, 'utf8'),
          })
        );
      }

      // Send transaction
      const signature = await sendTransaction(transaction, connection);
      
      // Wait for confirmation
      const confirmation = await connection.confirmTransaction(signature);
      
      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${confirmation.value.err.toString()}`);
      }

      // Record transaction
      TransactionModel.create({
        signature,
        amount,
        sender: publicKey.toString(),
        recipient,
        status: 'confirmed',
        type: 'withdrawal',
      });

      setLastSignature(signature);
      setIsProcessing(false);
      return signature;
    } catch (err: any) {
      console.error('Transaction error:', err);
      setError(err.message || 'Transaction failed');
      setIsProcessing(false);
      return null;
    }
  }, [publicKey, connection, sendTransaction]);

  /**
   * Place a bet by sending SOL to the platform
   * @param amount Amount to bet in SOL
   * @param betId Associated bet ID
   */
  const placeBet = useCallback(async (
    amount: number, 
    betId: string
  ): Promise<string | null> => {
    if (!publicKey || !connection || !sendTransaction) {
      setError('Wallet not connected');
      return null;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // In a real implementation, this would send to a program account
      // For now, we'll simulate by sending a small amount to the same wallet
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: publicKey, // Mock - would be program account
          lamports: amount * LAMPORTS_PER_SOL * 0.02, // 2% commission simulation
        })
      );

      // Add memo with bet information
      transaction.add(
        new TransactionInstruction({
          keys: [{ pubkey: publicKey, isSigner: true, isWritable: true }],
          programId: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'),
          data: Buffer.from(`Bet: ${betId}`, 'utf8'),
        })
      );

      // Send transaction
      const signature = await sendTransaction(transaction, connection);
      
      // Wait for confirmation
      const confirmation = await connection.confirmTransaction(signature);
      
      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${confirmation.value.err.toString()}`);
      }

      // Record transaction
      TransactionModel.create({
        signature,
        amount,
        sender: publicKey.toString(),
        recipient: 'platform', // Mock - would be program account
        status: 'confirmed',
        type: 'stake',
        betId,
      });

      setLastSignature(signature);
      setIsProcessing(false);
      return signature;
    } catch (err: any) {
      console.error('Transaction error:', err);
      setError(err.message || 'Transaction failed');
      setIsProcessing(false);
      return null;
    }
  }, [publicKey, connection, sendTransaction]);

  /**
   * Withdraw winnings
   * @param amount Amount to withdraw in SOL
   * @param betId Associated bet ID
   */
  const withdrawWinnings = useCallback(async (
    amount: number, 
    betId: string
  ): Promise<string | null> => {
    // In a real implementation, this would interact with a program to withdraw funds
    // For now, we'll simulate by sending SOL from a mock program account
    
    setError('Withdrawal functionality requires a deployed Solana program');
    return null;

    // The real implementation would look something like this:
    /*
    if (!publicKey || !connection) {
      setError('Wallet not connected');
      return null;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Create withdrawal instruction to program
      const programId = new PublicKey('YOUR_PROGRAM_ID');
      const instruction = new TransactionInstruction({
        keys: [
          { pubkey: publicKey, isSigner: true, isWritable: true },
          { pubkey: programPDA, isSigner: false, isWritable: true },
        ],
        programId,
        data: Buffer.from(...), // Serialized instruction data
      });

      const transaction = new Transaction().add(instruction);
      const signature = await sendTransaction(transaction, connection);
      
      // Wait for confirmation
      const confirmation = await connection.confirmTransaction(signature);
      
      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${confirmation.value.err.toString()}`);
      }

      // Record transaction
      TransactionModel.create({
        signature,
        amount,
        sender: 'platform',
        recipient: publicKey.toString(),
        status: 'confirmed',
        type: 'withdrawal',
        betId,
      });

      setLastSignature(signature);
      setIsProcessing(false);
      return signature;
    } catch (err) {
      console.error('Transaction error:', err);
      setError(err.message || 'Transaction failed');
      setIsProcessing(false);
      return null;
    }
    */
  }, [publicKey, connection, sendTransaction]);

  /**
   * Get transaction details from a signature
   * @param signature Transaction signature
   */
  const getTransactionDetails = useCallback(async (
    signature: string
  ): Promise<any | null> => {
    if (!connection) {
      setError('Connection not available');
      return null;
    }

    try {
      const transaction = await connection.getTransaction(signature, {
        maxSupportedTransactionVersion: 0,
      });
      return transaction;
    } catch (err: any) {
      console.error('Error fetching transaction:', err);
      setError(err.message || 'Failed to fetch transaction');
      return null;
    }
  }, [connection]);

  /**
   * Get all transactions for the current wallet
   */
  const getUserTransactions = useCallback((): TransactionDetails[] => {
    if (!publicKey) return [];
    
    return TransactionModel.getByWalletAddress(publicKey.toString());
  }, [publicKey]);

  return {
    sendSol,
    placeBet,
    withdrawWinnings,
    getTransactionDetails,
    getUserTransactions,
    isProcessing,
    lastSignature,
    error,
  };
};

