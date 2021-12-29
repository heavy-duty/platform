type EncodedAccountEnum = { [key: string]: { id: number; size: number } };

interface DecodedAccountEnum {
  id: number;
  name: string;
}

export const decodeAccountEnum = (
  accountEnum: EncodedAccountEnum
): DecodedAccountEnum => {
  const accountEnumName = Object.keys(accountEnum)[0];
  return {
    id: accountEnum[accountEnumName].id,
    name: accountEnumName,
  };
};
