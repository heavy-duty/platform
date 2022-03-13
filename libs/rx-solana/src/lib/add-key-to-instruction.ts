import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { map, Observable } from 'rxjs';

export const addKeyToInstruction =
  (id: string, isWritable?: boolean, isSigner?: boolean) =>
  (
    source: Observable<TransactionInstruction>
  ): Observable<TransactionInstruction> =>
    source.pipe(
      map((instruction) => ({
        ...instruction,
        keys: [
          ...instruction.keys,
          {
            pubkey: new PublicKey(id),
            isWritable: isWritable ?? false,
            isSigner: isSigner ?? false,
          },
        ],
      }))
    );
