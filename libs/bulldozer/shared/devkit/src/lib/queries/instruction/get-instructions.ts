import { Connection } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { encodeFilters, getProgramAccounts } from '../../operations';
import {
  Document,
  Instruction,
  InstructionFilters,
  INSTRUCTION_ACCOUNT_NAME,
} from '../../utils';
import { createInstructionDocument } from './utils';

export const getInstructions = (
  connection: Connection,
  filters: InstructionFilters
): Observable<Document<Instruction>[]> => {
  return getProgramAccounts(connection, {
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
