import { BN, Program } from '@heavy-duty/anchor';
import { PublicKey } from '@solana/web3.js';
import { Drill } from '../utils/drill';

export interface Board {
  id: number;
  publicKey: PublicKey;
  authority: PublicKey;
  acceptedMint: PublicKey;
  lockTime: BN;
  boardBump: number;
  boardVaultBump: number;
}

export const getBoard = async (
  program: Program<Drill>,
  boardId: number
): Promise<Board | null> => {
  const [boardPublicKey] = await PublicKey.findProgramAddress(
    [
      Buffer.from('board', 'utf8'),
      new BN(boardId).toArrayLike(Buffer, 'le', 4),
    ],
    program.programId
  );
  const boardAccount = await program.account.board.fetchNullable(
    boardPublicKey
  );

  if (boardAccount === null) {
    return null;
  }

  return {
    id: boardId,
    publicKey: boardPublicKey,
    acceptedMint: boardAccount.acceptedMint,
    authority: boardAccount.authority,
    lockTime: boardAccount.lockTime,
    boardBump: boardAccount.boardBump,
    boardVaultBump: boardAccount.boardVaultBump,
  };
};
