import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { defer, from, Observable } from 'rxjs';
import { bulldozerProgram } from '../../programs';
import { CreateInstructionAccountParams } from './types';

export const createInstructionAccount = (
  params: CreateInstructionAccountParams
): Observable<TransactionInstruction> => {
  return defer(() =>
    from(
      bulldozerProgram.methods
        .createInstructionAccount({
          name: params.instructionAccountDto.name,
          kind: params.instructionAccountDto.kind,
          modifier: params.instructionAccountDto.modifier,
          space: params.instructionAccountDto.space,
        })
        .accounts({
          workspace: new PublicKey(params.workspaceId),
          account: new PublicKey(params.instructionAccountId),
          authority: new PublicKey(params.authority),
          application: new PublicKey(params.applicationId),
          instruction: new PublicKey(params.instructionId),
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
