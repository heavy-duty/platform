import { Program } from '@heavy-duty/anchor';
import { PublicKey } from '@solana/web3.js';
import { Bulldozer } from '../utils/bulldozer';
import { Collection, getCollection } from './get-collection';

type Option<T> = T | null;

export interface InstructionAccount {
	publicKey: PublicKey;
	name: string;
	authority: PublicKey;
	workspace: PublicKey;
	application: PublicKey;
	instruction: PublicKey;
	kind: {
		id: number;
		name: string;
	};
	modifier: {
		id: number;
		name: string;
	};
	close: Option<InstructionAccount>;
	payer: Option<InstructionAccount>;
	collection: Option<Collection>;
	space: Option<number>;
	createdAt: Date;
	updatedAt: Date;
}

export const getInstructionAccount = async (
	program: Program<Bulldozer>,
	instructionAccountPublicKey: PublicKey
): Promise<InstructionAccount | null> => {
	const instructionAccount =
		await program.account.instructionAccount.fetchNullable(
			instructionAccountPublicKey
		);

	if (instructionAccount === null) {
		return null;
	}

	const kindName = Object.keys(instructionAccount.kind)[0];
	const modifierName =
		instructionAccount.modifier !== null
			? Object.keys(instructionAccount.modifier)[0]
			: null;

	const instructionAccountClosePublicKey = await PublicKey.createProgramAddress(
		[
			Buffer.from('instruction_account_close', 'utf8'),
			new PublicKey(instructionAccountPublicKey).toBuffer(),
			Buffer.from([instructionAccount.bumps.close]),
		],
		program.programId
	);
	const { close: instructionAccountClose } =
		await program.account.instructionAccountClose.fetch(
			instructionAccountClosePublicKey
		);

	const instructionAccountCollectionPublicKey =
		await PublicKey.createProgramAddress(
			[
				Buffer.from('instruction_account_collection', 'utf8'),
				new PublicKey(instructionAccountPublicKey).toBuffer(),
				Buffer.from([instructionAccount.bumps.collection]),
			],
			program.programId
		);
	const { collection: instructionAccountCollection } =
		await program.account.instructionAccountCollection.fetch(
			instructionAccountCollectionPublicKey
		);

	const instructionAccountPayerPublicKey = await PublicKey.createProgramAddress(
		[
			Buffer.from('instruction_account_payer', 'utf8'),
			new PublicKey(instructionAccountPublicKey).toBuffer(),
			Buffer.from([instructionAccount.bumps.payer]),
		],
		program.programId
	);
	const { payer: instructionAccountPayer } =
		await program.account.instructionAccountPayer.fetch(
			instructionAccountPayerPublicKey
		);

	return {
		publicKey: instructionAccountPublicKey,
		name: instructionAccount.name,
		authority: instructionAccount.authority,
		workspace: instructionAccount.workspace,
		application: instructionAccount.application,
		instruction: instructionAccount.instruction,
		kind: {
			id: instructionAccount.kind[kindName].id,
			name: kindName,
		},
		space: instructionAccount.space,
		modifier:
			modifierName !== null
				? {
						id: instructionAccount.modifier[modifierName].id,
						name: modifierName,
				  }
				: null,
		close:
			instructionAccountClose !== null
				? await getInstructionAccount(program, instructionAccountClose)
				: null,
		payer:
			instructionAccountPayer !== null
				? await getInstructionAccount(program, instructionAccountPayer)
				: null,
		collection:
			instructionAccountCollection !== null
				? await getCollection(program, instructionAccountCollection)
				: null,
		createdAt: new Date(instructionAccount.createdAt.toNumber() * 1000),
		updatedAt: new Date(instructionAccount.updatedAt.toNumber() * 1000),
	};
};
