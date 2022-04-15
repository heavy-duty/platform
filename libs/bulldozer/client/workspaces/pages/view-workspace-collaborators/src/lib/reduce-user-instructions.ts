import { InstructionStatus, UserDto } from '@heavy-duty/bulldozer-devkit';
import { Map } from 'immutable';
import { UserItemView } from './types';

export const reduceInstructions = (
  items: Map<string, UserItemView>,
  instruction: InstructionStatus
): Map<string, UserItemView> => {
  switch (instruction.name) {
    case 'createUser': {
      const userId = instruction.accounts.find(
        (account) => account.name === 'User'
      )?.pubkey;
      const authority = instruction.accounts.find(
        (account) => account.name === 'Authority'
      )?.pubkey;

      if (userId === undefined || authority === undefined) {
        throw new Error(`Malformed ${instruction.name}`);
      }

      const data = instruction.data as { arguments: UserDto };
      const name = data.arguments.name;
      const userName = data.arguments.userName;
      const thumbnailUrl = data.arguments.thumbnailUrl;

      return items.set(userId, {
        id: userId,
        isCreating: instruction.transactionStatus.status === 'finalized',
        isUpdating: false,
        isDeleting: false,
        authority,
        name,
        userName,
        thumbnailUrl,
      });
    }
    case 'updateUser': {
      const userId = instruction.accounts.find(
        (account) => account.name === 'User'
      )?.pubkey;

      if (userId === undefined) {
        throw new Error(`Malformed ${instruction.name}`);
      }

      const item = items.get(userId);

      if (item === undefined) {
        return items;
      }

      const data = instruction.data as { arguments: UserDto };
      const name = data.arguments.name;
      const userName = data.arguments.userName;
      const thumbnailUrl = data.arguments.thumbnailUrl;

      return items.set(userId, {
        ...item,
        name,
        userName,
        thumbnailUrl,
        isUpdating: instruction.transactionStatus.status !== 'finalized',
      });
    }
    case 'deleteUser': {
      const userId = instruction.accounts.find(
        (account) => account.name === 'User'
      )?.pubkey;

      if (userId === undefined) {
        throw new Error(`Malformed ${instruction.name}`);
      }

      if (instruction.transactionStatus.status === 'finalized') {
        return items.delete(userId);
      }

      const item = items.get(userId);

      if (item === undefined) {
        return items;
      }

      return items.set(userId, {
        ...item,
        isDeleting: true,
      });
    }
    default:
      return items;
  }
};
