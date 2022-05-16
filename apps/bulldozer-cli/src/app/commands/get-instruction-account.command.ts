import { PublicKey } from '@solana/web3.js';
import { Command, CommandRunner } from 'nest-commander';
import { getInstructionAccount } from '../state';
import { getProgram, getProvider, getSolanaConfig, log } from '../utils';

@Command({
	name: 'get-instruction-account',
	description: 'Get everything about a given instruction account',
	arguments: '<instruction-account-id>',
})
export class GetInstructionAccountCommand implements CommandRunner {
	async run(params: string[]) {
		try {
			const [instructionAccountId] = params;
			const config = await getSolanaConfig();
			const provider = await getProvider(config);
			const program = getProgram(provider);

			log(`Getting instruction account data: ${instructionAccountId}`);

			const instructionAccount = await getInstructionAccount(
				program,
				new PublicKey(instructionAccountId)
			);

			if (instructionAccount === null) {
				log('Instruction Account does not exist.');
				return;
			}

			log(`Instruction Account "${instructionAccount.name}"`);
			log(`Public Key: ${instructionAccount.publicKey.toBase58()}`);
			log(`Authority: ${instructionAccount.authority.toBase58()}`);
			log(`Workspace: ${instructionAccount.workspace.toBase58()}`);
			log(`Application: ${instructionAccount.application.toBase58()}`);
			log(`Instruction: ${instructionAccount.instruction.toBase58()}`);
			log(`Kind: ${JSON.stringify(instructionAccount.kind)}`);
			log(
				`Modifier: ${
					instructionAccount.modifier !== null
						? JSON.stringify(instructionAccount.modifier)
						: null
				}`
			);
			log(
				`Collection: ${
					instructionAccount.collection !== null
						? `${
								instructionAccount.collection.name
						  } (${instructionAccount.collection.publicKey.toBase58()})`
						: null
				}`
			);
			log(
				`Payer: ${
					instructionAccount.payer !== null
						? `${
								instructionAccount.payer.name
						  } (${instructionAccount.payer.publicKey.toBase58()})`
						: null
				}`
			);
			log(
				`Close: ${
					instructionAccount.close !== null
						? `${
								instructionAccount.close.name
						  } (${instructionAccount.close.publicKey.toBase58()})`
						: null
				}`
			);
			log(`Created At: ${instructionAccount.createdAt}`);
			log(`Updated At: ${instructionAccount.updatedAt}`);
		} catch (error) {
			console.error(error);
		}
	}
}
