import { AccountInfo, PublicKey } from '@solana/web3.js';
import {
  bulldozerProgram,
  CollectionAttribute,
  COLLECTION_ATTRIBUTE_ACCOUNT_NAME,
  decodeAttributeEnum,
  Document,
} from '..';

export const createCollectionAttributeDocument = (
  publicKey: PublicKey,
  account: AccountInfo<Buffer>
): Document<CollectionAttribute> => {
  const decodedAccount = bulldozerProgram.coder.accounts.decode(
    COLLECTION_ATTRIBUTE_ACCOUNT_NAME,
    account.data
  );
  const decodedKind = decodeAttributeEnum(decodedAccount.kind);
  const decodedModifier =
    decodedAccount.modifier && decodeAttributeEnum(decodedAccount.modifier);

  return {
    id: publicKey.toBase58(),
    metadata: account,
    name: decodedAccount.name,
    data: {
      authority: decodedAccount.authority.toBase58(),
      workspace: decodedAccount.workspace.toBase58(),
      application: decodedAccount.application.toBase58(),
      collection: decodedAccount.collection.toBase58(),
      kind: decodedKind,
      modifier: decodedModifier,
      max: decodedKind?.id === 1 ? decodedKind.size : null,
      maxLength: decodedKind?.id === 2 ? decodedKind.size : null,
    },
    createdAt: decodedAccount.createdAt,
    updatedAt: decodedAccount.updatedAt,
  };
};
