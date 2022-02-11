import { PublicKey } from '@solana/web3.js';

type EncodedAccountKind = {
  [key: string]: { id: number; collection: PublicKey | null };
};

interface DecodedAccountKind {
  id: number;
  name: string;
  collection: string | null;
}

export const decodeAccountKind = (
  accountKind: EncodedAccountKind
): DecodedAccountKind => {
  const accountKindName = Object.keys(accountKind)[0];
  return {
    id: accountKind[accountKindName].id,
    name: accountKindName,
    collection: accountKind[accountKindName].collection?.toBase58() || null,
  };
};
