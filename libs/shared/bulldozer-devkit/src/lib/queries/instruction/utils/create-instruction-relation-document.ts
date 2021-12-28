import { PublicKey } from '@solana/web3.js';
import { bulldozerProgram } from '../../../programs';
import {
  Document,
  InstructionRelation,
  INSTRUCTION_RELATION_ACCOUNT_NAME,
} from '../../../utils';

export const createInstructionRelationDocument = (
  publicKey: PublicKey,
  data: Buffer
): Document<InstructionRelation> => {
  const decodedAccount = bulldozerProgram.coder.accounts.decode(
    INSTRUCTION_RELATION_ACCOUNT_NAME,
    data
  );

  return {
    id: publicKey.toBase58(),
    metadata: decodedAccount,
    data: {
      authority: decodedAccount.authority.toBase58(),
      workspace: decodedAccount.workspace.toBase58(),
      application: decodedAccount.application.toBase58(),
      instruction: decodedAccount.instruction.toBase58(),
      from: decodedAccount.from.toBase58(),
      to: decodedAccount.to.toBase58(),
    },
  };
};
