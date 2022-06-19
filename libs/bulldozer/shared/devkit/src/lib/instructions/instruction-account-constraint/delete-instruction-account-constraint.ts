import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { defer, from, Observable } from 'rxjs';
import { getBulldozerProgram } from '../../programs';
import { DeleteInstructionAccountConstraintParams } from './types';

export const deleteInstructionAccountConstraint = (
	endpoint: string,
	params: DeleteInstructionAccountConstraintParams
): Observable<TransactionInstruction> => {
	return defer(() =>
		from(
			getBulldozerProgram(endpoint)
				.methods.deleteInstructionAccountConstraint()
				.accounts({
					authority: new PublicKey(params.authority),
					workspace: new PublicKey(params.workspaceId),
					application: new PublicKey(params.applicationId),
					instruction: new PublicKey(params.instructionId),
					account: new PublicKey(params.instructionAccountId),
					accountConstraint: new PublicKey(
						params.instructionAccountConstraintId
					),
				})
				.instruction() as Promise<TransactionInstruction>
		)
	);
};
