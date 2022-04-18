import { InstructionStatus } from '@heavy-duty/bulldozer-devkit';
import { List } from 'immutable';
import { InstructionAccountCloseItemView } from './types';

export const reduceInstructions = (
  items: List<InstructionAccountCloseItemView>,
  instruction: InstructionStatus
): List<InstructionAccountCloseItemView> => {
  switch (instruction.name) {
    case 'setInstructionAccountClose': {
      const accountClose = instruction.accounts.find(
        (account) => account.name === 'Account Close'
      )?.pubkey;
      const close = instruction.accounts.find(
        (account) => account.name === 'Close'
      )?.pubkey;

      if (close === undefined || accountClose === undefined) {
        throw new Error('Malformed Set Instruction Account Close');
      }

      const itemIndex = items.findIndex((item) => item.id === accountClose);

      if (itemIndex === -1) {
        return items.push({
          id: accountClose,
          isUpdating: false,
          close,
        });
      } else {
        return items.update(itemIndex, (item) => ({
          ...item,
          id: accountClose,
          isUpdating: false,
          close,
        }));
      }
    }
    case 'clearInstructionAccountClose': {
      const accountClose = instruction.accounts.find(
        (account) => account.name === 'Account Close'
      )?.pubkey;

      if (accountClose === undefined) {
        throw new Error('Malformed Clear Instruction Account Close');
      }

      const itemIndex = items.findIndex((item) => item.id === accountClose);

      if (itemIndex === -1) {
        return items.push({
          id: accountClose,
          isUpdating: false,
          close: null,
        });
      } else {
        return items.update(itemIndex, (item) => ({
          ...item,
          id: accountClose,
          isUpdating: false,
          close: null,
        }));
      }
    }
    default:
      return items;
  }
};
