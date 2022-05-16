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
		log(`Collection Public Key: ${collection.publicKey.toBase58()}`);
		log(`Collection Authority: ${collection.authority.toBase58()}`);
		log(`Collection Workspace: ${collection.workspace.toBase58()}`);
		log(`Collection Application: ${collection.application.toBase58()}`);
		log(`Collection Created At: ${collection.createdAt}`);
		log(`Collection Updated At: ${collection.updatedAt}`);
		log(`Collection Stats: ${collection.quantityOfAttributes} attribute(s).`);
	}
}
