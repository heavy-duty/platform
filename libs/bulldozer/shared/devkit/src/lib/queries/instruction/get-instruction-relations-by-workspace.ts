import { Connection, PublicKey } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { getFiltersByWorkspace, getProgramAccounts } from '../../operations';
import { BULLDOZER_PROGRAM_ID } from '../../programs';
import {
  Document,
  InstructionRelation,
  INSTRUCTION_RELATION_ACCOUNT_NAME,
} from '../../utils';
import { createInstructionRelationDocument } from './utils';

export const getInstructionRelationsByWorkspace = (
  connection: Connection,
  workspacePublicKey: PublicKey
): Observable<Document<InstructionRelation>[]> => {
  return getProgramAccounts(connection, BULLDOZER_PROGRAM_ID, {
    commitment: connection.commitment,
    filters: getFiltersByWorkspace(
      INSTRUCTION_RELATION_ACCOUNT_NAME,
      workspacePublicKey
    ),
  }).pipe(
    map((programAccounts) =>
      programAccounts.map(({ pubkey, account }) =>
        createInstructionRelationDocument(pubkey, account)
      )
    )
  );
};
