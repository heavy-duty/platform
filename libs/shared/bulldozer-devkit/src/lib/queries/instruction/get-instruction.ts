import { Connection, PublicKey } from '@solana/web3.js';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { getAccountInfo } from '../../operations';
import { Document, Instruction } from '../../utils';
import { createInstructionDocument } from './utils';

export const getInstruction = (
  connection: Connection,
  collectionPublicKey: PublicKey
): Observable<Document<Instruction> | null> => {
  return getAccountInfo(connection, collectionPublicKey).pipe(
    map(
      (account) =>
        account && createInstructionDocument(collectionPublicKey, account.data)
    )
  );
};
