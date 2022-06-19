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
	const instruction = await program.account.instruction.fetchNullable(
		instructionPublicKey
	);

	if (instruction === null) {
		return null;
	}

	const instructionStatsPublicKey = await PublicKey.createProgramAddress(
		[
			Buffer.from('instruction_stats', 'utf8'),
			instructionPublicKey.toBuffer(),
			Buffer.from([instruction.instructionStatsBump]),
		],
		program.programId
	);

	const instructionStats = await program.account.instructionStats.fetchNullable(
		instructionStatsPublicKey
	);

	if (instructionStats === null) {
		return null;
	}

	return {
		publicKey: instructionPublicKey,
		name: instruction.name,
		body: (instruction.chunks as { data: string }[]).reduce(
			(body, chunk) => body + chunk.data,
			''
		),
		authority: instruction.authority,
		workspace: instruction.workspace,
		application: instruction.application,
		quantityOfArguments: instructionStats.quantityOfArguments,
		quantityOfAccounts: instructionStats.quantityOfAccounts,
		createdAt: new Date(instruction.createdAt.toNumber() * 1000),
		updatedAt: new Date(instruction.updatedAt.toNumber() * 1000),
	};
};
