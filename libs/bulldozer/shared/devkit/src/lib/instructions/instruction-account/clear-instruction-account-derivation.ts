import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { defer, from, Observable } from 'rxjs';
import { getBulldozerProgram } from '../../programs';
import { ClearInstructionAccountDerivationParams } from './types';

export const clearInstructionAccountDerivation = (
	endpoint: string,
	params: ClearInstructionAccountDerivationParams
): Observable<TransactionInstruction> => {
	return defer(() =>
		from(
			getBulldozerProgram(endpoint)
				.methods.clearInstructionAccountDerivation()
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
