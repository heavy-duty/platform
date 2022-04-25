type EncodedAccountModifier = {
  [key: string]: {
    id: number;
  };
};

interface DecodedAccountModifier {
  id: number;
  name: string;
}

export const decodeAccountModifier = (
  accountModifier: EncodedAccountModifier
): DecodedAccountModifier => {
  const accountModifierName = Object.keys(accountModifier)[0];
  return {
    id: accountModifier[accountModifierName].id,
    name: accountModifierName,
  };
};
