import { Connection, PublicKey } from '@solana/web3.js';
import { defer, from } from 'rxjs';

export const getAccountInfo = (connection: Connection, publicKey: PublicKey) =>
  from(defer(() => connection.getAccountInfo(publicKey)));
