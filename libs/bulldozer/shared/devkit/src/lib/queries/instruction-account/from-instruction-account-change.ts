import { ReactiveConnection } from '@heavy-duty/rx-solana';
import { PublicKey } from '@solana/web3.js';
import { Observable } from 'rxjs';
import {
  createInstructionAccountDocument,
  Document,
  fromAccountChange,
  InstructionAccount,
} from '../../utils';

export const fromInstructionAccountChange = (
  connection: ReactiveConnection,
  publicKey: PublicKey
): Observable<Document<InstructionAccount> | null> =>
  fromAccountChange(connection, publicKey, createInstructionAccountDocument);
