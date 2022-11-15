import { PublicKey } from '@solana/web3.js';
import { writeFile } from 'fs/promises';
import { Command, CommandRunner } from 'nest-commander';
import { CollectionCodeGenerator } from '../generators/collection.generator';
import { getCollection } from '../state';
import { getCollectionAttributes } from '../state/get-collection-attributes';
import {
	BulldozerLogger,
	getProgram,
	getProvider,
	getSolanaConfig
} from '../utils';

@Command({
	name: 'generate-collection',
	description: 'Generate the source code for a collection',
	arguments: '<collection-id> <out-file> <plain>',
	argsDescription: {
		'collection-id': '(public key) The collection id which you want to select',
		'out-file': 'Path to generate the rust code',
		plain: 'Return value as string through stdout',
	},
})
export class GenerateCollectionCommand extends CommandRunner {
	async run(params: string[]) {
		const [collectionId, outFile, isPlain] = params;
		const logger = new BulldozerLogger();
		const showHumanLogs = isPlain === 'undefined' ? true : !JSON.parse(isPlain);
		const showPlainLogs = isPlain === 'undefined' ? false : JSON.parse(isPlain);
		const shouldWriteFile = outFile !== 'undefined';

		try {
			const config = await getSolanaConfig();
			const provider = await getProvider(config);
			const program = getProgram(provider);

			logger.intro({ showLogs: showHumanLogs });
			logger.log(`Getting collection data:${collectionId}`, {
				showLogs: showHumanLogs,
			});

			const collection = await getCollection(
				program,
				new PublicKey(collectionId)
			);

			if (collection === null) {
				throw new Error('Collection not found');
			}

			const collectionCode = CollectionCodeGenerator.generate(
				collection,
				await getCollectionAttributes(program, {
					collection: collection.publicKey.toBase58(),
				})
			);

			if (shouldWriteFile) {
				writeFile(outFile, collectionCode);
			}

			// Plain stdout
			logger.log(JSON.stringify(collectionCode), {
				showLogs: showPlainLogs,
			});
		} catch (error) {
			logger.log(error);
		}
	}
}
