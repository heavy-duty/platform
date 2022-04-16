import {
  CollectionAttributeDto,
  InstructionStatus,
} from '@heavy-duty/bulldozer-devkit';
import { List } from 'immutable';
import { CollectionAttributeItemView } from './types';

const decodeAttributeKind = (
  id: number,
  size: number
): { id: number; name: string; size: number } => {
  switch (id) {
    case 0:
      return {
        id,
        name: 'boolean',
        size,
      };
    case 1:
      return {
        id,
        name: 'number',
        size,
      };
    case 2:
      return {
        id,
        name: 'string',
        size,
      };
    case 3:
      return {
        id,
        name: 'pubkey',
        size,
      };
    default:
      throw Error('Invalid kind id');
  }
};

const decodeAttributeModifier = (
  id: number,
  size: number
): { id: number; name: string; size: number } => {
  switch (id) {
    case 0:
      return {
        id,
        name: 'array',
        size,
      };
    case 1:
      return {
        id,
        name: 'vector',
        size,
      };
    default:
      throw Error('Invalid kind id');
  }
};

const getAttributeKindSize = (
  kind: number,
  extensions: { max: number | null; maxLength: number | null }
): number => {
  switch (kind) {
    case 0:
      return 1;
    case 1:
      if (extensions.max === null) {
        throw Error('Max is required for numbers');
      }
      return extensions.max;
    case 2:
      if (extensions.maxLength === null) {
        throw Error('Max length is required for strings');
      }
      return extensions.maxLength;
    case 3:
      return 32;
    default:
      throw Error('Invalid Attribute Kind');
  }
};

export const reduceInstructions = (
  items: List<CollectionAttributeItemView>,
  instruction: InstructionStatus
): List<CollectionAttributeItemView> => {
  switch (instruction.name) {
    case 'createCollectionAttribute': {
      if (
        instruction.transactionStatus.status === undefined ||
        instruction.transactionStatus.status === 'confirmed'
      ) {
        const data = instruction.data as {
          arguments: CollectionAttributeDto;
        };
        const name = data.arguments.name;
        const kind = decodeAttributeKind(
          data.arguments.kind,
          getAttributeKindSize(data.arguments.kind, {
            max: data.arguments.max,
            maxLength: data.arguments.maxLength,
          })
        );
        let modifier: {
          id: number;
          name: string;
          size: number;
        } | null = null;
        if (data.arguments.modifier !== null && data.arguments.size !== null) {
          modifier = decodeAttributeModifier(
            data.arguments.modifier,
            data.arguments.size
          );
        }

        const workspaceId = instruction.accounts.find(
          (account) => account.name === 'Workspace'
        )?.pubkey;
        const applicationId = instruction.accounts.find(
          (account) => account.name === 'Application'
        )?.pubkey;
        const collectionId = instruction.accounts.find(
          (account) => account.name === 'Collection'
        )?.pubkey;
        const argumentId = instruction.accounts.find(
          (account) => account.name === 'Attribute'
        )?.pubkey;

        if (
          workspaceId === undefined ||
          applicationId === undefined ||
          collectionId === undefined ||
          argumentId === undefined
        ) {
          throw new Error('Malformed Create Collection Attribute');
        }

        const itemIndex = items.findIndex((item) => item.id === argumentId);

        if (itemIndex === -1) {
          return items.push({
            id: argumentId,
            name,
            kind,
            modifier,
            isCreating: true,
            isUpdating: false,
            isDeleting: false,
            collectionId,
            applicationId,
            workspaceId,
          });
        } else {
          return items.update(itemIndex, (item) => ({
            ...item,
            id: argumentId,
            name,
            kind,
            modifier,
            isCreating: true,
            isUpdating: false,
            isDeleting: false,
            collectionId,
            applicationId,
            workspaceId,
          }));
        }
      } else if (instruction.transactionStatus.status === 'finalized') {
        return items.map((item) => {
          if (
            !instruction.accounts.some(
              (account) =>
                account.name === 'Attribute' && account.pubkey === item.id
            )
          ) {
            return item;
          }

          return {
            ...item,
            isCreating: false,
          };
        });
      } else {
        return items;
      }
    }
    case 'updateCollectionAttribute': {
      if (
        instruction.transactionStatus.status === undefined ||
        instruction.transactionStatus.status === 'confirmed'
      ) {
        const data = instruction.data as {
          arguments: CollectionAttributeDto;
        };
        const name = data.arguments.name;
        const kind = decodeAttributeKind(
          data.arguments.kind,
          getAttributeKindSize(data.arguments.kind, {
            max: data.arguments.max,
            maxLength: data.arguments.maxLength,
          })
        );
        let modifier: {
          id: number;
          name: string;
          size: number;
        } | null = null;
        if (data.arguments.modifier !== null && data.arguments.size !== null) {
          modifier = decodeAttributeModifier(
            data.arguments.modifier,
            data.arguments.size
          );
        }

        return items.map((item) => {
          if (
            !instruction.accounts.some(
              (account) =>
                account.name === 'Attribute' && account.pubkey === item.id
            )
          ) {
            return item;
          }

          return {
            ...item,
            name,
            kind,
            modifier,
            isUpdating: true,
          };
        });
      } else if (instruction.transactionStatus.status === 'finalized') {
        return items.map((item) => {
          if (
            !instruction.accounts.some(
              (account) =>
                account.name === 'Attribute' && account.pubkey === item.id
            )
          ) {
            return item;
          }

          return {
            ...item,
            isUpdating: false,
          };
        });
      } else {
        return items;
      }
    }
    case 'deleteCollectionAttribute':
      if (
        instruction.transactionStatus.status === undefined ||
        instruction.transactionStatus.status === 'confirmed'
      ) {
        return items.map((item) => {
          if (
            !instruction.accounts.some(
              (account) =>
                account.name === 'Attribute' && account.pubkey === item.id
            )
          ) {
            return item;
          }

          return {
            ...item,
            isDeleting: true,
          };
        });
      } else if (instruction.transactionStatus.status === 'finalized') {
        return items.filter(
          (item) =>
            !instruction.accounts.some(
              (account) =>
                account.name === 'Attribute' && account.pubkey === item.id
            )
        );
      } else {
        return items;
      }
    default:
      return items;
  }
};
