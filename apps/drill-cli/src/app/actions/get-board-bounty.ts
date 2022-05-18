import { Program } from '@heavy-duty/anchor';
import { Octokit } from '@octokit/rest';
import { getBounty, getBountyVault } from '../state';
import { Drill } from '../utils/drill';

interface BoardBountyData {
	owner: string;
	repoName: string;
	issueNumber: number;
}

export const getBoardBounty = async (
	program: Program<Drill>,
	boardData: BoardBountyData
) => {
	const octokit = new Octokit();
	const { owner, repoName, issueNumber } = boardData;
	const repo = await octokit.rest.repos.get({ owner, repo: repoName });
	const boardId = repo.data.id;
	const bounty = await getBounty(program, boardId, issueNumber);

	if (bounty === null) {
		throw new Error('Board bounty not found');
	}

	const bountyBoardVault = await getBountyVault(program, boardId, issueNumber);

	return {
		boardId,
		bountyBoardVault,
		bounty,
	};
};
