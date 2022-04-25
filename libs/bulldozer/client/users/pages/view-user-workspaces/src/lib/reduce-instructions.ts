import { InstructionStatus, WorkspaceDto } from '@heavy-duty/bulldozer-devkit';
import { List } from 'immutable';
import { WorkspaceItemView } from './types';

export const reduceInstructions = (
  items: List<WorkspaceItemView>,
  instruction: InstructionStatus
): List<WorkspaceItemView> => {
  switch (instruction.name) {
    case 'createWorkspace': {
      if (
        instruction.transactionStatus.status === undefined ||
        instruction.transactionStatus.status === 'confirmed'
      ) {
        const data = instruction.data as {
          arguments: WorkspaceDto;
        };
        const name = data.arguments.name;

        const workspaceId = instruction.accounts.find(
          (account) => account.name === 'Workspace'
        )?.pubkey;

        if (workspaceId === undefined) {
          throw new Error('Malformed Create Workspace');
        }

        const itemIndex = items.findIndex((item) => item.id === workspaceId);

        if (itemIndex === -1) {
          return items.push({
            id: workspaceId,
            name,
            isCreating: true,
            isUpdating: false,
            isDeleting: false,
          });
        } else {
          return items.update(itemIndex, (item) => ({
            ...item,
            id: workspaceId,
            name,
            isCreating: true,
            isUpdating: false,
            isDeleting: false,
          }));
        }
      } else if (instruction.transactionStatus.status === 'finalized') {
        return items.map((item) => {
          if (
            !instruction.accounts.some(
              (account) =>
                account.name === 'Workspace' && account.pubkey === item.id
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
    case 'updateWorkspace': {
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
                account.name === 'Workspace' && account.pubkey === item.id
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
                account.name === 'Workspace' && account.pubkey === item.id
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
    case 'deleteWorkspace':
      if (
        instruction.transactionStatus.status === undefined ||
        instruction.transactionStatus.status === 'confirmed'
      ) {
        return items.map((item) => {
          if (
            !instruction.accounts.some(
              (account) =>
                account.name === 'Workspace' && account.pubkey === item.id
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
                account.name === 'Workspace' && account.pubkey === item.id
            )
        );
      } else {
        return items;
      }
    default:
      return items;
  }
};
