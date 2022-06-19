import { AccountInfo, PublicKey } from '@solana/web3.js';
import { defer, Observable } from 'rxjs';
import { BULLDOZER_PROGRAM_ID } from '../programs';
import {
	Document,
	InstructionAccount,
	INSTRUCTION_ACCOUNT_ACCOUNT_NAME,
} from '../utils';
import {
	borshCoder,
	decodeAccountKind,
	decodeAccountModifier,
} from './internal';

export const createInstructionAccountDocument = (
	publicKey: string,
	account: AccountInfo<Buffer>
): Observable<Document<InstructionAccount>> => {
	const decodedAccount = borshCoder.decode(
		INSTRUCTION_ACCOUNT_ACCOUNT_NAME,
		account.data
	);

	return defer(async () => {
		const instructionAccountClosePublicKey =
			await PublicKey.createProgramAddress(
				[
					Buffer.from('instruction_account_close', 'utf8'),
					new PublicKey(publicKey).toBuffer(),
					Buffer.from([decodedAccount.bumps.close]),
				],
				BULLDOZER_PROGRAM_ID
			);

		const instructionAccountCollectionPublicKey =
			await PublicKey.createProgramAddress(
				[
					Buffer.from('instruction_account_collection', 'utf8'),
					new PublicKey(publicKey).toBuffer(),
					Buffer.from([decodedAccount.bumps.collection]),
				],
				BULLDOZER_PROGRAM_ID
			);

		const instructionAccountPayerPublicKey =
			await PublicKey.createProgramAddress(
				[
					Buffer.from('instruction_account_payer', 'utf8'),
					new PublicKey(publicKey).toBuffer(),
					Buffer.from([decodedAccount.bumps.payer]),
				],
				BULLDOZER_PROGRAM_ID
			);

		const instructionAccountDerivationPublicKey =
			await PublicKey.createProgramAddress(
				[
					Buffer.from('instruction_account_derivation', 'utf8'),
					new PublicKey(publicKey).toBuffer(),
					Buffer.from([decodedAccount.bumps.derivation]),
				],
				BULLDOZER_PROGRAM_ID
			);

		return {
			id: publicKey,
			metadata: account,
			name: decodedAccount.name,
			data: {
				authority: decodedAccount.authority.toBase58(),
				workspace: decodedAccount.workspace.toBase58(),
				application: decodedAccount.application.toBase58(),
				instruction: decodedAccount.instruction.toBase58(),
				space: decodedAccount.space,
				kind: decodeAccountKind(decodedAccount.kind),
				modifier:
					decodedAccount.modifier &&
					decodeAccountModifier(decodedAccount.modifier),
				close: instructionAccountClosePublicKey.toBase58(),
				collection: instructionAccountCollectionPublicKey.toBase58(),
				payer: instructionAccountPayerPublicKey.toBase58(),
				derivation: instructionAccountDerivationPublicKey.toBase58(),
				uncheckedExplanation: decodedAccount.uncheckedExplanation,
				tokenAuthority: decodedAccount.tokenAuthority?.toBase58() ?? null,
				mint: decodedAccount.mint?.toBase58() ?? null,
			},
			createdAt: decodedAccount.createdAt,
			updatedAt: decodedAccount.updatedAt,
		};
	});
};
