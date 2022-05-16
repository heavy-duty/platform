import { PublicKey } from '@solana/web3.js';
import { Command, CommandRunner } from 'nest-commander';
import { getApplication } from '../state';
import { getProgram, getProvider, getSolanaConfig, log } from '../utils';

@Command({
	name: 'get-application',
	description: 'Get everything about a given application',
	arguments: '<application-id>',
})
export class GetApplicationCommand implements CommandRunner {
	async run(params: string[]) {
		try {
			const [applicationId] = params;
			const config = await getSolanaConfig();
			const provider = await getProvider(config);
			const program = getProgram(provider);

			log(`Getting application data: ${applicationId}`);

			const application = await getApplication(
				program,
				new PublicKey(applicationId)
			);

			if (application === null) {
				log('Application does not exist.');
				return;
			}

			log(`Application "${application.name}"`);
			log(`Public Key: ${application.publicKey.toBase58()}`);
			log(`Authority: ${application.authority.toBase58()}`);
			log(`Workspace: ${application.workspace.toBase58()}`);
			log(`Created At: ${application.createdAt}`);
			log(`Updated At: ${application.updatedAt}`);
			log(
				`Stats: ${application.quantityOfCollections} collection(s) and ${application.quantityOfInstructions} instruction(s).`
			);
		} catch (error) {
			console.error(error);
		}
	}
}
