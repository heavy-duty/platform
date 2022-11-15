import { PublicKey } from '@solana/web3.js';
import { Command, CommandRunner } from 'nest-commander';
import { getCollection } from '../state';
import {
	BulldozerLogger,
	getProgram,
	getProvider,
	getSolanaConfig
} from '../utils';

@Command({
	name: 'get-collection',
	description: 'Get everything about a given collection',
	arguments: '<collection-id> <plain>',
	argsDescription: {
		'collection-id': '(public key) The collection id which you want to get',
	},
})
export class GetCollectionCommand extends CommandRunner {
	async run(params: string[]) {
		const [collectionId, isPlain] = params;
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
			logger.log(`Getting collection data: ${collectionId}`, {
				showLogs: showHumanLogs,
			});

			const collection = await getCollection(
				program,
				new PublicKey(collectionId)
			);

			if (collection === null) {
				logger.log(`Collection not found`, { showLogs: showHumanLogs });
				return;
			}

			// Human-readable output
			logger.log(`Collection "${collection.name}"`, {
				showLogs: showHumanLogs,
			});
			logger.log(`Public Key: ${collection.publicKey.toBase58()}`, {
				showLogs: showHumanLogs,
			});
			logger.log(`Authority: ${collection.authority.toBase58()}`, {
				showLogs: showHumanLogs,
			});
			logger.log(`Workspace: ${collection.workspace.toBase58()}`, {
				showLogs: showHumanLogs,
			});
			logger.log(`Application: ${collection.application.toBase58()}`, {
				showLogs: showHumanLogs,
			});
			logger.log(`Created At: ${collection.createdAt}`, {
				showLogs: showHumanLogs,
			});
			logger.log(`Updated At: ${collection.updatedAt}`, {
				showLogs: showHumanLogs,
			});
			logger.log(`Stats: ${collection.quantityOfAttributes} attribute(s).`, {
				showLogs: showHumanLogs,
			});

			// Plain output
			logger.log(JSON.stringify(collection), {
				showLogs: showPlainLogs,
			});
		} catch (error) {
			console.error(error);
		}
	}
}
