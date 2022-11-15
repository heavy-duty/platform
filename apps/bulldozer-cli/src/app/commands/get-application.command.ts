import { PublicKey } from '@solana/web3.js';
import { Command, CommandRunner } from 'nest-commander';
import { getApplication } from '../state';
import {
	BulldozerLogger,
	getProgram,
	getProvider,
	getSolanaConfig
} from '../utils';

@Command({
	name: 'get-application',
	description: 'Get everything about a given application',
	arguments: '<application-id> <plain>',
})
export class GetApplicationCommand extends CommandRunner {
	async run(params: string[]) {
		const [applicationId, isPlain] = params;
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
			logger.log(`Getting application data: ${applicationId}`, {
				showLogs: showHumanLogs,
			});

			const application = await getApplication(
				program,
				new PublicKey(applicationId)
			);

			if (application === null) {
				logger.log('Application does not exist.', { showLogs: showHumanLogs });
				return;
			}

			// Human-readable logs
			logger.log(`Application "${application.name}"`, {
				showLogs: showHumanLogs,
			});
			logger.log(`Public Key: ${application.publicKey.toBase58()}`, {
				showLogs: showHumanLogs,
			});
			logger.log(`Authority: ${application.authority.toBase58()}`, {
				showLogs: showHumanLogs,
			});
			logger.log(`Workspace: ${application.workspace.toBase58()}`, {
				showLogs: showHumanLogs,
			});
			logger.log(`Created At: ${application.createdAt}`, {
				showLogs: showHumanLogs,
			});
			logger.log(`Updated At: ${application.updatedAt}`, {
				showLogs: showHumanLogs,
			});
			logger.log(
				`Stats: ${application.quantityOfCollections} collection(s) and ${application.quantityOfInstructions} instruction(s).`,
				{ showLogs: showHumanLogs }
			);

			// Plain stdout
			logger.log(JSON.stringify(application), {
				showLogs: showPlainLogs,
			});
		} catch (error) {
			logger.error(error);
		}
	}
}
