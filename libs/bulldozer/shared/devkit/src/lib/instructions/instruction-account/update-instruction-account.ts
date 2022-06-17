import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { defer, from, Observable } from 'rxjs';
import { getBulldozerProgram } from '../../programs';
import { UpdateInstructionAccountParams } from './types';

export const updateInstructionAccount = (
	endpoint: string,
	params: UpdateInstructionAccountParams
): Observable<TransactionInstruction> => {
	return defer(() =>
		from(
			getBulldozerProgram(endpoint)
				.methods.updateInstructionAccount({
					name: params.instructionAccountDto.name,
					modifier: params.instructionAccountDto.modifier,
					space: params.instructionAccountDto.space,
					uncheckedExplanation:
						params.instructionAccountDto.uncheckedExplanation,
				})
				.accounts({
					authority: new PublicKey(params.authority),
					workspace: new PublicKey(params.workspaceId),
					instruction: new PublicKey(params.instructionId),
					account: new PublicKey(params.instructionAccountId),
				})
				.instruction() as Promise<TransactionInstruction>
		)
	);
};
