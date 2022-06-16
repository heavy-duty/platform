import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { defer, from, Observable } from 'rxjs';
import { getBulldozerProgram } from '../../programs';
import { SetBumpToDerivationParams } from './types';

export const setBumpToDerivation = (
	endpoint: string,
	params: SetBumpToDerivationParams
): Observable<TransactionInstruction> => {
	return defer(() =>
		from(
			getBulldozerProgram(endpoint)
				.methods.setBumpToDerivation()
				.accounts({
					authority: new PublicKey(params.authority),
					workspace: new PublicKey(params.workspaceId),
					application: new PublicKey(params.applicationId),
					instruction: new PublicKey(params.instructionId),
					account: new PublicKey(params.instructionAccountId),
					collection: new PublicKey(params.collectionId),
					reference: new PublicKey(params.referenceId),
					path: new PublicKey(params.pathId),
				})
				.instruction() as Promise<TransactionInstruction>
		)
	);
};
