import { PublicKey } from '@solana/web3.js';
import { bulldozerProgram } from '../../../programs';
import {
  CollectionAttribute,
  COLLECTION_ATTRIBUTE_ACCOUNT_NAME,
  Document,
} from '../../../utils';

export const createCollectionAttributeDocument = (
  publicKey: PublicKey,
  data: Buffer
): Document<CollectionAttribute> => {
  const decodedAccount = bulldozerProgram.coder.accounts.decode(
    COLLECTION_ATTRIBUTE_ACCOUNT_NAME,
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
      collection: decodedAccount.collection.toBase58(),
      kind: decodedKind,
      modifier: decodedModifer,
      max: decodedKind.id === 1 ? decodedKind.size : null,
      maxLength: decodedKind.id === 2 ? decodedKind.size : null,
    },
  };
};
