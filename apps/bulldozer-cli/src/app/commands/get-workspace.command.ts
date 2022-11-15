import { PublicKey } from '@solana/web3.js';
import { Command, CommandRunner } from 'nest-commander';
import { getWorkspace } from '../state';
import {
	BulldozerLogger,
	getProgram,
	getProvider,
	getSolanaConfig
} from '../utils';

@Command({
	name: 'get-workspace',
	description: 'Get everything about a given workspace',
	arguments: '<workspace-id> <plain>',
})
export class GetWorkspaceCommand extends CommandRunner {
	async run(params: string[]) {
		const [workspaceId, isPlain] = params;
		const logger = new BulldozerLogger();
		const showHumanLogs = isPlain === 'undefined' ? true : !JSON.parse(isPlain);
		const showPlainLogs = isPlain === 'undefined' ? false : JSON.parse(isPlain);

		try {
			const config = await getSolanaConfig();
			const provider = await getProvider(config);
			const program = getProgram(provider);

			logger.intro({
				showLogs: showHumanLogs,
			});
			logger.log(`Getting workspace data: ${workspaceId}`, {
				showLogs: showHumanLogs,
			});

			const workspace = await getWorkspace(program, new PublicKey(workspaceId));

			if (workspace === null) {
				logger.log('Workspace does not exist.', {
					showLogs: showHumanLogs,
				});
				return;
			}

			// Human-readable output
			logger.log(`Workspace "${workspace.name}"`, {
				showLogs: showHumanLogs,
			});
			logger.log(`Public Key: ${workspace.publicKey.toBase58()}`, {
				showLogs: showHumanLogs,
			});
			logger.log(`Authority: ${workspace.authority.toBase58()}`, {
				showLogs: showHumanLogs,
			});
			logger.log(`Created At: ${workspace.createdAt}`, {
				showLogs: showHumanLogs,
			});
			logger.log(`Updated At: ${workspace.updatedAt}`, {
				showLogs: showHumanLogs,
			});
			logger.log(
				`Stats: ${workspace.quantityOfApplications} application(s) and ${workspace.quantityOfCollaborators} collaborator(s).`,
				{
					showLogs: showHumanLogs,
				}
			);

			// Plain stdout
			logger.log(JSON.stringify(workspace), {
				showLogs: showPlainLogs,
			});
		} catch (error) {
			logger.error(error);
		}
	}
}
