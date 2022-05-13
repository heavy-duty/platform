import { BN, Program } from '@heavy-duty/anchor';
import { getAccount } from '@solana/spl-token';
import { PublicKey } from '@solana/web3.js';
import { Drill } from '../utils/drill_program_poc';

export const getBoardVault = async (
  program: Program<Drill>,
  boardId: number
) => {
  const [boardPublicKey] = await PublicKey.findProgramAddress(
    [
      Buffer.from('board', 'utf8'),
      new BN(boardId).toArrayLike(Buffer, 'le', 4),
    ],
    program.programId
  );
  const [boardVaultPublicKey] = await PublicKey.findProgramAddress(
    [Buffer.from('board_vault', 'utf8'), boardPublicKey.toBuffer()],
    program.programId
  );
  return getAccount(program.provider.connection, boardVaultPublicKey);
};
