import { Connection, PublicKey } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { getFiltersByWorkspace, getProgramAccounts } from '../../operations';
import { BULLDOZER_PROGRAM_ID } from '../../programs';
import {
  Document,
  InstructionArgument,
  INSTRUCTION_ARGUMENT_ACCOUNT_NAME,
} from '../../utils';
import { createInstructionArgumentDocument } from './utils';

export const getInstructionArgumentsByWorkspace = (
  connection: Connection,
  workspacePublicKey: PublicKey
): Observable<Document<InstructionArgument>[]> => {
  return getProgramAccounts(connection, BULLDOZER_PROGRAM_ID, {
    commitment: connection.commitment,
    filters: getFiltersByWorkspace(
      INSTRUCTION_ARGUMENT_ACCOUNT_NAME,
      workspacePublicKey
    ),
  }).pipe(
    map((programAccounts) =>
      programAccounts.map(({ pubkey, account }) =>
        createInstructionArgumentDocument(pubkey, account.data)
      )
    )
  );
};
