import { Finality, Transaction, TransactionSignature } from '@solana/web3.js';

export interface TransactionStatus {
  signature: TransactionSignature;
  status?: Finality;
  transaction: Transaction;
  timestamp: number;
}
