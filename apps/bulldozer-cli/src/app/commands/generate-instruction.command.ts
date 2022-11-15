import { PublicKey } from '@solana/web3.js';
import { writeFile } from 'fs/promises';
import { Command, CommandRunner } from 'nest-commander';
import { InstructionCodeGenerator } from '../generators';
import {
	getInstruction,
	getInstructionAccounts,
	getInstructionArguments,
	getInstructionRelations
} from '../state';
import {
	BulldozerLogger,
	getProgram,
	getProvider,
	getSolanaConfig
} from '../utils';

@Command({
	name: 'generate-instruction',
	description: 'Generate the source code for an instruction',
	arguments: '<instruction-id> <out-file> <plain>',
	argsDescription: {
		'instruction-id':
			'(public key) The instruction id which you want to select',
		'out-file': 'Path to generate the rust code',
		plain: 'Return value as string through stdout',
	},
})
export class GenerateInstructionCommand extends CommandRunner {
	async run(params: string[]) {
		const [instructionId, outFile, isPlain] = params;
		const logger = new BulldozerLogger();
		const showHumanLogs = isPlain === 'undefined' ? true : !JSON.parse(isPlain);
		const showPlainLogs = isPlain === 'undefined' ? false : JSON.parse(isPlain);
		const shouldWriteFile = outFile !== 'undefined';

		try {
			const config = await getSolanaConfig();
			const provider = await getProvider(config);
			const program = getProgram(provider);

			logger.intro({ showLogs: showHumanLogs });
			logger.log(`Getting instruction data: ${instructionId}`, {
				showLogs: showHumanLogs,
			});

			const instruction = await getInstruction(
				program,
				new PublicKey(instructionId)
			);

			if (instruction === null) {
				throw new Error('Instruction not found');
			}

			const instructionCode = InstructionCodeGenerator.generate(
				instruction,
				await getInstructionArguments(program, {
					instruction: instruction.publicKey.toBase58(),
				}),
				await getInstructionAccounts(program, {
					instruction: instruction.publicKey.toBase58(),
				}),
				await getInstructionRelations(program, {
					instruction: instruction.publicKey.toBase58(),
				})
			);

			if (shouldWriteFile) {
				writeFile(outFile, instructionCode);
			}

			// Plain stdout
			logger.log(JSON.stringify(instructionCode), {
				showLogs: showPlainLogs,
			});
		} catch (error) {
			logger.log(error);
		}
	}
}
