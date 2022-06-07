import { Command, CommandRunner } from 'nest-commander';
import { getBoardInfo } from '../actions/get-board-info';
import {
	getProgram,
	getProvider,
	getSolanaConfig,
	log,
	processError,
} from '../utils';

@Command({
	name: 'get-board',
	description: 'Get board info',
	arguments: '<username/repo>',
})
export class GetBoardCommand implements CommandRunner {
	async run(params: string[]) {
		try {
			const [owner, repoName] = params[0].split('/');

			const config = await getSolanaConfig();
			const provider = await getProvider(config);
			const program = getProgram(provider);

			log(`Getting board data: "${owner}/${repoName}"`);
			log('');

			const { board, boardId, boardVault } = await getBoardInfo(program, {
				owner,
				repoName,
			});

			log(`Board: "${owner}/${repoName}" (${boardId})`);
			log(`Board Public Key: ${board.publicKey}`);
			log(`Authority: ${board.authority}`);
			log(`Accepted Mint: ${board.acceptedMint}`);
			log(`Lock Time (ms): ${board.lockTime.toString()}`);
			log(`Board Bump: ${board.boardBump}`);
			log(`Board Vault ATA: ${boardVault.address.toBase58()}`);
			log(`Board Vault Amount: ${boardVault.amount.toString()}`);
			log(`Board Vault Bump: ${board.boardVaultBump}`);
		} catch (e) {
			processError(e);
		}
	}
}
