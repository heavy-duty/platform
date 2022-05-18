import { Keypair, PublicKey } from '@solana/web3.js';
import { mkdir, writeFile } from 'fs/promises';
import { Command, CommandRunner } from 'nest-commander';
import {
	ApplicationTestGenerator,
	WorkspaceAnchorGenerator,
	WorkspaceCargoGenerator,
	WorkspaceGitignoreGenerator,
	WorkspacePackagejsonGenerator,
	WorkspaceReadmeGenerator,
} from '../generators';
import { formatName } from '../generators/utils';
import { WorkspaceTsconfigGenerator } from '../generators/workspace-tsconfig.generator';
import { getApplications, getWorkspace } from '../state';
import { getProgram, getProvider, getSolanaConfig, log } from '../utils';
import { GenerateApplicationCommand } from './generate-application.command';

@Command({
	name: 'generate-workspace',
	description:
		'Generate the source code for all the Apps in a Workspace. You need to pass only one argument to specify the workspace id in which you have the app you want to generate the source code.',
	arguments: '<workspace-id> <out-dir>',
	argsDescription: {
		'workspace-id': '(public key) The workspace id which you want to select',
		'out-dir': '(path) The path where the workspace will be generated',
	},
})
export class GenerateWorkspaceCommand implements CommandRunner {
	constructor(
		private readonly _generateApplicationCommand: GenerateApplicationCommand
	) {}

	async run(params: string[]) {
		try {
			const [workspaceId, outDir] = params;
			const config = await getSolanaConfig();
			const provider = await getProvider(config);
			const program = getProgram(provider);

			log(`Getting workspace data: ${workspaceId}`);

			const workspace = await getWorkspace(program, new PublicKey(workspaceId));

			if (workspace === null) {
				throw new Error('Workspace not found');
			}

			const workspaceApplications =
				workspace.quantityOfApplications > 0
					? await getApplications(program, {
							workspace: workspace.publicKey.toBase58(),
					  })
					: [];
			const applicationsProgramKeypairs = workspaceApplications.map(() =>
				Keypair.generate()
			);

			// create a workspace folder
			await mkdir(`${outDir}/${formatName(workspace.name).snakeCase}`);

			// create a programs folder
			await mkdir(`${outDir}/${formatName(workspace.name).snakeCase}/programs`);
			// generate each application
			await Promise.all(
				workspaceApplications.map((application, index) =>
					this._generateApplicationCommand.run([
						application.publicKey.toBase58(),
						`${outDir}/${formatName(workspace.name).snakeCase}/programs`,
						applicationsProgramKeypairs[index].publicKey.toBase58(),
					])
				)
			);

			// create a tests folder
			await mkdir(`${outDir}/${formatName(workspace.name).snakeCase}/tests`);
			// create a spec file per application
			await Promise.all(
				workspaceApplications.map((application, index) =>
					writeFile(
						`${outDir}/${formatName(workspace.name).snakeCase}/tests/${
							formatName(application.name).kebabCase
						}.spec.ts`,
						ApplicationTestGenerator.generate(
							application,
							applicationsProgramKeypairs[index].publicKey.toBase58()
						)
					)
				)
			);

			// create .gitignore file
			await writeFile(
				`${outDir}/${formatName(workspace.name).snakeCase}/.gitignore`,
				WorkspaceGitignoreGenerator.generate()
			);
			// Anchor.toml
			await writeFile(
				`${outDir}/${formatName(workspace.name).snakeCase}/Anchor.toml`,
				WorkspaceAnchorGenerator.generate(
					workspaceApplications,
					applicationsProgramKeypairs.map((keypair) => keypair.publicKey)
				)
			);
			// Cargo.toml
			await writeFile(
				`${outDir}/${formatName(workspace.name).snakeCase}/Cargo.toml`,
				WorkspaceCargoGenerator.generate()
			);
			// tsconfig
			await writeFile(
				`${outDir}/${formatName(workspace.name).snakeCase}/tsconfig.json`,
				WorkspaceTsconfigGenerator.generate()
			);
			// README
			await writeFile(
				`${outDir}/${formatName(workspace.name).snakeCase}/README.md`,
				WorkspaceReadmeGenerator.generate(workspace)
			);
			// Package.json
			await writeFile(
				`${outDir}/${formatName(workspace.name).snakeCase}/package.json`,
				WorkspacePackagejsonGenerator.generate()
			);

			// create deploy folder
			await mkdir(`${outDir}/${formatName(workspace.name).snakeCase}/target`);
			await mkdir(
				`${outDir}/${formatName(workspace.name).snakeCase}/target/deploy`
			);
			//	store each keypair in a separate file
			await Promise.all(
				workspaceApplications.map((application, index) =>
					writeFile(
						`${outDir}/${formatName(workspace.name).snakeCase}/target/deploy/${
							formatName(application.name).snakeCase
						}-keypair.json`,
						`[${applicationsProgramKeypairs[index].secretKey.toString()}]`
					)
				)
			);
		} catch (error) {
			log(error);
		}
	}
}
