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
		const [collectionAttributeId] = params;

		const config = await getSolanaConfig();
		const provider = await getProvider(config);
		const program = getProgram(provider);

		log(`Getting collection attribute data: ${collectionAttributeId}`);

		const collectionAttribute = await getCollectionAttribute(
			program,
			new PublicKey(collectionAttributeId)
		);

		log(`Collection Attribute "${collectionAttribute.name}"`);
		log(
			`Collection Attribute Public Key: ${collectionAttribute.publicKey.toBase58()}`
		);
		log(
			`Collection Attribute Authority: ${collectionAttribute.authority.toBase58()}`
		);
		log(
			`Collection Attribute Workspace: ${collectionAttribute.workspace.toBase58()}`
		);
		log(
			`Collection Attribute Application: ${collectionAttribute.application.toBase58()}`
		);
		log(
			`Collection Attribute Collection: ${collectionAttribute.collection.toBase58()}`
		);
		log(
			`Collection Attribute Kind: ${JSON.stringify(collectionAttribute.kind)}`
		);
		log(
			`Collection Attribute Modifier: ${
				collectionAttribute.modifier !== null
					? JSON.stringify(collectionAttribute.modifier)
					: null
			}`
		);
		log(`Collection Attribute Created At: ${collectionAttribute.createdAt}`);
		log(`Collection Attribute Updated At: ${collectionAttribute.updatedAt}`);
	}
}
