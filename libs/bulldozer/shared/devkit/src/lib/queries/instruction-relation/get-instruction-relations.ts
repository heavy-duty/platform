import { getProgramAccounts } from '@heavy-duty/rx-solana';
import { Connection } from '@solana/web3.js';
import { map, Observable } from 'rxjs';
import {
  BULLDOZER_PROGRAM_ID,
  createInstructionRelationRelation,
  encodeFilters,
  InstructionRelation,
  InstructionRelationFilters,
  INSTRUCTION_RELATION_ACCOUNT_NAME,
  Relation,
} from '../../utils';

export const getInstructionRelations = (
  connection: Connection,
  filters: InstructionRelationFilters
): Observable<Relation<InstructionRelation>[]> => {
  return getProgramAccounts(connection, BULLDOZER_PROGRAM_ID, {
    commitment: connection.commitment,
    filters: encodeFilters(INSTRUCTION_RELATION_ACCOUNT_NAME, filters),
  }).pipe(
    map((programAccounts) =>
      programAccounts.map(({ pubkey, account }) =>
        createInstructionRelationRelation(pubkey, account)
      )
    )
  );
};
