import { Command, CommandRunner } from 'nest-commander';
import { setBoardAuthority } from '../actions/set-board-authority';
import { getProgram, getProvider, getSolanaConfig, log } from '../utils';

export interface GetBoardCommandOptions {
	repo?: string;
	lockTime?: string;
	acceptedMint?: string;
}

@Command({
	name: 'set-board-authority',
	description: 'Set a new board authority',
	arguments: '<username/repo/bountyId>',
})
export class SetBoardAuthorityCommand implements CommandRunner {
	async run(params: string[], options?: GetBoardCommandOptions) {
		const [owner, repoName] = params[0].split('/');
		const newAuthority = params[1];

		const config = await getSolanaConfig();
		const provider = await getProvider(config);
		const program = getProgram(provider);

		log(`Setting board authority`);

		const { boardId } = await setBoardAuthority(program, provider, {
			owner,
			repoName,
			newAuthority,
		});

		log(
			`${newAuthority} is the new Auhority of Board "${owner}/${repoName}" (${boardId}).`
		);
	}
}
