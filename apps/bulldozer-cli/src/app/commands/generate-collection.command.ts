import { PublicKey } from '@solana/web3.js';
import { Command, CommandRunner } from 'nest-commander';
import { getCollection } from '../state';
import { getCollectionAttributes } from '../state/get-collection-attributes';
import { getProgram, getProvider, getSolanaConfig, log } from '../utils';

@Command({
	name: 'generate-collection',
	description: 'Generate the source code for a collection',
	arguments: '<collection-id>',
	argsDescription: {
		'collection-id': '(public key) The collection id which you want to select',
	},
})
export class GenerateCollectionCommand implements CommandRunner {
	async run(params: string[]) {
		try {
			const [collectionId] = params;
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

			console.log({ collection, collectionAttributes });

			// Generate the collection code
		} catch (error) {
			log(error);
		}
	}
}
