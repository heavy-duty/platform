import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { defer, from, Observable } from 'rxjs';
import { getBulldozerProgram } from '../../programs';
import { AddSeedToDerivationParams } from './types';

export const addSeedToDerivation = (
	endpoint: string,
	params: AddSeedToDerivationParams
): Observable<TransactionInstruction> => {
	return defer(() =>
		from(
			getBulldozerProgram(endpoint)
				.methods.addSeedToDerivation()
				.accounts({
					authority: new PublicKey(params.authority),
					workspace: new PublicKey(params.workspaceId),
					application: new PublicKey(params.applicationId),
					instruction: new PublicKey(params.instructionId),
					account: new PublicKey(params.instructionAccountId),
					reference: new PublicKey(params.referenceId),
				})
				.instruction() as Promise<TransactionInstruction>
		)
	);
};
