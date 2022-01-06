import { Connection } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { encodeFilters, getProgramAccounts } from '../../operations';
import {
  Document,
  InstructionAccount,
  InstructionAccountFilters,
  INSTRUCTION_ACCOUNT_ACCOUNT_NAME,
} from '../../utils';
import { createInstructionAccountDocument } from './utils';

export const getInstructionAccounts = (
  connection: Connection,
  filters: InstructionAccountFilters
): Observable<Document<InstructionAccount>[]> => {
  return getProgramAccounts(connection, {
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
