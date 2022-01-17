import { ReactiveConnection } from '@heavy-duty/rx-solana';
import { PublicKey } from '@solana/web3.js';
import { Observable } from 'rxjs';
import {
  createInstructionDocument,
  Document,
  fromAccountChange,
  Instruction,
} from '../../utils';

export const fromInstructionChange = (
  connection: ReactiveConnection,
  publicKey: PublicKey
): Observable<Document<Instruction> | null> =>
  fromAccountChange(connection, publicKey, createInstructionDocument);
