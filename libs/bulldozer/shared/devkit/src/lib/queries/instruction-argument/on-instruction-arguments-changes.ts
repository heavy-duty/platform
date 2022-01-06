import { Connection } from '@solana/web3.js';
import { map } from 'rxjs/operators';
import { encodeFilters, fromProgramAccountChange } from '../../operations';
import {
  InstructionArgumentFilters,
  INSTRUCTION_ARGUMENT_ACCOUNT_NAME,
} from '../../utils';
import { createInstructionArgumentDocument } from './utils';

export const onInstructionArgumentsChanges = (
  connection: Connection,
  filters: InstructionArgumentFilters
) =>
  fromProgramAccountChange(connection, {
    commitment: connection.commitment,
    filters: encodeFilters(INSTRUCTION_ARGUMENT_ACCOUNT_NAME, filters),
  }).pipe(
    map(({ keyedAccountInfo }) =>
      createInstructionArgumentDocument(
        keyedAccountInfo.accountId,
        keyedAccountInfo.accountInfo
      )
    )
  );
