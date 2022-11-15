import { Command, CommandRunner } from 'nest-commander';
import { setBoardAuthority } from '../actions/set-board-authority';
import {
	getProgram,
	getProvider,
	getSolanaConfig,
	log,
	processError
} from '../utils';

@Command({
	name: 'set-board-authority',
	description: 'Set a new board authority',
	arguments: '<username/repo> <pubkey-new-authority>',
})
export class SetBoardAuthorityCommand extends CommandRunner {
	async run(params: string[]) {
		try {
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
				`${newAuthority} is the new Authority of Board "${owner}/${repoName}" (${boardId}).`
			);
		} catch (e) {
			processError(e);
		}
	}
}
