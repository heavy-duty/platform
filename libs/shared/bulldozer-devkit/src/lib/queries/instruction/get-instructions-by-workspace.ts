import { Connection, PublicKey } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { getFiltersByWorkspace, getProgramAccounts } from '../../operations';
import { BULLDOZER_PROGRAM_ID } from '../../programs';
import { Document, Instruction, INSTRUCTION_ACCOUNT_NAME } from '../../utils';
import { createInstructionDocument } from './utils';

export const getInstructionsByWorkspace = (
  connection: Connection,
  workspacePublicKey: PublicKey
): Observable<Document<Instruction>[]> => {
  return getProgramAccounts(connection, BULLDOZER_PROGRAM_ID, {
    commitment: connection.commitment,
    filters: getFiltersByWorkspace(
      INSTRUCTION_ACCOUNT_NAME,
      workspacePublicKey
    ),
  }).pipe(
    map((programAccounts) =>
      programAccounts.map(({ pubkey, account }) =>
        createInstructionDocument(pubkey, account.data)
      )
    )
  );
};
