import { PublicKey } from '@solana/web3.js';
import { Command, CommandRunner } from 'nest-commander';
import { getCollection } from '../state';
import { getProgram, getProvider, getSolanaConfig, log } from '../utils';

@Command({
	name: 'get-collection',
	description: 'Get everything about a given collection',
	arguments: '<collection-id>',
	argsDescription: {
		'collection-id': '(public key) The collection id which you want to get',
	},
})
export class GetCollectionCommand implements CommandRunner {
	async run(params: string[]) {
		try {
			const [collectionId] = params;

			const config = await getSolanaConfig();
			const provider = await getProvider(config);
			const program = getProgram(provider);

			log(`Getting collection data: ${collectionId}`);

			const collection = await getCollection(
				program,
				new PublicKey(collectionId)
			);

			if (collection === null) {
				log(`Collection not found`);
				return;
			}

			log(`Collection "${collection.name}"`);
			log(`Public Key: ${collection.publicKey.toBase58()}`);
			log(`Authority: ${collection.authority.toBase58()}`);
			log(`Workspace: ${collection.workspace.toBase58()}`);
			log(`Application: ${collection.application.toBase58()}`);
			log(`Created At: ${collection.createdAt}`);
			log(`Updated At: ${collection.updatedAt}`);
			log(`Stats: ${collection.quantityOfAttributes} attribute(s).`);
		} catch (error) {
			console.error(error);
		}
	}
}
