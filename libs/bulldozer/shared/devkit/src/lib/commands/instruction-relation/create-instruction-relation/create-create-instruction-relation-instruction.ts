import {
  PublicKey,
  SystemProgram,
  SYSVAR_CLOCK_PUBKEY,
  TransactionInstruction,
} from '@solana/web3.js';
import {
  bulldozerProgram,
  CreateInstructionRelationParams,
} from '../../../utils';

export const createCreateInstructionRelationInstruction = (
  authority: PublicKey,
  workspacePublicKey: PublicKey,
  applicationPublicKey: PublicKey,
  instructionPublicKey: PublicKey,
  relationPublicKey: PublicKey,
  relationBump: number,
  fromAccount: PublicKey,
  toAccount: PublicKey
): TransactionInstruction => {
  return bulldozerProgram.instruction.createInstructionRelation(
    { bump: relationBump },
    {
      accounts: {
        relation: relationPublicKey,
        workspace: workspacePublicKey,
        instruction: instructionPublicKey,
        application: applicationPublicKey,
        from: new PublicKey(fromAccount),
        to: new PublicKey(toAccount),
        authority,
        systemProgram: SystemProgram.programId,
        clock: SYSVAR_CLOCK_PUBKEY,
      },
    }
  );
};

export const createCreateInstructionRelationInstruction2 = (
  params: CreateInstructionRelationParams
): TransactionInstruction => {
  return bulldozerProgram.instruction.createInstructionRelation(
    { bump: params.instructionRelationBump },
    {
      accounts: {
        relation: new PublicKey(params.instructionRelationId),
        workspace: new PublicKey(params.workspaceId),
        instruction: new PublicKey(params.instructionId),
        application: new PublicKey(params.applicationId),
        from: new PublicKey(params.fromAccountId),
        to: new PublicKey(params.toAccountId),
        authority: new PublicKey(params.authority),
        systemProgram: SystemProgram.programId,
        clock: SYSVAR_CLOCK_PUBKEY,
      },
    }
  );
};
