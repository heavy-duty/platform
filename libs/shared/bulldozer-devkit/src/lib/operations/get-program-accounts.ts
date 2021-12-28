import {
  Connection,
  GetProgramAccountsConfig,
  PublicKey,
} from '@solana/web3.js';
import { defer, from } from 'rxjs';

export const getProgramAccounts = (
  connection: Connection,
  programId: PublicKey,
  config?: GetProgramAccountsConfig
) => from(defer(() => connection.getProgramAccounts(programId, config)));
