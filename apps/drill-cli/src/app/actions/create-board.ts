import { AnchorProvider, BN, Program } from '@heavy-duty/anchor';
import { Octokit } from '@octokit/rest';
import { PublicKey } from '@solana/web3.js';
import { Drill } from '../utils/drill';

interface BoardData {
  owner: string;
  repoName: string;
  lockTime: string;
  acceptedMint: string;
}

export const createBoard = async (
  program: Program<Drill>,
  provider: AnchorProvider,
  boardData: BoardData
) => {
  try {
    const octokit = new Octokit();
    const { owner, repoName, lockTime, acceptedMint } = boardData;
    const repo = await octokit.rest.repos.get({ owner, repo: repoName });
    const boardId = repo.data.id;

    return await program.methods
      .initializeBoard(boardId, new BN(lockTime))
      .accounts({
        acceptedMint: new PublicKey(acceptedMint),
        authority: provider.wallet.publicKey,
      })
      .rpc();
  } catch (e) {
    console.log('Something go wrong: ', e);
    throw e;
  }
};
