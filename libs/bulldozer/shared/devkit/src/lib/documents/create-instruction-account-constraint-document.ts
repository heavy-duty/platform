import { AccountInfo } from '@solana/web3.js';
import {
	Document,
	InstructionAccountConstraint,
	INSTRUCTION_ACCOUNT_CONSTRAINT_ACCOUNT_NAME,
} from '../utils';
import { borshCoder } from './internal';

export const createInstructionAccountConstraintDocument = (
	publicKey: string,
	account: AccountInfo<Buffer>
): Document<InstructionAccountConstraint> => {
	const decodedAccount = borshCoder.decode(
		INSTRUCTION_ACCOUNT_CONSTRAINT_ACCOUNT_NAME,
		account.data
	);

	return {
		id: publicKey,
		metadata: account,
		name: decodedAccount.name,
		data: {
			body: decodedAccount.body,
			authority: decodedAccount.authority.toBase58(),
			workspace: decodedAccount.workspace.toBase58(),
			application: decodedAccount.application.toBase58(),
			instruction: decodedAccount.instruction.toBase58(),
			account: decodedAccount.account.toBase58(),
		},
		createdAt: decodedAccount.createdAt,
		updatedAt: decodedAccount.updatedAt,
	};
};
