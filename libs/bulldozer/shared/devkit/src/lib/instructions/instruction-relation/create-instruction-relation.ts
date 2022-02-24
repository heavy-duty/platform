import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { defer, from, Observable } from 'rxjs';
import { bulldozerProgram } from '../../programs';
import { CreateInstructionRelationParams } from './types';

export const createInstructionRelation = (
  params: CreateInstructionRelationParams
): Observable<TransactionInstruction> => {
  return defer(() =>
    from(
      bulldozerProgram.methods
        .createInstructionRelation()
        .accounts({
          authority: new PublicKey(params.authority),
          workspace: new PublicKey(params.workspaceId),
          application: new PublicKey(params.applicationId),
          instruction: new PublicKey(params.instructionId),
          from: new PublicKey(params.fromAccountId),
          to: new PublicKey(params.toAccountId),
        })
        .instruction() as Promise<TransactionInstruction>
    )
  );
};
