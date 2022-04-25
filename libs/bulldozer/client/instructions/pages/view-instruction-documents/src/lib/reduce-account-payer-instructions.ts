import { InstructionStatus } from '@heavy-duty/bulldozer-devkit';
import { List } from 'immutable';
import { InstructionAccountPayerItemView } from './types';

export const reduceInstructions = (
  items: List<InstructionAccountPayerItemView>,
  instruction: InstructionStatus
): List<InstructionAccountPayerItemView> => {
  switch (instruction.name) {
    case 'setInstructionAccountPayer': {
      const accountPayer = instruction.accounts.find(
        (account) => account.name === 'Account Payer'
      )?.pubkey;
      const payer = instruction.accounts.find(
        (account) => account.name === 'Payer'
      )?.pubkey;

      if (payer === undefined || accountPayer === undefined) {
        throw new Error('Malformed Set Instruction Account Payer');
      }

      const itemIndex = items.findIndex((item) => item.id === accountPayer);

      if (itemIndex === -1) {
        return items.push({
          id: accountPayer,
          isUpdating: false,
          payer,
        });
      } else {
        return items.update(itemIndex, (item) => ({
          ...item,
          id: accountPayer,
          isUpdating: false,
          payer,
        }));
      }
    }
    default:
      return items;
  }
};
