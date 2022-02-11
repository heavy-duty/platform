import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { defer, from, Observable } from 'rxjs';
import { bulldozerProgram } from '../../programs';
import { CreateInstructionParams } from './types';

export const createInstruction = (
  params: CreateInstructionParams
): Observable<TransactionInstruction> => {
  return defer(() =>
    from(
      bulldozerProgram.methods
        .createInstruction({ name: params.instructionName })
        .accounts({
          workspace: new PublicKey(params.workspaceId),
          application: new PublicKey(params.applicationId),
          instruction: new PublicKey(params.instructionId),
          authority: new PublicKey(params.authority),
        })
        .instruction() as Promise<TransactionInstruction>
    )
  );
};
