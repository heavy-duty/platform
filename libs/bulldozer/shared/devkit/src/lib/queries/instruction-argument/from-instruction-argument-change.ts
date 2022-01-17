import { ReactiveConnection } from '@heavy-duty/rx-solana';
import { PublicKey } from '@solana/web3.js';
import { Observable } from 'rxjs';
import {
  createInstructionArgumentDocument,
  Document,
  fromAccountChange,
  InstructionArgument,
} from '../../utils';

export const fromInstructionArgumentChange = (
  connection: ReactiveConnection,
  publicKey: PublicKey
): Observable<Document<InstructionArgument> | null> =>
  fromAccountChange(connection, publicKey, createInstructionArgumentDocument);
