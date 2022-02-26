import { AccountInfo } from '@solana/web3.js';
import {
  InstructionRelation,
  INSTRUCTION_RELATION_ACCOUNT_NAME,
  Relation,
} from '../utils';
import { borshCoder } from './internal';

export const createInstructionRelationRelation = (
  publicKey: string,
  account: AccountInfo<Buffer>
): Relation<InstructionRelation> => {
  const decodedAccount = borshCoder.decode(
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
