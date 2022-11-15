import { PublicKey } from '@solana/web3.js';
import { Command, CommandRunner } from 'nest-commander';
import { getInstructionArgument } from '../state';
import {
	BulldozerLogger,
	getProgram,
	getProvider,
	getSolanaConfig
} from '../utils';

@Command({
	name: 'get-instruction-argument',
	description: 'Get everything about a given instruction argument',
	arguments: '<instruction-argument-id> <plain>',
})
export class GetInstructionArgumentCommand extends CommandRunner {
	async run(params: string[]) {
		const [instructionArgumentId, isPlain] = params;
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
			logger.log(
				`Getting instruction argument data: ${instructionArgumentId}`,
				{
					showLogs: showHumanLogs,
				}
			);

			const instructionArgument = await getInstructionArgument(
				program,
				new PublicKey(instructionArgumentId)
			);

			if (instructionArgument === null) {
				logger.log('Instruction Argument does not exist.', {
					showLogs: showHumanLogs,
				});
				return;
			}

			logger.log(`Instruction Argument "${instructionArgument.name}"`, {
				showLogs: showHumanLogs,
			});
			logger.log(`Public Key: ${instructionArgument.publicKey.toBase58()}`, {
				showLogs: showHumanLogs,
			});
			logger.log(`Authority: ${instructionArgument.authority.toBase58()}`, {
				showLogs: showHumanLogs,
			});
			logger.log(`Workspace: ${instructionArgument.workspace.toBase58()}`, {
				showLogs: showHumanLogs,
			});
			logger.log(`Application: ${instructionArgument.application.toBase58()}`, {
				showLogs: showHumanLogs,
			});
			logger.log(`Instruction: ${instructionArgument.instruction.toBase58()}`, {
				showLogs: showHumanLogs,
			});
			logger.log(`Kind: ${JSON.stringify(instructionArgument.kind)}`, {
				showLogs: showHumanLogs,
			});
			logger.log(
				`Modifier: ${
					instructionArgument.modifier !== null
						? JSON.stringify(instructionArgument.modifier)
						: null
				}`,
				{
					showLogs: showHumanLogs,
				}
			);
			logger.log(`Created At: ${instructionArgument.createdAt}`, {
				showLogs: showHumanLogs,
			});
			logger.log(`Updated At: ${instructionArgument.updatedAt}`, {
				showLogs: showHumanLogs,
			});

			// Plain output
			logger.log(JSON.stringify(instructionArgument), {
				showLogs: showPlainLogs,
			});
		} catch (error) {
			logger.error(error);
		}
	}
}
