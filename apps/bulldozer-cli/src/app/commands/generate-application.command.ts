import { PublicKey } from '@solana/web3.js';
import { mkdir, writeFile } from 'fs/promises';
import { Command, CommandRunner } from 'nest-commander';
import {
	ApplicationCargoGenerator,
	ApplicationCodeGenerator,
	ApplicationImportsGenerator,
	ApplicationXargoGenerator,
} from '../generators';
import { formatName, FormattedName } from '../generators/utils';
import {
	Collection,
	getApplication,
	getCollections,
	getInstructions,
	Instruction,
} from '../state';
import { getProgram, getProvider, getSolanaConfig, log } from '../utils';
import { GenerateCollectionCommand } from './generate-collection.command';
import { GenerateInstructionCommand } from './generate-instruction.command';

@Command({
	name: 'generate-application',
	description:
		'Generate the source code for a specific App in a Workspace. You need to pass two arguments, one to specify the workspace id in which you have the app you want to generate the source code. The other argument is the app id, to select the app ',
	arguments: '<application-id> <out-dir> <program-id>',
	argsDescription: {
		'application-id': '(public key) The App id which you want to select ',
		'out-dir': '(path) The path where the app will be generated',
		'program-id': '(public key) The program id for the app',
	},
})
export class GenerateApplicationCommand implements CommandRunner {
	constructor(
		private readonly _generateInstructionCommand: GenerateInstructionCommand,
		private readonly _generateCollectionCommand: GenerateCollectionCommand
	) {}

	private async generateInstructions(
		outDir: string,
		applicationName: FormattedName,
		instructions: Instruction[]
	) {
		// create instructions folder
		await mkdir(`${outDir}/${applicationName.snakeCase}/src/instructions`);

		// generate instructions/mod.rs file
		await writeFile(
			`${outDir}/${applicationName.snakeCase}/src/instructions/mod.rs`,
			ApplicationImportsGenerator.generate(
				instructions.map((instruction) => instruction.name)
			)
		);

		// generate each instruction
		await Promise.all(
			instructions.map((instruction) =>
				this._generateInstructionCommand.run([
					instruction.publicKey.toBase58(),
					`${outDir}/${applicationName.snakeCase}/src/instructions/${
						formatName(instruction.name).snakeCase
					}.rs`,
				])
			)
		);
	}

	private async generateCollections(
		outDir: string,
		applicationName: FormattedName,
		collections: Collection[]
	) {
		// create collections folder
		await mkdir(`${outDir}/${applicationName.snakeCase}/src/collections`);

		// generate collections/mod.rs file
		await writeFile(
			`${outDir}/${applicationName.snakeCase}/src/collections/mod.rs`,
			ApplicationImportsGenerator.generate(
				collections.map((collection) => collection.name)
			)
		);

		// generate each collection
		await Promise.all(
			collections.map((collection) =>
				this._generateCollectionCommand.run([
					collection.publicKey.toBase58(),
					`${outDir}/${applicationName.snakeCase}/src/collections/${
						formatName(collection.name).snakeCase
					}.rs`,
				])
			)
		);
	}

	async run(params: string[]) {
		try {
			const [applicationId, outDir, programId] = params;
			const config = await getSolanaConfig();
			const provider = await getProvider(config);
			const program = getProgram(provider);

			log(`Getting application data: ${applicationId}`);

			const application = await getApplication(
				program,
				new PublicKey(applicationId)
			);

			if (application === null) {
				throw new Error('Application not found');
			}

			const applicationInstructions =
				application.quantityOfInstructions > 0
					? await getInstructions(program, {
							application: application.publicKey.toBase58(),
					  })
					: [];

			const applicationCollections =
				application.quantityOfCollections > 0
					? await getCollections(program, {
							application: application.publicKey.toBase58(),
					  })
					: [];

			// create a folder with the application name in snake case
			await mkdir(`${outDir}/${formatName(application.name).snakeCase}`);

			// create Cargo.toml file
			await writeFile(
				`${outDir}/${formatName(application.name).snakeCase}/Cargo.toml`,
				ApplicationCargoGenerator.generate(application)
			);

			// create Xargo.toml file
			await writeFile(
				`${outDir}/${formatName(application.name).snakeCase}/Xargo.toml`,
				ApplicationXargoGenerator.generate()
			);

			// create src folder
			await mkdir(`${outDir}/${formatName(application.name).snakeCase}/src`);

			// generate lib.rs file
			await writeFile(
				`${outDir}/${formatName(application.name).snakeCase}/src/lib.rs`,
				ApplicationCodeGenerator.generate(
					application,
					applicationInstructions,
					programId
				)
			);

			await this.generateInstructions(
				outDir,
				formatName(application.name),
				applicationInstructions
			);
			await this.generateCollections(
				outDir,
				formatName(application.name),
				applicationCollections
			);
		} catch (error) {
			log(error);
		}
	}
}
