import { PublicKey, Transaction } from '@solana/web3.js';

export interface Wallet {
  signTransaction(tx: Transaction): Promise<Transaction>;
  signAllTransactions(txs: Transaction[]): Promise<Transaction[]>;
  publicKey: PublicKey;
}

export interface ProgramConfig {
  id: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  idl: any;
}

export type ProgramConfigs = {
  [key: string]: ProgramConfig;
};
