import { PublicKey } from '@solana/web3.js';
import { Command, CommandRunner } from 'nest-commander';
import {
	getInstruction,
	getInstructionAccounts,
	getInstructionArguments,
} from '../state';
import { getProgram, getProvider, getSolanaConfig, log } from '../utils';

@Command({
	name: 'generate-instruction',
	description: 'Generate the source code for an instruction',
	arguments: '<instruction-id>',
	argsDescription: {
		'instruction-id':
			'(public key) The instruction id which you want to select',
	},
})
export class GenerateInstructionCommand implements CommandRunner {
	async run(params: string[]) {
		try {
			const [instructionId] = params;
			const config = await getSolanaConfig();
			const provider = await getProvider(config);
			const program = getProgram(provider);

			log(`Getting instruction data: ${instructionId}`);

			const instruction = await getInstruction(
				program,
				new PublicKey(instructionId)
			);

			if (instruction === null) {
				throw new Error('Instruction not found');
			}

			const instructionArguments =
				instruction.quantityOfArguments > 0
					? await getInstructionArguments(program, {
							instruction: instruction.publicKey.toBase58(),
					  })
					: [];

			const instructionAccounts =
				instruction.quantityOfAccounts > 0
					? await getInstructionAccounts(program, {
							instruction: instruction.publicKey.toBase58(),
					  })
					: [];

			console.log({ instruction, instructionArguments, instructionAccounts });

			// Generate the instruction code
		} catch (error) {
			log(error);
		}
	}
}
