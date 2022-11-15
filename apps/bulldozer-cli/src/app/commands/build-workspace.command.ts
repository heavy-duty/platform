import { PublicKey } from '@solana/web3.js';
import { Command, CommandRunner, Option } from 'nest-commander';
import { formatName } from '../generators/utils';
import { getWorkspace } from '../state';
import {
	anchorBuild,
	CommandResponse,
	getProgram,
	getProvider,
	getSolanaConfig,
	log
} from '../utils';
import {
	GenerateWorkspace,
	GenerateWorkspaceCommand
} from './generate-workspace.command';

@Command({
	name: 'build-workspace',
	description:
		'Generate the source code for all the Apps in a Workspace and build them using Anchor Build command under the hood. You need to pass only one argument to specify the workspace id in which you have the apps you want to generate the source code and build into a binary.',
	arguments: '<workspace-id> <out-dir>',
	argsDescription: {
		'workspace-id': '(public key) The workspace id which you want to select',
		'out-dir':
			'(path) The path where the workspace will be generated and deployed',
	},
})
export class BuildWorkspaceCommand extends CommandRunner {
	constructor(
		private readonly _generateWorkspaceCommand: GenerateWorkspaceCommand
	) {
		super();
	}

	async run(params: string[], options?: GenerateWorkspace) {
		try {
			const [workspaceId, outDir] = params;
			const config = await getSolanaConfig();
			const provider = await getProvider(config);
			const program = getProgram(provider);

			log(`Building Workspace - ID: ${workspaceId}`);
			log('');

			const workspace = await getWorkspace(program, new PublicKey(workspaceId));

			if (workspace === null) {
				throw new Error('Workspace not found');
			}

			if (options && options.singleApp) {
				await this._generateWorkspaceCommand.run(
					[workspace.publicKey.toBase58(), `${outDir}`],
					options
				);
			} else {
				await this._generateWorkspaceCommand.run([
					workspace.publicKey.toBase58(),
					`${outDir}`,
				]);
			}

			log('');
			const buildStatus = anchorBuild(workspace, outDir);

			if (buildStatus === CommandResponse.success) {
				log(
					`Build successfully. The location is: ${outDir}/${
						formatName(workspace.name).snakeCase
					}`
				);
			} else if (buildStatus === CommandResponse.error) {
				log('Something went wrong');
			}
		} catch (e) {
			log('');
			log('An error occurred while building the workspace, try again.');
			log('');
			log(e);
			process.exit(-1);
		}
	}

	@Option({
		flags: '--single-app <app-id>',
		description: 'Build the workspace only with a specific app.',
	})
	parseWorkspaceId(workspaceId: string): PublicKey {
		return new PublicKey(workspaceId);
	}
}
