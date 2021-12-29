import { AccountInfo, PublicKey } from '@solana/web3.js';
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
  const decodedKind = decodedAccount.data.kind
    ? decodedAccount.data.kind[Object.keys(decodedAccount.data.kind)[0]]
    : null;
  const decodedModifer = decodedAccount.data.modifier
    ? decodedAccount.data.modifier[Object.keys(decodedAccount.data.modifier)[0]]
    : null;

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
      modifier: decodedModifer,
      max: decodedKind.id === 1 ? decodedKind.size : null,
      maxLength: decodedKind.id === 2 ? decodedKind.size : null,
    },
  };
};
