import { Connection } from '@solana/web3.js';
import { map } from 'rxjs/operators';
import { encodeFilters, fromProgramAccountChange } from '../../operations';
import { InstructionFilters, INSTRUCTION_ACCOUNT_NAME } from '../../utils';
import { createInstructionDocument } from './utils';

export const onInstructionsChanges = (
  connection: Connection,
  filters: InstructionFilters
) =>
  fromProgramAccountChange(connection, {
    commitment: connection.commitment,
    filters: encodeFilters(INSTRUCTION_ACCOUNT_NAME, filters),
  }).pipe(
    map(({ keyedAccountInfo }) =>
      createInstructionDocument(
        keyedAccountInfo.accountId,
        keyedAccountInfo.accountInfo
      )
    )
  );
