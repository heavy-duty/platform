type EncodedAttributeEnum = { [key: string]: { id: number; size: number } };

interface DecodedAttributeEnum {
  id: number;
  name: string;
  size: number;
}

export const decodeAttributeEnum = (
  attributeEnum: EncodedAttributeEnum
): DecodedAttributeEnum => {
  const attributeEnumName = Object.keys(attributeEnum)[0];
  return {
    id: attributeEnum[attributeEnumName].id,
    name: attributeEnumName,
    size: attributeEnum[attributeEnumName].size,
  };
};
