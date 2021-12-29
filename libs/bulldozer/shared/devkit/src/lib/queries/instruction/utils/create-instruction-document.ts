import { AccountInfo, PublicKey } from '@solana/web3.js';
import { bulldozerProgram } from '../../../programs';
import {
  Document,
  Instruction,
  INSTRUCTION_ACCOUNT_NAME,
} from '../../../utils';

export const createInstructionDocument = (
  publicKey: PublicKey,
  account: AccountInfo<Buffer>
): Document<Instruction> => {
  const decodedAccount = bulldozerProgram.coder.accounts.decode(
    INSTRUCTION_ACCOUNT_NAME,
    account.data
  );

  return {
    id: publicKey.toBase58(),
    metadata: account,
    data: {
      name: decodedAccount.name,
      body: decodedAccount.body,
      authority: decodedAccount.authority.toBase58(),
      workspace: decodedAccount.workspace.toBase58(),
      application: decodedAccount.application.toBase58(),
    },
  };
};
