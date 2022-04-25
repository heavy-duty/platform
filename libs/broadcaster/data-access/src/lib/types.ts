import { Finality, Transaction, TransactionSignature } from '@solana/web3.js';

export interface TransactionStatus {
  signature: TransactionSignature;
  status?: Finality;
  error?: unknown;
  transaction: Transaction;
  timestamp: number;
}
