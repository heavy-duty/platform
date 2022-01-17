import { getAccountInfo } from '@heavy-duty/rx-solana';
import { Connection, PublicKey } from '@solana/web3.js';
import { map, Observable } from 'rxjs';
import { createInstructionDocument, Document, Instruction } from '../../utils';

export const getInstruction = (
  connection: Connection,
  instructionPublicKey: PublicKey
): Observable<Document<Instruction> | null> => {
  return getAccountInfo(connection, instructionPublicKey).pipe(
    map(
      (account) =>
        account && createInstructionDocument(instructionPublicKey, account)
    )
  );
};
