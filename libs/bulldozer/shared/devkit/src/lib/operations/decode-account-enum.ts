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

type EncodedAccountModifier = {
  [key: string]: {
    id: number;
    space: number | null;
    close: PublicKey | null;
    payer: PublicKey | null;
  };
};

interface DecodedAccountModifier {
  id: number;
  name: string;
  space: number | null;
  close: string | null;
  payer: string | null;
}

export const decodeAccountModifier = (
  accountModifier: EncodedAccountModifier
): DecodedAccountModifier => {
  const accountModifierName = Object.keys(accountModifier)[0];
  return {
    id: accountModifier[accountModifierName].id,
    name: accountModifierName,
    space: accountModifier[accountModifierName].space || null,
    close: accountModifier[accountModifierName].close?.toBase58() || null,
    payer: accountModifier[accountModifierName].payer?.toBase58() || null,
  };
};
