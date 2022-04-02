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
        .methods.createUser({
          name: params.name,
          thumbnailUrl: params.thumbnailUrl,
          userName: params.userName,
        })
        .accounts({
          authority: new PublicKey(params.authority),
        })
        .instruction() as Promise<TransactionInstruction>
    )
  );
};
