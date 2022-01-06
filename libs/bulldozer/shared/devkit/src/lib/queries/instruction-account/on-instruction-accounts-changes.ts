import { Connection } from '@solana/web3.js';
import { map } from 'rxjs/operators';
import { encodeFilters, fromProgramAccountChange } from '../../operations';
import {
  InstructionAccountFilters,
  INSTRUCTION_ACCOUNT_ACCOUNT_NAME,
} from '../../utils';
import { createInstructionAccountDocument } from './utils';

export const onInstructionAccountsChanges = (
  connection: Connection,
  filters: InstructionAccountFilters
) =>
  fromProgramAccountChange(connection, {
    commitment: connection.commitment,
    filters: encodeFilters(INSTRUCTION_ACCOUNT_ACCOUNT_NAME, filters),
  }).pipe(
    map(({ keyedAccountInfo }) =>
      createInstructionAccountDocument(
        keyedAccountInfo.accountId,
        keyedAccountInfo.accountInfo
      )
    )
  );
