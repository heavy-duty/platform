import { AccountInfo, PublicKey } from '@solana/web3.js';
import { bulldozerProgram } from '../../../programs';
import {
  Document,
  InstructionRelation,
  INSTRUCTION_RELATION_ACCOUNT_NAME,
} from '../../../utils';

export const createInstructionRelationDocument = (
  publicKey: PublicKey,
  account: AccountInfo<Buffer>
): Document<InstructionRelation> => {
  const decodedAccount = bulldozerProgram.coder.accounts.decode(
    INSTRUCTION_RELATION_ACCOUNT_NAME,
    account.data
  );

  return {
    id: publicKey.toBase58(),
    metadata: account,
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
