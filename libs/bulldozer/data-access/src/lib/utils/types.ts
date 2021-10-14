import { Idl } from '@project-serum/anchor';
import { PublicKey, Transaction } from '@solana/web3.js';

export interface Wallet {
  signTransaction(tx: Transaction): Promise<Transaction>;
  signAllTransactions(txs: Transaction[]): Promise<Transaction[]>;
  publicKey: PublicKey;
}

export interface ProgramConfig {
  id: string;
  idl: Idl;
}
