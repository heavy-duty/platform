import { Program } from '@heavy-duty/anchor';
import { PublicKey } from '@solana/web3.js';
import { Bulldozer } from '../utils/bulldozer';

export interface Instruction {
	publicKey: PublicKey;
	name: string;
	body: string;
	authority: PublicKey;
	workspace: PublicKey;
	application: PublicKey;
	quantityOfArguments: number;
	quantityOfAccounts: number;
	createdAt: Date;
	updatedAt: Date;
}

export const getInstruction = async (
	program: Program<Bulldozer>,
	instructionPublicKey: PublicKey
): Promise<Instruction | null> => {
	const instructionAccount = await program.account.instruction.fetchNullable(
		instructionPublicKey
	);

	if (instructionAccount === null) {
		return null;
	}

	const instructionStatsPublicKey = await PublicKey.createProgramAddress(
		[
			Buffer.from('instruction_stats', 'utf8'),
			instructionPublicKey.toBuffer(),
			Buffer.from([instructionAccount.instructionStatsBump]),
		],
		program.programId
	);

	const instructionStatsAccount =
		await program.account.instructionStats.fetchNullable(
			instructionStatsPublicKey
		);

	if (instructionStatsAccount === null) {
		return null;
	}

	return {
		publicKey: instructionPublicKey,
		name: instructionAccount.name,
		body: instructionAccount.body,
		authority: instructionAccount.authority,
		workspace: instructionAccount.workspace,
		application: instructionAccount.application,
		quantityOfArguments: instructionStatsAccount.quantityOfArguments,
		quantityOfAccounts: instructionStatsAccount.quantityOfAccounts,
		createdAt: new Date(instructionAccount.createdAt.toNumber() * 1000),
		updatedAt: new Date(instructionAccount.updatedAt.toNumber() * 1000),
	};
};
