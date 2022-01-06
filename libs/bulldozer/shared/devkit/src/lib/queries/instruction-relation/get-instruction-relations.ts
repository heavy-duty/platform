import { Connection } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { encodeFilters, getProgramAccounts } from '../../operations';
import {
  Document,
  InstructionRelation,
  InstructionRelationFilters,
  INSTRUCTION_RELATION_ACCOUNT_NAME,
} from '../../utils';
import { createInstructionRelationDocument } from './utils';

export const getInstructionRelations = (
  connection: Connection,
  filters: InstructionRelationFilters
): Observable<Document<InstructionRelation>[]> => {
  return getProgramAccounts(connection, {
    commitment: connection.commitment,
    filters: encodeFilters(INSTRUCTION_RELATION_ACCOUNT_NAME, filters),
  }).pipe(
    map((programAccounts) =>
      programAccounts.map(({ pubkey, account }) =>
        createInstructionRelationDocument(pubkey, account)
      )
    )
  );
};
