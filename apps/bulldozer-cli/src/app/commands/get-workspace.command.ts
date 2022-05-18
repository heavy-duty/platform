import { PublicKey } from '@solana/web3.js';
import { Command, CommandRunner } from 'nest-commander';
import { getWorkspace } from '../state';
import { getProgram, getProvider, getSolanaConfig, log } from '../utils';

@Command({
	name: 'get-workspace',
	description: 'Get everything about a given workspace',
	arguments: '<workspace-id>',
})
export class GetWorkspaceCommand implements CommandRunner {
	async run(params: string[]) {
		try {
			const [workspaceId] = params;
			const config = await getSolanaConfig();
			const provider = await getProvider(config);
			const program = getProgram(provider);

			log(`Getting workspace data: ${workspaceId}`);

			const workspace = await getWorkspace(program, new PublicKey(workspaceId));

			if (workspace === null) {
				log('Workspace does not exist.');
				return;
			}

			log(`Workspace "${workspace.name}"`);
			log(`Public Key: ${workspace.publicKey.toBase58()}`);
			log(`Authority: ${workspace.authority.toBase58()}`);
			log(`Created At: ${workspace.createdAt}`);
			log(`Updated At: ${workspace.updatedAt}`);
			log(
				`Stats: ${workspace.quantityOfApplications} application(s) and ${workspace.quantityOfCollaborators} collaborator(s).`
			);
		} catch (error) {
			console.error(error);
		}
	}
}
