import { AnchorProvider, Program } from '@heavy-duty/anchor';
import { Octokit } from '@octokit/rest';
import { PublicKey } from '@solana/web3.js';
import { Drill } from '../utils/drill';

interface BoardAuthorityData {
	owner: string;
	repoName: string;
	newAuthority: string;
}

export const setBoardAuthority = async (
	program: Program<Drill>,
	provider: AnchorProvider,
	boardData: BoardAuthorityData
) => {
	const octokit = new Octokit();
	const { owner, repoName, newAuthority } = boardData;
	const repo = await octokit.rest.repos.get({ owner, repo: repoName });
	const boardId = repo.data.id;

	await program.methods
		.setBoardAuthority(boardId)
		.accounts({
			authority: provider.wallet.publicKey,
			newAuthority: new PublicKey(newAuthority),
		})
		.rpc();

	return {
		boardId,
	};
};
