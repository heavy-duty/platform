import { PublicKey, Transaction } from '@solana/web3.js';

import { Wallet } from './types';

export class DummyWallet implements Wallet {
  async signTransaction(): Promise<Transaction> {
    throw Error('Not supported by dummy wallet!');
  }

  async signAllTransactions(): Promise<Transaction[]> {
    throw Error('Not supported by dummy wallet!');
  }

  get publicKey(): PublicKey {
    throw Error('Not supported by dummy wallet!');
  }
}
