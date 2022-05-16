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
	const instructionArgumentAccount =
		await program.account.instructionArgument.fetchNullable(
			instructionArgumentPublicKey
		);

	if (instructionArgumentAccount === null) {
		return null;
	}

	const kindName = Object.keys(instructionArgumentAccount.kind)[0];
	const modifierName =
		instructionArgumentAccount.modifier !== null
			? Object.keys(instructionArgumentAccount.modifier)[0]
			: null;

	return {
		publicKey: instructionArgumentPublicKey,
		name: instructionArgumentAccount.name,
		authority: instructionArgumentAccount.authority,
		workspace: instructionArgumentAccount.workspace,
		application: instructionArgumentAccount.application,
		instruction: instructionArgumentAccount.instruction,
		kind: {
			id: instructionArgumentAccount.kind[kindName].id,
			name: kindName,
			size: instructionArgumentAccount.kind[kindName].size,
		},
		modifier:
			modifierName !== null
				? {
						id: instructionArgumentAccount.modifier[modifierName].id,
						name: modifierName,
						size: instructionArgumentAccount.modifier[modifierName].size,
				  }
				: null,
		createdAt: new Date(instructionArgumentAccount.createdAt.toNumber() * 1000),
		updatedAt: new Date(instructionArgumentAccount.updatedAt.toNumber() * 1000),
	};
};
