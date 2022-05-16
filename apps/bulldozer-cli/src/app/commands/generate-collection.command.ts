import { PublicKey } from '@solana/web3.js';
import { writeFile } from 'fs/promises';
import { Command, CommandRunner } from 'nest-commander';
import { CollectionCodeGenerator } from '../generators/collection.generator';
import { getCollection } from '../state';
import { getCollectionAttributes } from '../state/get-collection-attributes';
import { getProgram, getProvider, getSolanaConfig, log } from '../utils';

@Command({
	name: 'generate-collection',
	description: 'Generate the source code for a collection',
	arguments: '<collection-id> <out-file>',
	argsDescription: {
		'collection-id': '(public key) The collection id which you want to select',
		'out-file': 'Path to generate the rust code',
	},
})
export class GenerateCollectionCommand implements CommandRunner {
	async run(params: string[]) {
		try {
			const [collectionId, outFile] = params;
			const config = await getSolanaConfig();
			const provider = await getProvider(config);
			const program = getProgram(provider);

			log(`Getting collection data:${collectionId}`);

			const collection = await getCollection(
				program,
				new PublicKey(collectionId)
			);

			if (collection === null) {
				throw new Error('Collection not found');
			}

			const collectionAttributes =
				collection.quantityOfAttributes > 0
					? await getCollectionAttributes(program, {
							collection: collection.publicKey.toBase58(),
					  })
					: [];

			writeFile(
				outFile,
				CollectionCodeGenerator.generate(collection, collectionAttributes)
			);
		} catch (error) {
			log(error);
		}
	}
}
