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

			if (instruction.transactionStatus.status === 'confirmed') {
				if (itemIndex === -1) {
					return items.push({
						id: accountDerivation,
						isUpdating: true,
						name,
						bumpPath: null,
						seedPaths: [],
					});
				} else {
					return items.update(
						itemIndex,
						{
							id: accountDerivation,
							isUpdating: true,
							name,
							bumpPath: null,
							seedPaths: [],
						},
						(item) => ({
							...item,
							isUpdating: true,
							name,
						})
					);
				}
			} else if (instruction.transactionStatus.status === 'finalized') {
				return items.update(
					itemIndex,
					{
						id: accountDerivation,
						isUpdating: false,
						name,
						bumpPath: null,
						seedPaths: [],
					},
					(item) => ({
						...item,
						isUpdating: false,
					})
				);
			} else {
				return items;
			}
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

			if (instruction.transactionStatus.status === 'confirmed') {
				if (itemIndex === -1) {
					return items.push({
						id: accountDerivation,
						isUpdating: true,
						name: null,
						bumpPath: null,
						seedPaths: [],
					});
				} else {
					return items.update(
						itemIndex,
						{
							id: accountDerivation,
							isUpdating: true,
							name: null,
							bumpPath: null,
							seedPaths: [],
						},
						(item) => ({
							...item,
							isUpdating: true,
							name: null,
							bumpPath: null,
							seedPaths: [],
						})
					);
				}
			} else if (instruction.transactionStatus.status === 'finalized') {
				return items.update(
					itemIndex,
					{
						id: accountDerivation,
						isUpdating: false,
						name: null,
						bumpPath: null,
						seedPaths: [],
					},
					(item) => ({
						...item,
						isUpdating: false,
					})
				);
			} else {
				return items;
			}
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

			if (instruction.transactionStatus.status === 'confirmed') {
				if (itemIndex === -1) {
					return items.push({
						id: accountDerivation,
						isUpdating: true,
						name: null,
						bumpPath: {
							path,
							reference,
						},
						seedPaths: [],
					});
				} else {
					return items.update(
						itemIndex,
						{
							id: accountDerivation,
							isUpdating: true,
							name: null,
							bumpPath: {
								path,
								reference,
							},
							seedPaths: [],
						},
						(item) => ({
							...item,
							isUpdating: true,
							bumpPath: {
								path,
								reference,
							},
						})
					);
				}
			} else if (instruction.transactionStatus.status === 'finalized') {
				return items.update(
					itemIndex,
					{
						id: accountDerivation,
						isUpdating: false,
						name: null,
						bumpPath: {
							path,
							reference,
						},
						seedPaths: [],
					},
					(item) => ({
						...item,
						isUpdating: false,
					})
				);
			} else {
				return items;
			}
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

			if (instruction.transactionStatus.status === 'confirmed') {
				if (itemIndex === -1) {
					return items.push({
						id: accountDerivation,
						isUpdating: true,
						name: null,
						bumpPath: null,
						seedPaths: [reference],
					});
				} else {
					return items.update(
						itemIndex,
						{
							id: accountDerivation,
							isUpdating: true,
							name: null,
							bumpPath: null,
							seedPaths: [reference],
						},
						(item) => ({
							...item,
							isUpdating: true,
							seedPaths: [...item.seedPaths, reference],
						})
					);
				}
			} else if (instruction.transactionStatus.status === 'finalized') {
				return items.update(
					itemIndex,
					{
						id: accountDerivation,
						isUpdating: false,
						name: null,
						bumpPath: null,
						seedPaths: [reference],
					},
					(item) => ({
						...item,
						isUpdating: false,
					})
				);
			} else {
				return items;
			}
		}
		default:
			return items;
	}
};
