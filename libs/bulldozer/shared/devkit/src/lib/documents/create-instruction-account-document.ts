import { AccountInfo } from '@solana/web3.js';
import { bulldozerProgram } from '../programs';
import {
  Document,
  InstructionAccount,
  INSTRUCTION_ACCOUNT_ACCOUNT_NAME,
} from '../utils';
import { decodeAccountKind, decodeAccountModifier } from './internal';

export const createInstructionAccountDocument = (
  publicKey: string,
  account: AccountInfo<Buffer>
): Document<InstructionAccount> => {
  const decodedAccount = bulldozerProgram.coder.accounts.decode(
    INSTRUCTION_ACCOUNT_ACCOUNT_NAME,
    account.data
  );

  return {
    id: publicKey,
    metadata: account,
    name: decodedAccount.name,
    data: {
      authority: decodedAccount.authority.toBase58(),
      workspace: decodedAccount.workspace.toBase58(),
      application: decodedAccount.application.toBase58(),
      instruction: decodedAccount.instruction.toBase58(),
      kind: decodeAccountKind(decodedAccount.kind),
      modifier:
        decodedAccount.modifier &&
        decodeAccountModifier(decodedAccount.modifier),
    },
    createdAt: decodedAccount.createdAt,
    updatedAt: decodedAccount.updatedAt,
  };
};
