import { AccountInfo, PublicKey } from '@solana/web3.js';
import { decodeAttributeEnum } from '../../../operations';
import { bulldozerProgram } from '../../../programs';
import {
  CollectionAttribute,
  COLLECTION_ATTRIBUTE_ACCOUNT_NAME,
  Document,
} from '../../../utils';

export const createCollectionAttributeDocument = (
  publicKey: PublicKey,
  account: AccountInfo<Buffer>
): Document<CollectionAttribute> => {
  const decodedAccount = bulldozerProgram.coder.accounts.decode(
    COLLECTION_ATTRIBUTE_ACCOUNT_NAME,
    account.data
  );
  const decodedKind = decodeAttributeEnum(decodedAccount.data.kind);
  const decodedModifier =
    decodedAccount.data.modifier &&
    decodeAttributeEnum(decodedAccount.data.modifier);

  return {
    id: publicKey.toBase58(),
    metadata: account,
    data: {
      name: decodedAccount.data.name,
      authority: decodedAccount.authority.toBase58(),
      workspace: decodedAccount.workspace.toBase58(),
      application: decodedAccount.application.toBase58(),
      collection: decodedAccount.collection.toBase58(),
      kind: decodedKind,
      modifier: decodedModifier,
      max: decodedKind?.id === 1 ? decodedKind.size : null,
      maxLength: decodedKind?.id === 2 ? decodedKind.size : null,
    },
  };
};
