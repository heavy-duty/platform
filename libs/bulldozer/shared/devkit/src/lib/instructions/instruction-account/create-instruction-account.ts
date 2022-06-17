import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { defer, from, Observable } from 'rxjs';
import { getBulldozerProgram } from '../../programs';
import { CreateInstructionAccountParams } from './types';

export const createInstructionAccount = (
	endpoint: string,
	params: CreateInstructionAccountParams
): Observable<TransactionInstruction> => {
	return defer(() =>
		from(
			getBulldozerProgram(endpoint)
				.methods.createInstructionAccount({
					name: params.instructionAccountDto.name,
					kind: params.instructionAccountDto.kind,
					modifier: params.instructionAccountDto.modifier,
					space: params.instructionAccountDto.space,
					uncheckedExplanation:
						params.instructionAccountDto.uncheckedExplanation,
				})
				.accounts({
					authority: new PublicKey(params.authority),
					workspace: new PublicKey(params.workspaceId),
					application: new PublicKey(params.applicationId),
					instruction: new PublicKey(params.instructionId),
					account: new PublicKey(params.instructionAccountId),
				})
				.remainingAccounts(
					[
						params.instructionAccountDto.collection &&
							params.instructionAccountDto.kind === 0 && {
								pubkey: new PublicKey(params.instructionAccountDto.collection),
								isWritable: false,
								isSigner: false,
							},
						params.instructionAccountDto.payer &&
							params.instructionAccountDto.kind === 0 && {
								pubkey: new PublicKey(params.instructionAccountDto.payer),
								isWritable: false,
								isSigner: false,
							},
						params.instructionAccountDto.close &&
							params.instructionAccountDto.kind === 0 &&
							params.instructionAccountDto.modifier === 1 && {
								pubkey: new PublicKey(params.instructionAccountDto.close),
								isWritable: false,
								isSigner: false,
							},
					].filter(
						<T>(account: T | '' | false | null): account is T =>
							account !== null && account !== false && account !== ''
					)
				)
				.instruction() as Promise<TransactionInstruction>
		)
	);
};
