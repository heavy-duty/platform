import { Command, CommandRunner } from 'nest-commander';
import { createBoard } from '../actions/create-board';
import { getProgram, getProvider, getSolanaConfig, log } from '../utils';

@Command({
	name: 'create-board',
	description: 'Create a new board',
	arguments: '<username/repo> <lock-time> <accepted-mint>',
})
export class CreateBoardCommand implements CommandRunner {
	async run(params: string[]) {
		const [owner, repoName] = params[0].split('/');
		const lockTime = params[1];
		const acceptedMint = params[2];

		const config = await getSolanaConfig();
		const provider = await getProvider(config);
		const program = getProgram(provider);

		log(`Creating board "${owner}/${repoName}"`);

		await createBoard(program, provider, {
			owner,
			repoName,
			lockTime,
			acceptedMint,
		});
	}
}
