import { PublicKey } from '@solana/web3.js';
import { Command, CommandRunner } from 'nest-commander';
import { getCollectionAttribute } from '../state';
import { getProgram, getProvider, getSolanaConfig, log } from '../utils';

@Command({
	name: 'get-collection-attribute',
	description: 'Get everything about a given collection attribute',
	arguments: '<collection-attribute-id>',
})
export class GetCollectionAttributeCommand implements CommandRunner {
	async run(params: string[]) {
		try {
			const [collectionAttributeId] = params;

			const config = await getSolanaConfig();
			const provider = await getProvider(config);
			const program = getProgram(provider);

			log(`Getting collection attribute data: ${collectionAttributeId}`);

			const collectionAttribute = await getCollectionAttribute(
				program,
				new PublicKey(collectionAttributeId)
			);

			if (collectionAttribute === null) {
				log(`Collection Attribute not found`);
				return;
			}

			log(`Collection Attribute "${collectionAttribute.name}"`);
			log(`Public Key: ${collectionAttribute.publicKey.toBase58()}`);
			log(`Authority: ${collectionAttribute.authority.toBase58()}`);
			log(`Workspace: ${collectionAttribute.workspace.toBase58()}`);
			log(`Application: ${collectionAttribute.application.toBase58()}`);
			log(`Collection: ${collectionAttribute.collection.toBase58()}`);
			log(`Kind: ${JSON.stringify(collectionAttribute.kind)}`);
			log(
				`Modifier: ${
					collectionAttribute.modifier !== null
						? JSON.stringify(collectionAttribute.modifier)
						: null
				}`
			);
			log(`Created At: ${collectionAttribute.createdAt}`);
			log(`Updated At: ${collectionAttribute.updatedAt}`);
		} catch (error) {
			console.error(error);
		}
	}
}
