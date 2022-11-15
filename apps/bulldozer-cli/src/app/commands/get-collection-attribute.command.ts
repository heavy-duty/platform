import { PublicKey } from '@solana/web3.js';
import { Command, CommandRunner } from 'nest-commander';
import { getCollectionAttribute } from '../state';
import {
	BulldozerLogger,
	getProgram,
	getProvider,
	getSolanaConfig
} from '../utils';

@Command({
	name: 'get-collection-attribute',
	description: 'Get everything about a given collection attribute',
	arguments: '<collection-attribute-id> <plain>',
})
export class GetCollectionAttributeCommand extends CommandRunner {
	async run(params: string[]) {
		const [collectionAttributeId, isPlain] = params;
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
			logger.log(
				`Getting collection attribute data: ${collectionAttributeId}`,
				{
					showLogs: showHumanLogs,
				}
			);

			const collectionAttribute = await getCollectionAttribute(
				program,
				new PublicKey(collectionAttributeId)
			);

			if (collectionAttribute === null) {
				logger.log(`Collection Attribute not found`, {
					showLogs: showHumanLogs,
				});
				return;
			}

			logger.log(`Collection Attribute "${collectionAttribute.name}"`, {
				showLogs: showHumanLogs,
			});
			logger.log(`Public Key: ${collectionAttribute.publicKey.toBase58()}`, {
				showLogs: showHumanLogs,
			});
			logger.log(`Authority: ${collectionAttribute.authority.toBase58()}`, {
				showLogs: showHumanLogs,
			});
			logger.log(`Workspace: ${collectionAttribute.workspace.toBase58()}`, {
				showLogs: showHumanLogs,
			});
			logger.log(`Application: ${collectionAttribute.application.toBase58()}`, {
				showLogs: showHumanLogs,
			});
			logger.log(`Collection: ${collectionAttribute.collection.toBase58()}`, {
				showLogs: showHumanLogs,
			});
			logger.log(`Kind: ${JSON.stringify(collectionAttribute.kind)}`, {
				showLogs: showHumanLogs,
			});
			logger.log(
				`Modifier: ${
					collectionAttribute.modifier !== null
						? JSON.stringify(collectionAttribute.modifier)
						: null
				}`,
				{
					showLogs: showHumanLogs,
				}
			);
			logger.log(`Created At: ${collectionAttribute.createdAt}`, {
				showLogs: showHumanLogs,
			});
			logger.log(`Updated At: ${collectionAttribute.updatedAt}`, {
				showLogs: showHumanLogs,
			});

			// Plain output
			logger.log(JSON.stringify(collectionAttribute), {
				showLogs: showPlainLogs,
			});
		} catch (error) {
			logger.error(error);
		}
	}
}
