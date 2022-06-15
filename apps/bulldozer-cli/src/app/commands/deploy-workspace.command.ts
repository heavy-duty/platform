import { PublicKey } from '@solana/web3.js';
import { Command, CommandRunner } from 'nest-commander';
import { getWorkspace } from '../state';
import {
	anchorDeploy,
	CommandResponse,
	getProgram,
	getProvider,
	getSolanaConfig,
	log,
} from '../utils';
import { GenerateWorkspaceCommand } from './generate-workspace.command';

@Command({
	name: 'deploy-workspace',
	description:
		'Generate the source code for all the Apps in a Workspace, build and deploy them using Anchor Build command under the hood. You need to pass two arguments, one to specify the workspace id in which you have the apps you want to deploy.',
	arguments: '<workspace-id> <out-dir>',
	argsDescription: {
		'workspace-id': '(public key) The workspace id which you want to select',
		'out-dir':
			'(path) The path where the workspace will be generated and deployed',
	},
})
export class DeployWorkspaceCommand implements CommandRunner {
	constructor(
		private readonly _generateWorkspaceCommand: GenerateWorkspaceCommand
	) {}

	async run(params: string[]) {
		try {
			const [workspaceId, outDir] = params;
			const config = await getSolanaConfig();
			const provider = await getProvider(config);
			const program = getProgram(provider);

			log(`Deploying >> Workspace ID: ${workspaceId}`);

			const workspace = await getWorkspace(program, new PublicKey(workspaceId));
			await this._generateWorkspaceCommand.run([
				workspace.publicKey.toBase58(),
				`${outDir}`,
			]);

			const deployStatus = anchorDeploy(workspace, outDir);

			if (deployStatus === CommandResponse.success) {
				log('Deploy successfully');
			} else if (deployStatus === CommandResponse.error) {
				log('Something went wrong');
			}
		} catch (e) {
			log('An error occured while deploying, try again');
			log('');
			log(e);
		}
	}
}
