import { Connection, PublicKey } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { getFiltersByInstruction, getProgramAccounts } from '../../operations';
import {
  Document,
  InstructionAccount,
  INSTRUCTION_ACCOUNT_ACCOUNT_NAME,
} from '../../utils';
import { createInstructionAccountDocument } from './utils';

export const getInstructionAccountsByInstruction = (
  connection: Connection,
  instructionPublicKey: PublicKey
): Observable<Document<InstructionAccount>[]> => {
  return getProgramAccounts(connection, {
    commitment: connection.commitment,
    filters: getFiltersByInstruction(
      INSTRUCTION_ACCOUNT_ACCOUNT_NAME,
      instructionPublicKey
    ),
  }).pipe(
    map((programAccounts) =>
      programAccounts.map(({ pubkey, account }) =>
        createInstructionAccountDocument(pubkey, account)
      )
    )
  );
};
