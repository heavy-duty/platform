import { CollectionExtended } from '@heavy-duty/bulldozer/application/utils/types';

import { formatName } from './format-name';

export const formatCollection = (collection: CollectionExtended) => ({
  name: formatName(collection.data.name),
  attributes:
    collection.attributes &&
    collection.attributes
      .filter((attribute) => attribute.data.collection === collection.id)
      .map((attribute) => {
        return {
          id: attribute.id,
          data: {
            ...attribute.data,
            name: formatName(attribute.data.name),
          },
        };
      }),
});
