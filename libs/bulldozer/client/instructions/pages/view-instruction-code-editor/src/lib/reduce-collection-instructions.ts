import { CollectionDto, InstructionStatus } from '@heavy-duty/bulldozer-devkit';
import { List } from 'immutable';
import { CollectionItemView } from './types';

export const reduceInstructions = (
  items: List<CollectionItemView>,
  instruction: InstructionStatus
): List<CollectionItemView> => {
  switch (instruction.name) {
    case 'createCollection': {
      if (
        instruction.transactionStatus.status === undefined ||
        instruction.transactionStatus.status === 'confirmed'
      ) {
        const data = instruction.data as {
          arguments: CollectionDto;
        };
        const name = data.arguments.name;

        const workspaceId = instruction.accounts.find(
          (account) => account.name === 'Workspace'
        )?.pubkey;
        const applicationId = instruction.accounts.find(
          (account) => account.name === 'Application'
        )?.pubkey;
        const instructionId = instruction.accounts.find(
          (account) => account.name === 'Collection'
        )?.pubkey;

        if (
          workspaceId === undefined ||
          applicationId === undefined ||
          instructionId === undefined
        ) {
          throw new Error('Malformed Create Collection');
        }

        const itemIndex = items.findIndex((item) => item.id === instructionId);

        if (itemIndex === -1) {
          return items.push({
            id: instructionId,
            name,
            isCreating: true,
            isUpdating: false,
            isDeleting: false,
            applicationId,
            workspaceId,
          });
        } else {
          return items.update(itemIndex, (item) => ({
            ...item,
            id: instructionId,
            name,
            isCreating: true,
            isUpdating: false,
            isDeleting: false,
            applicationId,
            workspaceId,
          }));
        }
      } else if (instruction.transactionStatus.status === 'finalized') {
        return items.map((item) => {
          if (
            !instruction.accounts.some(
              (account) =>
                account.name === 'Collection' && account.pubkey === item.id
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
    case 'updateCollection': {
      if (
        instruction.transactionStatus.status === undefined ||
        instruction.transactionStatus.status === 'confirmed'
      ) {
        const data = instruction.data as {
          arguments: { name: string };
        };
        const name = data.arguments.name;

        return items.map((item) => {
          if (
            !instruction.accounts.some(
              (account) =>
                account.name === 'Collection' && account.pubkey === item.id
            )
          ) {
            return item;
          }

          return {
            ...item,
            name,
            isUpdating: true,
          };
        });
      } else if (instruction.transactionStatus.status === 'finalized') {
        return items.map((item) => {
          if (
            !instruction.accounts.some(
              (account) =>
                account.name === 'Collection' && account.pubkey === item.id
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
    case 'deleteCollection':
      if (
        instruction.transactionStatus.status === undefined ||
        instruction.transactionStatus.status === 'confirmed'
      ) {
        return items.map((item) => {
          if (
            !instruction.accounts.some(
              (account) =>
                account.name === 'Collection' && account.pubkey === item.id
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
                account.name === 'Collection' && account.pubkey === item.id
            )
        );
      } else {
        return items;
      }
    default:
      return items;
  }
};
