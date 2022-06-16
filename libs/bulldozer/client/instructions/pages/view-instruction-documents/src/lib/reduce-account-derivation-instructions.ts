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

			if (accountDerivation === undefined) {
				throw new Error('Malformed Set Instruction Account Derivation');
			}

			const itemIndex = items.findIndex(
				(item) => item.id === accountDerivation
			);

			const data = instruction.data as {
				arguments: { name: string };
			};
			const name = data.arguments.name;

			console.log(name, name ?? null);

			return items.update(
				itemIndex,
				{
					id: accountDerivation,
					isUpdating: instruction.transactionStatus.status !== 'finalized',
					name,
					bumpPath: null,
					seedPaths: [],
				},
				(item: InstructionAccountDerivationItemView) => ({
					...item,
					isUpdating: instruction.transactionStatus.status !== 'finalized',
					name,
				})
			);
		}
		case 'clearInstructionAccountDerivation': {
			const accountDerivation = instruction.accounts.find(
				(account) => account.name === 'Account Derivation'
			)?.pubkey;

			if (accountDerivation === undefined) {
				throw new Error('Malformed Set Instruction Account Derivation');
			}

			const itemIndex = items.findIndex(
				(item) => item.id === accountDerivation
			);

			return items.update(
				itemIndex,
				{
					id: accountDerivation,
					isUpdating: instruction.transactionStatus.status !== 'finalized',
					name: null,
					bumpPath: null,
					seedPaths: [],
				},
				(item: InstructionAccountDerivationItemView) => ({
					...item,
					isUpdating: instruction.transactionStatus.status !== 'finalized',
					name: null,
					bumpPath: null,
					seedPaths: [],
				})
			);
		}
		case 'setBumpToDerivation': {
			const accountDerivation = instruction.accounts.find(
				(account) => account.name === 'Account Derivation'
			)?.pubkey;
			const reference = instruction.accounts.find(
				(account) => account.name === 'Reference'
			)?.pubkey;
			const path = instruction.accounts.find(
				(account) => account.name === 'Path'
			)?.pubkey;

			if (
				accountDerivation === undefined ||
				reference === undefined ||
				path === undefined
			) {
				throw new Error('Malformed Set Instruction Account Derivation');
			}

			const itemIndex = items.findIndex(
				(item) => item.id === accountDerivation
			);

			return items.update(
				itemIndex,
				{
					id: accountDerivation,
					isUpdating: instruction.transactionStatus.status !== 'finalized',
					name: null,
					bumpPath: {
						path,
						reference,
					},
					seedPaths: [],
				},
				(item: InstructionAccountDerivationItemView) => ({
					...item,
					isUpdating: instruction.transactionStatus.status !== 'finalized',
					bumpPath: {
						path,
						reference,
					},
				})
			);
		}
		case 'addSeedToDerivation': {
			const accountDerivation = instruction.accounts.find(
				(account) => account.name === 'Account Derivation'
			)?.pubkey;
			const reference = instruction.accounts.find(
				(account) => account.name === 'Reference'
			)?.pubkey;

			if (accountDerivation === undefined || reference === undefined) {
				throw new Error('Malformed Set Instruction Account Derivation');
			}

			const itemIndex = items.findIndex(
				(item) => item.id === accountDerivation
			);

			return items.update(
				itemIndex,
				{
					id: accountDerivation,
					isUpdating: instruction.transactionStatus.status !== 'finalized',
					name: null,
					bumpPath: null,
					seedPaths: [reference],
				},
				(item: InstructionAccountDerivationItemView) => ({
					...item,
					isUpdating: instruction.transactionStatus.status !== 'finalized',
					seedPaths: [...item.seedPaths, reference],
				})
			);
		}
		default:
			return items;
	}
};
