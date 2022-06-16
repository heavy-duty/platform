import { InstructionStatus } from '@heavy-duty/bulldozer-devkit';
import { List } from 'immutable';
import { InstructionAccountDerivationItemView } from './types';

export const reduceInstructions = (
	items: List<InstructionAccountDerivationItemView>,
	instruction: InstructionStatus
): List<InstructionAccountDerivationItemView> => {
	switch (instruction.name) {
		case 'setInstructionAccountDerivation': {
			const accountDerivation = instruction.accounts.find(
				(account) => account.name === 'Account Derivation'
			)?.pubkey;
			const derivation = instruction.accounts.find(
				(account) => account.name === 'Derivation'
			)?.pubkey;

			if (derivation === undefined || accountDerivation === undefined) {
				throw new Error('Malformed Set Instruction Account Derivation');
			}

			const itemIndex = items.findIndex(
				(item) => item.id === accountDerivation
			);

			console.log(instruction);

			if (itemIndex === -1) {
				return items;
			} else {
				return items;
			}
		}
		default:
			return items;
	}
};
