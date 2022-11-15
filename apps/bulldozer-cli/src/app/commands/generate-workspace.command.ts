import { Keypair, PublicKey } from '@solana/web3.js';
import { mkdir, writeFile } from 'fs/promises';
import { Command, CommandRunner, Option } from 'nest-commander';
import {
	ApplicationTestGenerator,
	WorkspaceAnchorGenerator,
	WorkspaceCargoGenerator,
	WorkspaceGitignoreGenerator,
	WorkspacePackagejsonGenerator,
	WorkspaceReadmeGenerator
} from '../generators';
import { formatName } from '../generators/utils';
import { WorkspaceTsconfigGenerator } from '../generators/workspace-tsconfig.generator';
import { getApplication, getApplications, getWorkspace } from '../state';
import { getProgram, getProvider, getSolanaConfig, log } from '../utils';
import { GenerateApplicationCommand } from './generate-application.command';

export interface GenerateWorkspace {
	singleApp?: PublicKey;
}

@Command({
	name: 'generate-workspace',
	description:
		'Generate the source code for all the Apps in a Workspace. You need to pass two arguments, one to specify the workspace id and the out directory to generate the source code.',
	arguments: '<workspace-id> <out-dir>',
	argsDescription: {
		'workspace-id': '(public key) The workspace id which you want to select',
		'out-dir': '(path) The path where the workspace will be generated',
	},
})
export class GenerateWorkspaceCommand extends CommandRunner {
	constructor(
		private readonly _generateApplicationCommand: GenerateApplicationCommand
	) {
		super();
	}

	async run(params: string[], options?: GenerateWorkspace) {
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

			let workspaceApplications;

			if (options && options.singleApp) {
				workspaceApplications = await getApplication(
					program,
					options.singleApp
				);
				log(
					`-> Single app option detected, the workspace would include only the app: ${options.singleApp}`
				);

				workspaceApplications = [workspaceApplications];
			} else {
				workspaceApplications =
					workspace.quantityOfApplications > 0
						? await getApplications(program, {
								workspace: workspace.publicKey.toBase58(),
						  })
						: [];
			}

			log('');

			if (!workspaceApplications) {
				if (options.singleApp) {
					throw new Error(
						`Single Application ${options.singleApp.toBase58()} not found. Please be sure the Application Id is correct.`
					);
				} else {
					throw new Error(
						'Applications not found. Please be sure the Workspace you want to generate has at least one App.'
					);
				}
			}

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
						'undefined',
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
			log('');
			log(`Workspace generate successfully. Output directory: ${outDir}`);
			log('');
		} catch (e) {
			log('');
			log('An error occurred while generating the workspace, try again.');
			log('');
			log(e);
			process.exit(-1);
		}
	}

	@Option({
		flags: '--single-app <app-id>',
		description: 'Generate a specific app of a given workspace.',
	})
	parseWorkspaceId(workspaceId: string): PublicKey {
		return new PublicKey(workspaceId);
	}
}
