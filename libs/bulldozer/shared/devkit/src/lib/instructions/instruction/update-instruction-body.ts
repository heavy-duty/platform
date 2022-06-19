import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { defer, from, Observable } from 'rxjs';
import { getBulldozerProgram } from '../../programs';
import { UpdateInstructionBodyParams } from './types';

export const updateInstructionBody = (
	endpoint: string,
	params: UpdateInstructionBodyParams
): Observable<TransactionInstruction> => {
	return defer(() =>
		from(
			getBulldozerProgram(endpoint)
				.methods.updateInstructionBody({
					body: params.body,
					chunk: params.chunk,
				})
				.accounts({
					authority: new PublicKey(params.authority),
					workspace: new PublicKey(params.workspaceId),
					application: new PublicKey(params.applicationId),
					instruction: new PublicKey(params.instructionId),
				})
				.instruction() as Promise<TransactionInstruction>
		)
	);
};
