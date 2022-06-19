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
	derivation: Option<InstructionAccountDerivationDecode>;
	space: Option<number>;
	uncheckedExplanation: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface InstructionAccountDerivation {
	name: string;
	bumpPath: {
		reference: PublicKey;
		path: PublicKey;
	};
	seedPaths: PublicKey[];
}

export interface InstructionAccountDerivationDecode {
	name: string;
	bumpPath: {
		reference: string;
		path: string;
	};
	seedPaths: string[];
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

	const instructionAccountDerivationPublicKey =
		await PublicKey.createProgramAddress(
			[
				Buffer.from('instruction_account_derivation', 'utf8'),
				new PublicKey(instructionAccountPublicKey).toBuffer(),
				Buffer.from([instructionAccount.bumps.derivation]),
			],
			program.programId
		);

	const instructionAccountDerivation: InstructionAccountDerivation =
		await program.account.instructionAccountDerivation.fetch(
			instructionAccountDerivationPublicKey
		);
	// move
	let bumpRef, bumpPath, seedPaths;

	if (instructionAccountDerivation.bumpPath) {
		bumpRef = (
			await program.account.instructionAccount.fetch(
				instructionAccountDerivation.bumpPath.reference
			)
		).name;

		bumpPath = (
			await program.account.collectionAttribute.fetch(
				instructionAccountDerivation.bumpPath.path
			)
		).name;
	}

	if (instructionAccountDerivation.seedPaths.length !== 0) {
		seedPaths = await Promise.all(
			instructionAccountDerivation.seedPaths.map(
				async (seed) =>
					(
						await program.account.instructionAccount.fetch(seed)
					).name
			)
		);
	}

	const instructionAccountDerivationDecode: InstructionAccountDerivationDecode =
		{
			name: instructionAccountDerivation.name,
			bumpPath: {
				reference: bumpRef,
				path: bumpPath,
			},
			seedPaths,
		};

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
		uncheckedExplanation: instructionAccount.uncheckedExplanation,
		derivation: instructionAccountDerivationDecode,
		collection:
			instructionAccountCollection !== null
				? await getCollection(program, instructionAccountCollection)
				: null,
		createdAt: new Date(instructionAccount.createdAt.toNumber() * 1000),
		updatedAt: new Date(instructionAccount.updatedAt.toNumber() * 1000),
	};
};
