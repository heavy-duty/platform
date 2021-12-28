import { PublicKey } from '@solana/web3.js';
import { defer, Observable } from 'rxjs';
import { BULLDOZER_PROGRAM_ID } from '../programs';

const SEEDS_PREFIX = 'instruction_relation';

export const findInstructionRelationAddress = (
  fromAccount: PublicKey,
  toAccount: PublicKey
): Observable<[PublicKey, number]> => {
  return defer(() =>
    PublicKey.findProgramAddress(
      [
        Buffer.from(SEEDS_PREFIX, 'utf8'),
        fromAccount.toBuffer(),
        toAccount.toBuffer(),
      ],
      BULLDOZER_PROGRAM_ID
    )
  );
};
