import { getProgramAccounts } from '@heavy-duty/rx-solana';
import { Connection } from '@solana/web3.js';
import { map, Observable } from 'rxjs';
import {
  BULLDOZER_PROGRAM_ID,
  createInstructionDocument,
  Document,
  encodeFilters,
  Instruction,
  InstructionFilters,
  INSTRUCTION_ACCOUNT_NAME,
} from '../../utils';

export const getInstructions = (
  connection: Connection,
  filters: InstructionFilters
): Observable<Document<Instruction>[]> => {
  return getProgramAccounts(connection, BULLDOZER_PROGRAM_ID, {
    commitment: connection.commitment,
    filters: encodeFilters(INSTRUCTION_ACCOUNT_NAME, filters),
  }).pipe(
    map((programAccounts) =>
      programAccounts.map(({ pubkey, account }) =>
        createInstructionDocument(pubkey, account)
      )
    )
  );
};
