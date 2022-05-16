import { PublicKey } from '@solana/web3.js';
import { Command, CommandRunner } from 'nest-commander';
import { getInstructionArgument } from '../state';
import { getProgram, getProvider, getSolanaConfig, log } from '../utils';

@Command({
	name: 'get-instruction-argument',
	description: 'Get everything about a given instruction argument',
	arguments: '<instruction-argument-id>',
})
export class GetInstructionArgumentCommand implements CommandRunner {
	async run(params: string[]) {
		try {
			const [instructionArgumentId] = params;
			const config = await getSolanaConfig();
			const provider = await getProvider(config);
			const program = getProgram(provider);

			log(`Getting instruction argument data: ${instructionArgumentId}`);

			const instructionArgument = await getInstructionArgument(
				program,
				new PublicKey(instructionArgumentId)
			);

			if (instructionArgument === null) {
				log('Instruction Argument does not exist.');
				return;
			}

			log(`Instruction Argument "${instructionArgument.name}"`);
			log(`Public Key: ${instructionArgument.publicKey.toBase58()}`);
			log(`Authority: ${instructionArgument.authority.toBase58()}`);
			log(`Workspace: ${instructionArgument.workspace.toBase58()}`);
			log(`Application: ${instructionArgument.application.toBase58()}`);
			log(`Instruction: ${instructionArgument.instruction.toBase58()}`);
			log(`Kind: ${JSON.stringify(instructionArgument.kind)}`);
			log(
				`Modifier: ${
					instructionArgument.modifier !== null
						? JSON.stringify(instructionArgument.modifier)
						: null
				}`
			);
			log(`Created At: ${instructionArgument.createdAt}`);
			log(`Updated At: ${instructionArgument.updatedAt}`);
		} catch (error) {
			console.error(error);
		}
	}
}
