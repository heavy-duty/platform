import { BN, Program } from '@heavy-duty/anchor';
import { Account, getAccount } from '@solana/spl-token';
import { PublicKey } from '@solana/web3.js';
import { Drill } from '../utils/drill';

export const getBountyVault = async (
  program: Program<Drill>,
  boardId: number,
  bountyId: number
): Promise<Account> => {
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
  const [bountyVaultPublicKey] = await PublicKey.findProgramAddress(
    [Buffer.from('bounty_vault', 'utf8'), bountyPublicKey.toBuffer()],
    program.programId
  );
  return getAccount(program.provider.connection, bountyVaultPublicKey);
};
