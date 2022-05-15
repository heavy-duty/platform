import { Program } from '@heavy-duty/anchor';
import { Octokit } from '@octokit/rest';
import { getBounty, getBountyVault } from '../state';
import { Drill } from '../utils/drill';

interface BoardBountyData {
	owner: string;
	repoName: string;
	bountyId: string;
}

export const getBoardBounty = async (
	program: Program<Drill>,
	boardData: BoardBountyData
) => {
	const octokit = new Octokit();
	const { owner, repoName, bountyId } = boardData;
	const repo = await octokit.rest.repos.get({ owner, repo: repoName });
	const boardId = repo.data.id;
	const bounty = await getBounty(program, boardId, parseInt(bountyId));

	if (bounty === null) {
		throw new Error('Board bounty not found');
	}

	const bountyBoardVault = await getBountyVault(
		program,
		boardId,
		parseInt(bountyId)
	);

	return {
		boardId,
		bountyBoardVault,
		bounty,
	};
};
