import { Connection } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { encodeFilters, getProgramAccounts } from '../../operations';
import {
  Document,
  InstructionArgument,
  InstructionArgumentFilters,
  INSTRUCTION_ARGUMENT_ACCOUNT_NAME,
} from '../../utils';
import { createInstructionArgumentDocument } from './utils';

export const getInstructionArguments = (
  connection: Connection,
  filters: InstructionArgumentFilters
): Observable<Document<InstructionArgument>[]> => {
  return getProgramAccounts(connection, {
    commitment: connection.commitment,
    filters: encodeFilters(INSTRUCTION_ARGUMENT_ACCOUNT_NAME, filters),
  }).pipe(
    map((programAccounts) =>
      programAccounts.map(({ pubkey, account }) =>
        createInstructionArgumentDocument(pubkey, account)
      )
    )
  );
};
