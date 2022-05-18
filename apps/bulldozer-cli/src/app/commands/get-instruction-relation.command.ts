import { PublicKey } from '@solana/web3.js';
import { Command, CommandRunner } from 'nest-commander';
import { getInstructionRelation } from '../state';
import { getProgram, getProvider, getSolanaConfig, log } from '../utils';

@Command({
	name: 'get-instruction-relation',
	description: 'Get everything about a given instruction relation',
	arguments: '<instruction-relation-id>',
})
export class GetInstructionRelationCommand implements CommandRunner {
	async run(params: string[]) {
		try {
			const [instructionRelationId] = params;
			const config = await getSolanaConfig();
			const provider = await getProvider(config);
			const program = getProgram(provider);

			log(`Getting instruction relation data: ${instructionRelationId}`);

			const instructionRelation = await getInstructionRelation(
				program,
				new PublicKey(instructionRelationId)
			);

			if (instructionRelation === null) {
				log('Instruction Relation does not exist.');
				return;
			}

			log(`Instruction Relation "${instructionRelationId}"`);
			log(`Public Key: ${instructionRelation.publicKey.toBase58()}`);
			log(`Authority: ${instructionRelation.authority.toBase58()}`);
			log(`Workspace: ${instructionRelation.workspace.toBase58()}`);
			log(`Application: ${instructionRelation.application.toBase58()}`);
			log(`Instruction: ${instructionRelation.instruction.toBase58()}`);
			log(
				`From: ${
					instructionRelation.from !== null
						? `${
								instructionRelation.from.name
						  } (${instructionRelation.from.publicKey.toBase58()})`
						: null
				}`
			);
			log(
				`To: ${
					instructionRelation.to !== null
						? `${
								instructionRelation.to.name
						  } (${instructionRelation.to.publicKey.toBase58()})`
						: null
				}`
			);
			log(`Created At: ${instructionRelation.createdAt}`);
			log(`Updated At: ${instructionRelation.updatedAt}`);
		} catch (error) {
			console.error(error);
		}
	}
}
