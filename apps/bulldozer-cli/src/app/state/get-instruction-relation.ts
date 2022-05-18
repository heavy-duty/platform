import { Program } from '@heavy-duty/anchor';
import { PublicKey } from '@solana/web3.js';
import { Bulldozer } from '../utils/bulldozer';
import {
	getInstructionAccount,
	InstructionAccount,
} from './get-instruction-account';

export interface InstructionRelation {
	publicKey: PublicKey;
	authority: PublicKey;
	workspace: PublicKey;
	application: PublicKey;
	instruction: PublicKey;
	from: InstructionAccount;
	to: InstructionAccount;
	createdAt: Date;
	updatedAt: Date;
}

export const getInstructionRelation = async (
	program: Program<Bulldozer>,
	instructionRelationPublicKey: PublicKey
): Promise<InstructionRelation | null> => {
	const instructionRelation =
		await program.account.instructionRelation.fetchNullable(
			instructionRelationPublicKey
		);

	if (instructionRelation === null) {
		return null;
	}

	const from = await getInstructionAccount(program, instructionRelation.from);
	const to = await getInstructionAccount(program, instructionRelation.to);

	if (instructionRelation === null || from === null || to === null) {
		return null;
	}

	return {
		publicKey: instructionRelationPublicKey,
		authority: instructionRelation.authority,
		workspace: instructionRelation.workspace,
		application: instructionRelation.application,
		instruction: instructionRelation.instruction,
		from,
		to,
		createdAt: new Date(instructionRelation.createdAt.toNumber() * 1000),
		updatedAt: new Date(instructionRelation.updatedAt.toNumber() * 1000),
	};
};
