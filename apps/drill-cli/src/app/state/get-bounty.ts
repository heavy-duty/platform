import { BN, Program } from '@heavy-duty/anchor';
import { PublicKey } from '@solana/web3.js';
import { Drill } from '../utils/drill_program_poc';

export interface Bounty {
  publicKey: PublicKey;
  boardId: number;
  bountyBump: number;
  bountyHunter: string | null;
  id: number;
  bountyVaultBump: number;
  closedAt: Date | null;
  isClosed: boolean;
}

export const getBounty = async (
  program: Program<Drill>,
  boardId: number,
  bountyId: number
): Promise<Bounty | null> => {
  const [boardPublicKey] = await PublicKey.findProgramAddress(
    [
      Buffer.from('board', 'utf8'),
      new BN(boardId).toArrayLike(Buffer, 'le', 4),
    ],
    program.programId
  );
  const [bountyPublicKey] = await PublicKey.findProgramAddress(
    [
      Buffer.from('bounty', 'utf8'),
      boardPublicKey.toBuffer(),
      new BN(bountyId).toArrayLike(Buffer, 'le', 4),
    ],
    program.programId
  );
  const bountyAccount = await program.account.bounty.fetchNullable(
    bountyPublicKey
  );

  if (bountyAccount === null) {
    return null;
  }

  return {
    publicKey: bountyPublicKey,
    boardId: bountyAccount.boardId,
    id: bountyAccount.bountyId,
    bountyBump: bountyAccount.bountyBump,
    bountyHunter: bountyAccount.bountyHunter,
    bountyVaultBump: bountyAccount.bountyVaultBump,
    closedAt: bountyAccount.closedAt
      ? new Date(bountyAccount.closedAt.toNumber() * 1000)
      : null,
    isClosed: bountyAccount.isClosed,
  };
};
