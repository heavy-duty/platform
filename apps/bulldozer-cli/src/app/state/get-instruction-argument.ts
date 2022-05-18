import { Program } from '@heavy-duty/anchor';
import { PublicKey } from '@solana/web3.js';
import { Bulldozer } from '../utils/bulldozer';

type Option<T> = T | null;

export interface InstructionArgument {
	publicKey: PublicKey;
	name: string;
	authority: PublicKey;
	workspace: PublicKey;
	application: PublicKey;
	instruction: PublicKey;
	kind: {
		id: number;
		name: string;
		size: number;
	};
	modifier: Option<{
		id: number;
		name: string;
		size: number;
	}>;
	createdAt: Date;
	updatedAt: Date;
}

export const getInstructionArgument = async (
	program: Program<Bulldozer>,
	instructionArgumentPublicKey: PublicKey
): Promise<InstructionArgument | null> => {
	const instructionArgument =
		await program.account.instructionArgument.fetchNullable(
			instructionArgumentPublicKey
		);

	if (instructionArgument === null) {
		return null;
	}

	const kindName = Object.keys(instructionArgument.kind)[0];
	const modifierName =
		instructionArgument.modifier !== null
			? Object.keys(instructionArgument.modifier)[0]
			: null;

	return {
		publicKey: instructionArgumentPublicKey,
		name: instructionArgument.name,
		authority: instructionArgument.authority,
		workspace: instructionArgument.workspace,
		application: instructionArgument.application,
		instruction: instructionArgument.instruction,
		kind: {
			id: instructionArgument.kind[kindName].id,
			name: kindName,
			size: instructionArgument.kind[kindName].size,
		},
		modifier:
			modifierName !== null
				? {
						id: instructionArgument.modifier[modifierName].id,
						name: modifierName,
						size: instructionArgument.modifier[modifierName].size,
				  }
				: null,
		createdAt: new Date(instructionArgument.createdAt.toNumber() * 1000),
		updatedAt: new Date(instructionArgument.updatedAt.toNumber() * 1000),
	};
};
