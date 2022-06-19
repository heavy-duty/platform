import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { defer, from, Observable } from 'rxjs';
import { getBulldozerProgram } from '../../programs';
import { SetInstructionAccountDerivationParams } from './types';

export const setInstructionAccountDerivation = (
	endpoint: string,
	params: SetInstructionAccountDerivationParams
): Observable<TransactionInstruction> => {
	return defer(() =>
		from(
			getBulldozerProgram(endpoint)
				.methods.setInstructionAccountDerivation({ name: params.name })
				.accounts({
					authority: new PublicKey(params.authority),
					workspace: new PublicKey(params.workspaceId),
					application: new PublicKey(params.applicationId),
					instruction: new PublicKey(params.instructionId),
					account: new PublicKey(params.instructionAccountId),
				})
				.instruction() as Promise<TransactionInstruction>
		)
	);
};
