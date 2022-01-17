import { getProgramAccounts } from '@heavy-duty/rx-solana';
import { Connection } from '@solana/web3.js';
import { map, Observable } from 'rxjs';
import {
  BULLDOZER_PROGRAM_ID,
  createInstructionAccountDocument,
  Document,
  encodeFilters,
  InstructionAccount,
  InstructionAccountFilters,
  INSTRUCTION_ACCOUNT_ACCOUNT_NAME,
} from '../../utils';

export const getInstructionAccounts = (
  connection: Connection,
  filters: InstructionAccountFilters
): Observable<Document<InstructionAccount>[]> => {
  return getProgramAccounts(connection, BULLDOZER_PROGRAM_ID, {
    commitment: connection.commitment,
    filters: encodeFilters(INSTRUCTION_ACCOUNT_ACCOUNT_NAME, filters),
  }).pipe(
    map((programAccounts) =>
      programAccounts.map(({ pubkey, account }) =>
        createInstructionAccountDocument(pubkey, account)
      )
    )
  );
};
