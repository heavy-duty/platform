import {
  InstructionAccountDto,
  InstructionStatus,
} from '@heavy-duty/bulldozer-devkit';
import { List } from 'immutable';
import { InstructionAccountItemView } from './types';

const decodeAccountKind = (id: number): { id: number; name: string } => {
  switch (id) {
    case 0: {
      return {
        id,
        name: 'document',
      };
    }
    case 1:
      return {
        id,
        name: 'signer',
      };
    default:
      throw Error('Invalid kind id');
  }
};

const decodeAccountModifier = (
  id: number
): {
  id: number;
  name: string;
} => {
  switch (id) {
    case 0: {
      return {
        id,
        name: 'init',
      };
    }
    case 1:
      return {
        id,
        name: 'mut',
      };
    default:
      throw Error('Invalid kind id');
  }
};

export const reduceInstructions = (
  items: List<InstructionAccountItemView>,
  instruction: InstructionStatus
): List<InstructionAccountItemView> => {
  switch (instruction.name) {
    case 'createInstructionAccount': {
      if (
        instruction.transactionStatus.status === undefined ||
        instruction.transactionStatus.status === 'confirmed'
      ) {
        const data = instruction.data as {
          arguments: InstructionAccountDto;
        };
        const name = data.arguments.name;
        const kind = decodeAccountKind(data.arguments.kind);
        let modifier: {
          id: number;
          name: string;
        } | null = null;
        if (data.arguments.modifier !== null) {
          modifier = decodeAccountModifier(data.arguments.modifier);
        }

        const workspaceId = instruction.accounts.find(
          (account) => account.name === 'Workspace'
        )?.pubkey;
        const applicationId = instruction.accounts.find(
          (account) => account.name === 'Application'
        )?.pubkey;
        const instructionId = instruction.accounts.find(
          (account) => account.name === 'Instruction'
        )?.pubkey;
        const accountId = instruction.accounts.find(
          (account) => account.name === 'Account'
        )?.pubkey;

        if (
          workspaceId === undefined ||
          applicationId === undefined ||
          instructionId === undefined ||
          accountId === undefined
        ) {
          throw new Error('Malformed Create Instruction Account');
        }

        const itemIndex = items.findIndex((item) => item.id === accountId);

        if (itemIndex === -1) {
          return items.push({
            id: accountId,
            name,
            kind,
            modifier,
            isCreating: true,
            isUpdating: false,
            isDeleting: false,
            instructionId,
            applicationId,
            workspaceId,
          });
        } else {
          return items.update(itemIndex, (item) => ({
            ...item,
            id: accountId,
            name,
            kind,
            modifier,
            isCreating: true,
            isUpdating: false,
            isDeleting: false,
            instructionId,
            applicationId,
            workspaceId,
          }));
        }
      } else if (instruction.transactionStatus.status === 'finalized') {
        return items.map((item) => {
          if (
            !instruction.accounts.some(
              (account) =>
                account.name === 'Account' && account.pubkey === item.id
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
    case 'updateInstructionAccount': {
      if (
        instruction.transactionStatus.status === undefined ||
        instruction.transactionStatus.status === 'confirmed'
      ) {
        const data = instruction.data as {
          arguments: InstructionAccountDto;
        };
        const name = data.arguments.name;
        let modifier: {
          id: number;
          name: string;
        } | null = null;
        if (data.arguments.modifier !== null) {
          modifier = decodeAccountModifier(data.arguments.modifier);
        }

        return items.map((item) => {
          if (
            !instruction.accounts.some(
              (account) =>
                account.name === 'Account' && account.pubkey === item.id
            )
          ) {
            return item;
          }

          return {
            ...item,
            name,
            modifier,
            isUpdating: true,
          };
        });
      } else if (instruction.transactionStatus.status === 'finalized') {
        return items.map((item) => {
          if (
            !instruction.accounts.some(
              (account) =>
                account.name === 'Account' && account.pubkey === item.id
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
    case 'deleteInstructionAccount':
      if (
        instruction.transactionStatus.status === undefined ||
        instruction.transactionStatus.status === 'confirmed'
      ) {
        return items.map((item) => {
          if (
            !instruction.accounts.some(
              (account) =>
                account.name === 'Account' && account.pubkey === item.id
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
                account.name === 'Account' && account.pubkey === item.id
            )
        );
      } else {
        return items;
      }
    default:
      return items;
  }
};
