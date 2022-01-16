import {
  PublicKey,
  SystemProgram,
  SYSVAR_CLOCK_PUBKEY,
  TransactionInstruction,
} from '@solana/web3.js';
import { bulldozerProgram } from '../../../programs';

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
