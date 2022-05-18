import { PublicKey } from '@solana/web3.js';
import { Command, CommandRunner } from 'nest-commander';
import { getInstruction } from '../state';
import { getProgram, getProvider, getSolanaConfig, log } from '../utils';

@Command({
	name: 'get-instruction',
	description: 'Get everything about a given instruction',
	arguments: '<instruction-id>',
})
export class GetInstructionCommand implements CommandRunner {
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
				log('Instruction does not exist.');
				return;
			}

			log(`Instruction "${instruction.name}"`);
			log(`Public Key: ${instruction.publicKey.toBase58()}`);
			log(`Authority: ${instruction.authority.toBase58()}`);
			log(`Workspace: ${instruction.workspace.toBase58()}`);
			log(`Application: ${instruction.application.toBase58()}`);
			log(`Body: \n${instruction.body}\n`);
			log(`Created At: ${instruction.createdAt}`);
			log(`Updated At: ${instruction.updatedAt}`);
			log(
				`Stats: ${instruction.quantityOfArguments} argument(s) and ${instruction.quantityOfAccounts} account(s).`
			);
		} catch (error) {
			console.error(error);
		}
	}
}
