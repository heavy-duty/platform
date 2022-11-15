import { Program } from '@heavy-duty/anchor';
import { PublicKey } from '@solana/web3.js';
import { mkdir, writeFile } from 'fs/promises';
import { Command, CommandRunner } from 'nest-commander';
import {
	ApplicationCargoGenerator,
	ApplicationCodeGenerator,
	ApplicationImportsGenerator,
	ApplicationXargoGenerator,
	InstructionCodeGenerator
} from '../generators';
import { CollectionCodeGenerator } from '../generators/collection.generator';
import { formatName } from '../generators/utils';
import {
	getApplication,
	getCollectionAttributes,
	getCollections,
	getInstructionAccounts,
	getInstructionArguments,
	getInstructionRelations,
	getInstructions,
	Instruction
} from '../state';
import {
	Bulldozer,
	BulldozerLogger,
	getProgram,
	getProvider,
	getSolanaConfig
} from '../utils';

@Command({
	name: 'generate-application',
	description:
		'Generate the source code for a specific App in a Workspace. You need to pass two arguments, one to specify the workspace id in which you have the app you want to generate the source code. The other argument is the app id, to select the app ',
	arguments: '<application-id> <out-dir> <program-id> <plain>',
	argsDescription: {
		'application-id': '(public key) The App id which you want to select ',
		'out-dir': '(path) The path where the app will be generated',
		'program-id': '(public key) The program id for the app',
		plain: 'Return value as string through stdout',
	},
})
export class GenerateApplicationCommand extends CommandRunner {
	private async getAppDependencies(
		program: Program<Bulldozer>,
		instructions: Instruction[]
	): Promise<string[]> {
		const dependencies = [];
		const isSplTokenDependencyNeeded = (
			await Promise.all(
				instructions.map(async (instruction) =>
					instruction.quantityOfAccounts > 0
						? (
								await getInstructionAccounts(program, {
									instruction: instruction.publicKey.toBase58(),
								})
						  ).some(
								(account) => account.kind.id === 3 || account.kind.id === 4
						  )
						: false
				)
			)
		).some((elem) => elem === true);

		// we always add anchor lang
		dependencies.push(`anchor-lang = "0.24.2"`);

		// if needed, we add the spl token dependency
		if (isSplTokenDependencyNeeded) {
			dependencies.push(`anchor-spl = "0.24.2"`);
		}
		return dependencies;
	}

	async run(params: string[]) {
		const [applicationId, outDir, programId, isPlain] = params;
		const logger = new BulldozerLogger();
		const showHumanLogs = isPlain === 'undefined' ? true : !JSON.parse(isPlain);
		const showPlainLogs = isPlain === 'undefined' ? false : JSON.parse(isPlain);
		const shouldWriteFile = outDir !== 'undefined';

		try {
			const config = await getSolanaConfig();
			const provider = await getProvider(config);
			const program = getProgram(provider);

			logger.intro({ showLogs: showHumanLogs });
			logger.log(`Getting application data: ${applicationId}`, {
				showLogs: showHumanLogs,
			});

			const application = await getApplication(
				program,
				new PublicKey(applicationId)
			);

			if (application === null) {
				throw new Error('Application not found');
			}

			const applicationCode = ApplicationCodeGenerator.generate(
				application,
				await getInstructions(program, {
					application: application.publicKey.toBase58(),
				}),
				programId
			);

			const collections = await getCollections(program, {
				application: application.publicKey.toBase58(),
			});

			const collectionCodes = await Promise.all(
				collections.map((collection) =>
					getCollectionAttributes(program, {
						collection: collection.publicKey.toBase58(),
					}).then((collectionAttributes) => ({
						collection,
						collectionAttributes,
						code: CollectionCodeGenerator.generate(
							collection,
							collectionAttributes
						),
					}))
				)
			);

			const instructions = await getInstructions(program, {
				application: application.publicKey.toBase58(),
			});

			const instructionCodes = await Promise.all(
				instructions.map((instruction) =>
					Promise.all([
						getInstructionArguments(program, {
							instruction: instruction.publicKey.toBase58(),
						}),
						getInstructionAccounts(program, {
							instruction: instruction.publicKey.toBase58(),
						}),
						getInstructionRelations(program, {
							instruction: instruction.publicKey.toBase58(),
						}),
					]).then(
						([
							instructionArguments,
							instructionAccounts,
							instructionRelations,
						]) => ({
							instruction,
							instructionArguments,
							instructionAccounts,
							instructionRelations,
							code: InstructionCodeGenerator.generate(
								instruction,
								instructionArguments,
								instructionAccounts,
								instructionRelations
							),
						})
					)
				)
			);

			const dependencies = await this.getAppDependencies(program, instructions);

			if (shouldWriteFile) {
				// create a folder with the application name in snake case
				await mkdir(`${outDir}/${formatName(application.name).snakeCase}`);

				// create Cargo.toml file
				await writeFile(
					`${outDir}/${formatName(application.name).snakeCase}/Cargo.toml`,
					ApplicationCargoGenerator.generate(application, dependencies)
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
					applicationCode
				);

				// create collections folder
				await mkdir(
					`${outDir}/${formatName(application.name).snakeCase}/src/collections`
				);

				// generate collections/mod.rs file
				await writeFile(
					`${outDir}/${
						formatName(application.name).snakeCase
					}/src/collections/mod.rs`,
					ApplicationImportsGenerator.generate(
						collections.map((collection) => collection.name)
					)
				);

				// generate each collection
				await Promise.all(
					collectionCodes.map(({ code, collection }) =>
						writeFile(
							`${outDir}/${
								formatName(application.name).snakeCase
							}/src/collections/${formatName(collection.name).snakeCase}.rs`,
							code
						)
					)
				);

				// create instructions folder
				await mkdir(
					`${outDir}/${formatName(application.name).snakeCase}/src/instructions`
				);

				// generate instructions/mod.rs file
				await writeFile(
					`${outDir}/${
						formatName(application.name).snakeCase
					}/src/instructions/mod.rs`,
					ApplicationImportsGenerator.generate(
						instructions.map((instruction) => instruction.name)
					)
				);

				// generate each instruction
				await Promise.all(
					instructionCodes.map(({ code, instruction }) =>
						writeFile(
							`${outDir}/${
								formatName(application.name).snakeCase
							}/src/instructions/${formatName(instruction.name).snakeCase}.rs`,
							code
						)
					)
				);
			}

			// Plain stdout
			logger.log(
				JSON.stringify({
					application: applicationCode,
					collectionCodes: collectionCodes,
					instructionCodes: instructionCodes,
				}),
				{ showLogs: showPlainLogs }
			);
		} catch (error) {
			logger.log(error);
		}
	}
}
