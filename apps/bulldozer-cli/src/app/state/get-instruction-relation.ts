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
	fromPublicKey: PublicKey,
	toPublicKey: PublicKey
): Promise<InstructionRelation | null> => {
	const [instructionRelationPublicKey] = await PublicKey.findProgramAddress(
		[
			Buffer.from('instruction_relation', 'utf8'),
			fromPublicKey.toBuffer(),
			toPublicKey.toBuffer(),
		],
		program.programId
	);
	const instructionRelation =
		await program.account.instructionRelation.fetchNullable(
			instructionRelationPublicKey
		);
	const from = await getInstructionAccount(program, fromPublicKey);
	const to = await getInstructionAccount(program, toPublicKey);

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
