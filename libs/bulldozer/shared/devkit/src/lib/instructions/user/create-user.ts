import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { defer, from, Observable } from 'rxjs';
import { getBulldozerProgram } from '../../programs';
import { CreateUserParams } from './types';

export const createUser = (
  endpoint: string,
  params: CreateUserParams
): Observable<TransactionInstruction> => {
  return defer(() =>
    from(
      getBulldozerProgram(endpoint)
        .methods.createUser(params.userDto)
        .accounts({
          authority: new PublicKey(params.authority),
        })
        .instruction() as Promise<TransactionInstruction>
    )
  );
};
