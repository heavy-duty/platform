import { AccountInfo } from '@solana/web3.js';
import { bulldozerProgram } from '../programs';
import {
  InstructionRelation,
  INSTRUCTION_RELATION_ACCOUNT_NAME,
  Relation,
} from '../utils';

export const createInstructionRelationRelation = (
  publicKey: string,
  account: AccountInfo<Buffer>
): Relation<InstructionRelation> => {
  const decodedAccount = bulldozerProgram.coder.accounts.decode(
    INSTRUCTION_RELATION_ACCOUNT_NAME,
    account.data
  );

  return {
    id: publicKey,
    metadata: account,
    data: {
      authority: decodedAccount.authority.toBase58(),
      workspace: decodedAccount.workspace.toBase58(),
      application: decodedAccount.application.toBase58(),
      instruction: decodedAccount.instruction.toBase58(),
    },
    from: decodedAccount.from.toBase58(),
    to: decodedAccount.to.toBase58(),
    createdAt: decodedAccount.createdAt,
    updatedAt: decodedAccount.updatedAt,
  };
};
