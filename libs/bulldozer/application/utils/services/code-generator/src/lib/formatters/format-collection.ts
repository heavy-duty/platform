import { CollectionExtended } from '@heavy-duty/bulldozer/application/utils/types';
import { capitalize } from '../utils';

import { formatName } from './format-name';

export const formatCollection = (collection: CollectionExtended) => ({
  name: formatName(collection.data.name),
  attributes:
    collection.attributes &&
    collection.attributes
      .filter((attribute) => attribute.data.collection === collection.id)
      .map((attribute) => ({
        id: attribute.id,
        data: {
          ...attribute.data,
          name: formatName(attribute.data.name),
          kind: {
            ...attribute.data.kind,
            name:
              attribute.data.kind.id === 5
                ? capitalize(attribute.data.kind.name)
                : attribute.data.kind.name,
          },
        },
      })),
});
