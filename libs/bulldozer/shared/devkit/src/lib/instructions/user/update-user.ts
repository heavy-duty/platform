import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { defer, from, Observable } from 'rxjs';
import { getBulldozerProgram } from '../../programs';
import { UpdateUserParams } from './types';

export const updateUser = (
  endpoint: string,
  params: UpdateUserParams
): Observable<TransactionInstruction> => {
  return defer(() =>
    from(
      getBulldozerProgram(endpoint)
        .methods.updateUser({
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
