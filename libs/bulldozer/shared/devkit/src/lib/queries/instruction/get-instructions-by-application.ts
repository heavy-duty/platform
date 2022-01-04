import { Connection, PublicKey } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { getFiltersByApplication, getProgramAccounts } from '../../operations';
import { Document, Instruction, INSTRUCTION_ACCOUNT_NAME } from '../../utils';
import { createInstructionDocument } from './utils';

export const getInstructionsByApplication = (
  connection: Connection,
  applicationPublicKey: PublicKey
): Observable<Document<Instruction>[]> => {
  return getProgramAccounts(connection, {
    commitment: connection.commitment,
    filters: getFiltersByApplication(
      INSTRUCTION_ACCOUNT_NAME,
      applicationPublicKey
    ),
  }).pipe(
    map((programAccounts) =>
      programAccounts.map(({ pubkey, account }) =>
        createInstructionDocument(pubkey, account)
      )
    )
  );
};
