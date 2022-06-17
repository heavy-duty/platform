import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { defer, from, Observable } from 'rxjs';
import { getBulldozerProgram } from '../../programs';
import { SetTokenConfigurationParams } from './types';

export const setTokenConfiguration = (
	endpoint: string,
	params: SetTokenConfigurationParams
): Observable<TransactionInstruction> => {
	return defer(() =>
		from(
			getBulldozerProgram(endpoint)
				.methods.setTokenCofiguration()
				.accounts({
					authority: new PublicKey(params.authority),
					workspace: new PublicKey(params.workspaceId),
					application: new PublicKey(params.applicationId),
					instruction: new PublicKey(params.instructionId),
					account: new PublicKey(params.instructionAccountId),
					mint: new PublicKey(params.mint),
					tokenAuthority: new PublicKey(params.tokenAuthority),
				})
				.instruction() as Promise<TransactionInstruction>
		)
	);
};
