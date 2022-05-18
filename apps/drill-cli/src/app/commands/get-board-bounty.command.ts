import { Command, CommandRunner } from 'nest-commander';
import { getBoardBounty } from '../actions/get-board-bounty';
import { getProgram, getProvider, getSolanaConfig, log } from '../utils';

@Command({
	name: 'get-bounty',
	description: 'Get board bounty',
	arguments: '<github-repository> <issue-number>',
})
export class GetBoardBountyCommand implements CommandRunner {
	async run(params: string[]) {
		const [owner, repoName] = params[0].split('/');
		const issueNumber = parseInt(params[1]);

		const config = await getSolanaConfig();
		const provider = await getProvider(config);
		const program = getProgram(provider);

		log(`Getting board bounty "${owner}/${repoName}/${issueNumber}"`);

		const { boardId, bounty, bountyBoardVault } = await getBoardBounty(
			program,
			{
				owner,
				repoName,
				issueNumber,
			}
		);

		log(`Bounty: ${owner}/${repoName}/${boardId} (${issueNumber})`);
		log(`Bounty Public Key: ${bounty.publicKey}`);
		log(`Bounty Bump: ${bounty.bountyBump}`);
		log(`Bounty Hunter: ${bounty.bountyHunter}`);
		log(`Bounty Vault ATA: ${bountyBoardVault.address.toBase58()}`);
		log(`Bounty Vault Amount: ${bountyBoardVault.amount.toString()}`);
		log(`Bounty Vault Bump: ${bounty.bountyVaultBump}`);
		if (bounty.isClosed) {
			log(`Bounty Closed At: ${bounty.closedAt}`);
		}
	}
}
