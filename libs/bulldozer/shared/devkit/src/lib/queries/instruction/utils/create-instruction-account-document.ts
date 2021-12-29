import { AccountInfo, PublicKey } from '@solana/web3.js';
import { bulldozerProgram } from '../../../programs';
import {
  Document,
  InstructionAccount,
  INSTRUCTION_ACCOUNT_ACCOUNT_NAME,
} from '../../../utils';

const decodeAccountEnum = (accountEnum: { [key: string]: { id: number } }) => {
  const accountEnumName = Object.keys(accountEnum)[0];
  return accountEnum && accountEnumName
    ? {
        id: accountEnum[accountEnumName].id,
        name: accountEnumName,
      }
    : null;
};

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
      name: decodedAccount.data.name,
      authority: decodedAccount.authority.toBase58(),
      workspace: decodedAccount.workspace.toBase58(),
      application: decodedAccount.application.toBase58(),
      instruction: decodedAccount.instruction.toBase58(),
      kind:
        decodedAccount.data.kind && decodeAccountEnum(decodedAccount.data.kind),
      modifier:
        decodedAccount.data.modifier &&
        decodeAccountEnum(decodedAccount.data.modifier),
      collection:
        decodedAccount.data.collection &&
        decodedAccount.data.collection.toBase58(),
      close: decodedAccount.data.close && decodedAccount.data.close.toBase58(),
      payer: decodedAccount.data.payer && decodedAccount.data.payer.toBase58(),
      space: decodedAccount.data.space,
    },
  };
};
