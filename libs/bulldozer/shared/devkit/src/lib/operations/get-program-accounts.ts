import { Connection, GetProgramAccountsConfig } from '@solana/web3.js';
import { defer, from } from 'rxjs';
import { BULLDOZER_PROGRAM_ID } from '../programs';

export const getProgramAccounts = (
  connection: Connection,
  config?: GetProgramAccountsConfig
) =>
  from(
    defer(() => connection.getProgramAccounts(BULLDOZER_PROGRAM_ID, config))
  );
