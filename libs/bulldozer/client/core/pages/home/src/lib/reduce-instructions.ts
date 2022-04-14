import { InstructionStatus, UserDto } from '@heavy-duty/bulldozer-devkit';
import { UserItemView } from './types';

export const reduceInstructions = (
  item: UserItemView | null,
  instruction: InstructionStatus
): UserItemView | null => {
  switch (instruction.name) {
    case 'createUser': {
      if (
        instruction.transactionStatus.status === undefined ||
        instruction.transactionStatus.status === 'confirmed'
      ) {
        const data = instruction.data as {
          arguments: UserDto;
        };
        const name = data.arguments.name;
        const userName = data.arguments.userName;
        const thumbnailUrl = data.arguments.thumbnailUrl;

        const authority = instruction.accounts.find(
          (account) => account.name === 'Authority'
        )?.pubkey;
        const userId = instruction.accounts.find(
          (account) => account.name === 'User'
        )?.pubkey;

        if (authority === undefined || userId === undefined) {
          throw new Error('Malformed Create Instruction');
        }

        return {
          id: userId,
          name,
          isCreating: true,
          isUpdating: false,
          isDeleting: false,
          authority,
          userName,
          thumbnailUrl,
          createdAt: Date.now(),
        };
      } else if (instruction.transactionStatus.status === 'finalized') {
        if (item === null) {
          return null;
        } else {
          return {
            ...item,
            isCreating: false,
          };
        }
      } else {
        return item;
      }
    }
    case 'updateUser': {
      if (item === null) {
        return item;
      } else if (
        instruction.transactionStatus.status === undefined ||
        instruction.transactionStatus.status === 'confirmed'
      ) {
        const data = instruction.data as {
          arguments: UserDto;
        };
        const name = data.arguments.name;
        const userName = data.arguments.userName;
        const thumbnailUrl = data.arguments.thumbnailUrl;

        return {
          ...item,
          name,
          userName,
          thumbnailUrl,
          isUpdating: true,
        };
      } else if (instruction.transactionStatus.status === 'finalized') {
        return {
          ...item,
          isUpdating: false,
        };
      } else {
        return item;
      }
    }
    case 'deleteUser':
      if (item === null) {
        return item;
      } else if (
        instruction.transactionStatus.status === undefined ||
        instruction.transactionStatus.status === 'confirmed'
      ) {
        return {
          ...item,
          isDeleting: true,
        };
      } else if (instruction.transactionStatus.status === 'finalized') {
        return null;
      } else {
        return item;
      }
    default:
      return item;
  }
};
