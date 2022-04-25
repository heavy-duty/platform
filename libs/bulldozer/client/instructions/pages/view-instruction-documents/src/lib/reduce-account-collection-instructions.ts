import { InstructionStatus } from '@heavy-duty/bulldozer-devkit';
import { List } from 'immutable';
import { InstructionAccountCollectionItemView } from './types';

export const reduceInstructions = (
  items: List<InstructionAccountCollectionItemView>,
  instruction: InstructionStatus
): List<InstructionAccountCollectionItemView> => {
  switch (instruction.name) {
    case 'setInstructionAccountCollection': {
      const accountCollection = instruction.accounts.find(
        (account) => account.name === 'Account Collection'
      )?.pubkey;
      const collection = instruction.accounts.find(
        (account) => account.name === 'Collection'
      )?.pubkey;

      if (collection === undefined || accountCollection === undefined) {
        throw new Error('Malformed Set Instruction Account Collection');
      }

      const itemIndex = items.findIndex(
        (item) => item.id === accountCollection
      );

      if (itemIndex === -1) {
        return items.push({
          id: accountCollection,
          isUpdating: false,
          collection,
        });
      } else {
        return items.update(itemIndex, (item) => ({
          ...item,
          id: accountCollection,
          isUpdating: false,
          collection,
        }));
      }
    }
    default:
      return items;
  }
};
