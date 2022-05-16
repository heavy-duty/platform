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
		const [instructionArgumentId] = params;

		const config = await getSolanaConfig();
		const provider = await getProvider(config);
		const program = getProgram(provider);

		log(`Getting instruction argument data: ${instructionArgumentId}`);

		const instructionArgument = await getInstructionArgument(
			program,
			new PublicKey(instructionArgumentId)
		);

		log(`Instruction Argument "${instructionArgument.name}"`);
		log(
			`Instruction Argument Public Key: ${instructionArgument.publicKey.toBase58()}`
		);
		log(
			`Instruction Argument Authority: ${instructionArgument.authority.toBase58()}`
		);
		log(
			`Instruction Argument Workspace: ${instructionArgument.workspace.toBase58()}`
		);
		log(
			`Instruction Argument Application: ${instructionArgument.application.toBase58()}`
		);
		log(
			`Instruction Argument Instruction: ${instructionArgument.instruction.toBase58()}`
		);
		log(
			`Instruction Argument Kind: ${JSON.stringify(instructionArgument.kind)}`
		);
		log(
			`Instruction Argument Modifier: ${
				instructionArgument.modifier !== null
					? JSON.stringify(instructionArgument.modifier)
					: null
			}`
		);
		log(`Instruction Argument Created At: ${instructionArgument.createdAt}`);
		log(`Instruction Argument Updated At: ${instructionArgument.updatedAt}`);
	}
}
