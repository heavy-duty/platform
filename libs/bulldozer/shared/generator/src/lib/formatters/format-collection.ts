import {
  Collection,
  CollectionAttribute,
  Document,
} from '@heavy-duty/bulldozer-devkit';
import { capitalize } from '../utils';
import { formatName } from './format-name';

const getAttributeKindName = (id: number, name: string, size: number) => {
  if (id === 0) {
    return 'bool';
  } else if (id === 1) {
    if (size <= 256) {
      return 'u8';
    } else if (size > 256 && size <= 65536) {
      return 'u16';
    } else if (size > 65536 && size <= 4294967296) {
      return 'u32';
    } else {
      throw Error('Invalid max');
    }
  } else if (id === 2 || id === 3) {
    return capitalize(name);
  } else {
    throw Error('Invalid kind');
  }
};

export const formatCollection = (
  collection: Document<Collection>,
  collectionAttributes: Document<CollectionAttribute>[]
) => ({
  name: formatName(collection.name),
  attributes:
    collectionAttributes &&
    collectionAttributes
      .filter((attribute) => attribute.data.collection === collection.id)
      .map((attribute) => ({
        id: attribute.id,
        name: formatName(attribute.name),
        data: {
          ...attribute.data,
          kind: {
            ...attribute.data.kind,
            name: getAttributeKindName(
              attribute.data.kind.id,
              attribute.data.kind.name,
              attribute.data.kind.size
            ),
          },
        },
      })),
});
