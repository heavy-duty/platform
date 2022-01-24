import { PublicKey } from '@solana/web3.js';
import { bulldozerProgram } from '../../../programs';
import {
  Document,
  InstructionAccount,
  INSTRUCTION_ACCOUNT_ACCOUNT_NAME,
} from '../../../utils';

export const createInstructionAccountDocument = (
  publicKey: PublicKey,
  data: Buffer
): Document<InstructionAccount> => {
  const decodedAccount = bulldozerProgram.coder.accounts.decode(
    INSTRUCTION_ACCOUNT_ACCOUNT_NAME,
    data
  );
  const decodedKind = decodedAccount.kind[Object.keys(decodedAccount.kind)[0]];
  const decodedModifer =
    decodedAccount.modifier[Object.keys(decodedAccount.modifier)[0]];

  return {
    id: publicKey.toBase58(),
    metadata: decodedAccount,
    data: {
      name: decodedAccount.name,
      authority: decodedAccount.authority.toBase58(),
      workspace: decodedAccount.workspace.toBase58(),
      application: decodedAccount.application.toBase58(),
      instruction: decodedAccount.instruction.toBase58(),
      kind: decodedKind,
      modifier: decodedModifer,
      collection:
        decodedAccount.collection && decodedAccount.collection.toBase58(),
      close: decodedAccount.close && decodedAccount.close.toBase58(),
      payer: decodedAccount.payer && decodedAccount.payer.toBase58(),
      space: decodedAccount.space,
    },
  };
};
