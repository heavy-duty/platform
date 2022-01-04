import { Connection, PublicKey } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { getFiltersByInstruction, getProgramAccounts } from '../../operations';
import {
  Document,
  InstructionRelation,
  INSTRUCTION_RELATION_ACCOUNT_NAME,
} from '../../utils';
import { createInstructionRelationDocument } from './utils';

export const getInstructionRelationsByInstruction = (
  connection: Connection,
  instructionPublicKey: PublicKey
): Observable<Document<InstructionRelation>[]> => {
  return getProgramAccounts(connection, {
    commitment: connection.commitment,
    filters: getFiltersByInstruction(
      INSTRUCTION_RELATION_ACCOUNT_NAME,
      instructionPublicKey
    ),
  }).pipe(
    map((programAccounts) =>
      programAccounts.map(({ pubkey, account }) =>
        createInstructionRelationDocument(pubkey, account)
      )
    )
  );
};
