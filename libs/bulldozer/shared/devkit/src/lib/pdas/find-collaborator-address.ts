import { PublicKey } from '@solana/web3.js';
import { defer, map, Observable } from 'rxjs';
import { BULLDOZER_PROGRAM_ID } from '../programs';

const SEEDS_PREFIX = 'collaborator';

export const findCollaboratorAddress = (
  workspaceId: string,
  userId: string
): Observable<[string, number]> => {
  return defer(() =>
    PublicKey.findProgramAddress(
      [
        Buffer.from(SEEDS_PREFIX, 'utf8'),
        new PublicKey(workspaceId).toBuffer(),
        new PublicKey(userId).toBuffer(),
      ],
      BULLDOZER_PROGRAM_ID
    )
  ).pipe(map(([pubkey, bump]) => [pubkey.toBase58(), bump]));
};
