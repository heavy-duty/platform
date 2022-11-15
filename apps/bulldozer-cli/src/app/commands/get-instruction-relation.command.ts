import { PublicKey } from '@solana/web3.js';
import { Command, CommandRunner } from 'nest-commander';
import { getInstructionRelation } from '../state';
import {
	BulldozerLogger,
	getProgram,
	getProvider,
	getSolanaConfig
} from '../utils';

@Command({
	name: 'get-instruction-relation',
	description: 'Get everything about a given instruction relation',
	arguments: '<instruction-relation-id> <plain>',
})
export class GetInstructionRelationCommand extends CommandRunner {
	async run(params: string[]) {
		const [instructionRelationId, isPlain] = params;
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
				`Getting instruction relation data: ${instructionRelationId}`,
				{
					showLogs: showHumanLogs,
				}
			);

			const instructionRelation = await getInstructionRelation(
				program,
				new PublicKey(instructionRelationId)
			);

			if (instructionRelation === null) {
				logger.log('Instruction Relation does not exist.', {
					showLogs: showHumanLogs,
				});
				return;
			}

			logger.log(`Instruction Relation "${instructionRelationId}"`, {
				showLogs: showHumanLogs,
			});
			logger.log(`Public Key: ${instructionRelation.publicKey.toBase58()}`, {
				showLogs: showHumanLogs,
			});
			logger.log(`Authority: ${instructionRelation.authority.toBase58()}`, {
				showLogs: showHumanLogs,
			});
			logger.log(`Workspace: ${instructionRelation.workspace.toBase58()}`, {
				showLogs: showHumanLogs,
			});
			logger.log(`Application: ${instructionRelation.application.toBase58()}`, {
				showLogs: showHumanLogs,
			});
			logger.log(`Instruction: ${instructionRelation.instruction.toBase58()}`, {
				showLogs: showHumanLogs,
			});
			logger.log(
				`From: ${
					instructionRelation.from !== null
						? `${
								instructionRelation.from.name
						  } (${instructionRelation.from.publicKey.toBase58()})`
						: null
				}`,
				{
					showLogs: showHumanLogs,
				}
			);
			logger.log(
				`To: ${
					instructionRelation.to !== null
						? `${
								instructionRelation.to.name
						  } (${instructionRelation.to.publicKey.toBase58()})`
						: null
				}`,
				{
					showLogs: showHumanLogs,
				}
			);
			logger.log(`Created At: ${instructionRelation.createdAt}`, {
				showLogs: showHumanLogs,
			});
			logger.log(`Updated At: ${instructionRelation.updatedAt}`, {
				showLogs: showHumanLogs,
			});

			// Plain output
			logger.log(JSON.stringify(instructionRelation), {
				showLogs: showPlainLogs,
			});
		} catch (error) {
			logger.error(error);
		}
	}
}
