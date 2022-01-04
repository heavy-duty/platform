import { Connection, PublicKey } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { getFiltersByInstruction, getProgramAccounts } from '../../operations';
import {
  Document,
  InstructionArgument,
  INSTRUCTION_ARGUMENT_ACCOUNT_NAME,
} from '../../utils';
import { createInstructionArgumentDocument } from './utils';

export const getInstructionArgumentsByInstruction = (
  connection: Connection,
  instructionPublicKey: PublicKey
): Observable<Document<InstructionArgument>[]> => {
  return getProgramAccounts(connection, {
    commitment: connection.commitment,
    filters: getFiltersByInstruction(
      INSTRUCTION_ARGUMENT_ACCOUNT_NAME,
      instructionPublicKey
    ),
  }).pipe(
    map((programAccounts) =>
      programAccounts.map(({ pubkey, account }) =>
        createInstructionArgumentDocument(pubkey, account)
      )
    )
  );
};
