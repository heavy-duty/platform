import { InstructionStatus } from '@heavy-duty/bulldozer-devkit';
import { List } from 'immutable';
import { ApplicationItemView } from './types';

export const reduceInstructions = (
  items: List<ApplicationItemView>,
  instruction: InstructionStatus
): List<ApplicationItemView> => {
  switch (instruction.name) {
    case 'createApplication': {
      if (
        instruction.transactionStatus.status === undefined ||
        instruction.transactionStatus.status === 'confirmed'
      ) {
        const data = instruction.data as {
          arguments: { name: string };
        };
        const name = data.arguments.name;

        const workspaceId = instruction.accounts.find(
          (account) => account.name === 'Workspace'
        )?.pubkey;
        const applicationId = instruction.accounts.find(
          (account) => account.name === 'Application'
        )?.pubkey;

        if (workspaceId === undefined || applicationId === undefined) {
          throw new Error('Malformed Create Application');
        }

        const itemIndex = items.findIndex((item) => item.id === applicationId);

        if (itemIndex === -1) {
          return items.push({
            id: applicationId,
            name,
            isCreating: true,
            isUpdating: false,
            isDeleting: false,
            workspaceId,
          });
        } else {
          return items.update(itemIndex, (item) => ({
            ...item,
            id: applicationId,
            name,
            isCreating: true,
            isUpdating: false,
            isDeleting: false,
            workspaceId,
          }));
        }
      } else if (instruction.transactionStatus.status === 'finalized') {
        return items.map((item) => {
          if (
            !instruction.accounts.some(
              (account) =>
                account.name === 'Application' && account.pubkey === item.id
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
    case 'updateApplication': {
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
                account.name === 'Application' && account.pubkey === item.id
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
                account.name === 'Application' && account.pubkey === item.id
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
    case 'deleteApplication':
      if (
        instruction.transactionStatus.status === undefined ||
        instruction.transactionStatus.status === 'confirmed'
      ) {
        return items.map((item) => {
          if (
            !instruction.accounts.some(
              (account) =>
                account.name === 'Application' && account.pubkey === item.id
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
                account.name === 'Application' && account.pubkey === item.id
            )
        );
      } else {
        return items;
      }
    default:
      return items;
  }
};
