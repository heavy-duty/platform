import { AccountInfo, PublicKey } from '@solana/web3.js';
import {
	Document,
	InstructionAccountDerivation,
	INSTRUCTION_ACCOUNT_DERIVATION_ACCOUNT_NAME,
} from '../utils';
import { borshCoder } from './internal';

export const createInstructionAccountDerivationDocument = (
	publicKey: string,
	account: AccountInfo<Buffer>
): Document<InstructionAccountDerivation> => {
	const decodedAccount = borshCoder.decode(
		INSTRUCTION_ACCOUNT_DERIVATION_ACCOUNT_NAME,
		account.data
	);

	return {
		id: publicKey,
		metadata: account,
		name: decodedAccount.name,
		data: {
			bumpPath: decodedAccount.bumpPath
				? {
						reference: decodedAccount.bumpPath.reference.toBase58(),
						path: decodedAccount.bumpPath.path.toBase58(),
				  }
				: null,
			seedPaths: (decodedAccount.seedPaths as PublicKey[]).map((seedPath) =>
				seedPath.toBase58()
			),
		},
		createdAt: decodedAccount.createdAt,
		updatedAt: decodedAccount.updatedAt,
	};
};
