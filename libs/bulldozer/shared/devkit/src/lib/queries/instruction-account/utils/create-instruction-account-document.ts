import { AccountInfo, PublicKey } from '@solana/web3.js';
import { decodeAccountKind, decodeAccountModifier } from '../../../operations';
import { bulldozerProgram } from '../../../programs';
import {
  Document,
  InstructionAccount,
  INSTRUCTION_ACCOUNT_ACCOUNT_NAME,
} from '../../../utils';

export const createInstructionAccountDocument = (
  publicKey: PublicKey,
  account: AccountInfo<Buffer>
): Document<InstructionAccount> => {
  const decodedAccount = bulldozerProgram.coder.accounts.decode(
    INSTRUCTION_ACCOUNT_ACCOUNT_NAME,
    account.data
  );

  return {
    id: publicKey.toBase58(),
    metadata: account,
    data: {
      name: decodedAccount.name,
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
