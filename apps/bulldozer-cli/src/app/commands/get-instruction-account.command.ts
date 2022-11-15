import { PublicKey } from '@solana/web3.js';
import { Command, CommandRunner } from 'nest-commander';
import { getInstructionAccount } from '../state';
import {
	BulldozerLogger,
	getProgram,
	getProvider,
	getSolanaConfig
} from '../utils';

@Command({
	name: 'get-instruction-account',
	description: 'Get everything about a given instruction account',
	arguments: '<instruction-account-id> <plain>',
})
export class GetInstructionAccountCommand extends CommandRunner {
	async run(params: string[]) {
		const [instructionAccountId, isPlain] = params;
		const logger = new BulldozerLogger();
		const showHumanLogs = isPlain === 'undefined' ? true : !JSON.parse(isPlain);
		const showPlainLogs = isPlain === 'undefined' ? false : JSON.parse(isPlain);

		try {
			const config = await getSolanaConfig();
			const provider = await getProvider(config);
			const program = getProgram(provider);

			logger.intro({
				showLogs: showHumanLogs,
			});
			logger.log(`Getting instruction account data: ${instructionAccountId}`, {
				showLogs: showHumanLogs,
			});

			const instructionAccount = await getInstructionAccount(
				program,
				new PublicKey(instructionAccountId)
			);

			if (instructionAccount === null) {
				logger.log('Instruction Account does not exist.', {
					showLogs: showHumanLogs,
				});
				return;
			}

			logger.log(`Instruction Account "${instructionAccount.name}"`, {
				showLogs: showHumanLogs,
			});
			logger.log(`Public Key: ${instructionAccount.publicKey.toBase58()}`, {
				showLogs: showHumanLogs,
			});
			logger.log(`Authority: ${instructionAccount.authority.toBase58()}`, {
				showLogs: showHumanLogs,
			});
			logger.log(`Workspace: ${instructionAccount.workspace.toBase58()}`, {
				showLogs: showHumanLogs,
			});
			logger.log(`Application: ${instructionAccount.application.toBase58()}`, {
				showLogs: showHumanLogs,
			});
			logger.log(`Instruction: ${instructionAccount.instruction.toBase58()}`, {
				showLogs: showHumanLogs,
			});
			logger.log(`Kind: ${JSON.stringify(instructionAccount.kind)}`, {
				showLogs: showHumanLogs,
			});
			logger.log(
				`Modifier: ${
					instructionAccount.modifier !== null
						? JSON.stringify(instructionAccount.modifier)
						: null
				}`,
				{
					showLogs: showHumanLogs,
				}
			);
			logger.log(
				`Collection: ${
					instructionAccount.collection !== null
						? `${
								instructionAccount.collection.name
						  } (${instructionAccount.collection.publicKey.toBase58()})`
						: null
				}`,
				{
					showLogs: showHumanLogs,
				}
			);
			logger.log(
				`Payer: ${
					instructionAccount.payer !== null
						? `${
								instructionAccount.payer.name
						  } (${instructionAccount.payer.publicKey.toBase58()})`
						: null
				}`,
				{
					showLogs: showHumanLogs,
				}
			);
			logger.log(
				`Close: ${
					instructionAccount.close !== null
						? `${
								instructionAccount.close.name
						  } (${instructionAccount.close.publicKey.toBase58()})`
						: null
				}`,
				{
					showLogs: showHumanLogs,
				}
			);
			logger.log(`Created At: ${instructionAccount.createdAt}`, {
				showLogs: showHumanLogs,
			});
			logger.log(`Updated At: ${instructionAccount.updatedAt}`, {
				showLogs: showHumanLogs,
			});

			// Plain output
			logger.log(JSON.stringify(instructionAccount), {
				showLogs: showPlainLogs,
			});
		} catch (error) {
			logger.error(error);
		}
	}
}
