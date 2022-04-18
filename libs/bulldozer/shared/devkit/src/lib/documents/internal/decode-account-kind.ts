type EncodedAccountKind = {
  [key: string]: { id: number };
};

interface DecodedAccountKind {
  id: number;
  name: string;
}

export const decodeAccountKind = (
  accountKind: EncodedAccountKind
): DecodedAccountKind => {
  const accountKindName = Object.keys(accountKind)[0];
  return {
    id: accountKind[accountKindName].id,
    name: accountKindName,
  };
};
