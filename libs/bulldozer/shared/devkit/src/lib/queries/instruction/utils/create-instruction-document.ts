import { PublicKey } from '@solana/web3.js';
import { bulldozerProgram } from '../../../programs';
import {
  Document,
  Instruction,
  INSTRUCTION_ACCOUNT_NAME,
} from '../../../utils';

export const createInstructionDocument = (
  publicKey: PublicKey,
  data: Buffer
): Document<Instruction> => {
  const decodedAccount = bulldozerProgram.coder.accounts.decode(
    INSTRUCTION_ACCOUNT_NAME,
    data
  );

  return {
    id: publicKey.toBase58(),
    metadata: decodedAccount,
    data: {
      name: decodedAccount.name,
      body: decodedAccount.body,
      authority: decodedAccount.authority.toBase58(),
      workspace: decodedAccount.workspace.toBase58(),
      application: decodedAccount.application.toBase58(),
    },
  };
};
