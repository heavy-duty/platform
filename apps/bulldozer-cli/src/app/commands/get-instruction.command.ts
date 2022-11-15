import { PublicKey } from '@solana/web3.js';
import { Command, CommandRunner } from 'nest-commander';
import { getInstruction } from '../state';
import {
	BulldozerLogger,
	getProgram,
	getProvider,
	getSolanaConfig
} from '../utils';

@Command({
	name: 'get-instruction',
	description: 'Get everything about a given instruction',
	arguments: '<instruction-id> <plain>',
})
export class GetInstructionCommand extends CommandRunner {
	async run(params: string[]) {
		const [instructionId, isPlain] = params;
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
			logger.log(`Getting instruction data: ${instructionId}`, {
				showLogs: showHumanLogs,
			});

			const instruction = await getInstruction(
				program,
				new PublicKey(instructionId)
			);

			if (instruction === null) {
				logger.log('Instruction does not exist.', {
					showLogs: showHumanLogs,
				});
				return;
			}

			logger.log(`Instruction "${instruction.name}"`, {
				showLogs: showHumanLogs,
			});
			logger.log(`Public Key: ${instruction.publicKey.toBase58()}`, {
				showLogs: showHumanLogs,
			});
			logger.log(`Authority: ${instruction.authority.toBase58()}`, {
				showLogs: showHumanLogs,
			});
			logger.log(`Workspace: ${instruction.workspace.toBase58()}`, {
				showLogs: showHumanLogs,
			});
			logger.log(`Application: ${instruction.application.toBase58()}`, {
				showLogs: showHumanLogs,
			});
			logger.log(`Body: \n${instruction.body}\n`, {
				showLogs: showHumanLogs,
			});
			logger.log(`Created At: ${instruction.createdAt}`, {
				showLogs: showHumanLogs,
			});
			logger.log(`Updated At: ${instruction.updatedAt}`, {
				showLogs: showHumanLogs,
			});
			logger.log(
				`Stats: ${instruction.quantityOfArguments} argument(s) and ${instruction.quantityOfAccounts} account(s).`,
				{
					showLogs: showHumanLogs,
				}
			);

			// Plain output
			logger.log(JSON.stringify(instruction), {
				showLogs: showPlainLogs,
			});
		} catch (error) {
			logger.error(error);
		}
	}
}
