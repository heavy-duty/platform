import { getProgramAccounts } from '@heavy-duty/rx-solana';
import { Connection } from '@solana/web3.js';
import { map, Observable } from 'rxjs';
import {
  BULLDOZER_PROGRAM_ID,
  createInstructionArgumentDocument,
  Document,
  encodeFilters,
  InstructionArgument,
  InstructionArgumentFilters,
  INSTRUCTION_ARGUMENT_ACCOUNT_NAME,
} from '../../utils';

export const getInstructionArguments = (
  connection: Connection,
  filters: InstructionArgumentFilters
): Observable<Document<InstructionArgument>[]> => {
  return getProgramAccounts(connection, BULLDOZER_PROGRAM_ID, {
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
