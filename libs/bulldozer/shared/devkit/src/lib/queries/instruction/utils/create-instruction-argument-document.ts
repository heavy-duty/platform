import { AccountInfo, PublicKey } from '@solana/web3.js';
import { bulldozerProgram } from '../../../programs';
import {
  Document,
  InstructionArgument,
  INSTRUCTION_ARGUMENT_ACCOUNT_NAME,
} from '../../../utils';

export const createInstructionArgumentDocument = (
  publicKey: PublicKey,
  account: AccountInfo<Buffer>
): Document<InstructionArgument> => {
  const decodedAccount = bulldozerProgram.coder.accounts.decode(
    INSTRUCTION_ARGUMENT_ACCOUNT_NAME,
    account.data
  );
  const decodedKind = decodedAccount.kind[Object.keys(decodedAccount.kind)[0]];
  const decodedModifer =
    decodedAccount.modifier[Object.keys(decodedAccount.modifier)[0]];

  return {
    id: publicKey.toBase58(),
    metadata: account,
    data: {
      name: decodedAccount.name,
      authority: decodedAccount.authority.toBase58(),
      workspace: decodedAccount.workspace.toBase58(),
      application: decodedAccount.application.toBase58(),
      instruction: decodedAccount.instruction.toBase58(),
      kind: decodedKind,
      modifier: decodedModifer,
      max: decodedKind.id === 1 ? decodedKind.size : null,
      maxLength: decodedKind.id === 2 ? decodedKind.size : null,
    },
  };
};
