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
		case 2:
			return {
				id,
				name: 'unchecked',
			};
		case 3:
			return {
				id,
				name: 'mint',
			};
		case 4:
			return {
				id,
				name: 'token',
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
				const space = data.arguments.space;
				const kind = decodeAccountKind(data.arguments.kind);
				const uncheckedExplanation = data.arguments.uncheckedExplanation;
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
				const collection =
					instruction.accounts.find(
						(account) => account.name === 'Account Collection'
					)?.pubkey ?? null;
				const derivation =
					instruction.accounts.find(
						(account) => account.name === 'Account Derivation'
					)?.pubkey ?? null;
				const close =
					instruction.accounts.find(
						(account) => account.name === 'Account Close'
					)?.pubkey ?? null;
				const payer =
					instruction.accounts.find(
						(account) => account.name === 'Account Payer'
					)?.pubkey ?? null;

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
						space,
						collection,
						close,
						payer,
						derivation,
						uncheckedExplanation,
						tokenAuthority: null,
						mint: null,
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
						space,
						collection,
						close,
						payer,
						derivation,
						uncheckedExplanation,
						tokenAuthority: null,
						mint: null,
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
		case 'setTokenCofiguration': {
			const accountId = instruction.accounts.find(
				(account) => account.name === 'Account'
			)?.pubkey;
			const mint = instruction.accounts.find(
				(account) => account.name === 'Mint'
			)?.pubkey;
			const tokenAuthority = instruction.accounts.find(
				(account) => account.name === 'Token Authority'
			)?.pubkey;
			const workspaceId = instruction.accounts.find(
				(account) => account.name === 'Workspace'
			)?.pubkey;
			const applicationId = instruction.accounts.find(
				(account) => account.name === 'Application'
			)?.pubkey;
			const instructionId = instruction.accounts.find(
				(account) => account.name === 'Instruction'
			)?.pubkey;

			if (
				accountId === undefined ||
				mint === undefined ||
				tokenAuthority === undefined ||
				workspaceId === undefined ||
				applicationId === undefined ||
				instructionId === undefined
			) {
				throw new Error('Malformed Set Token Configuration');
			}

			const itemIndex = items.findIndex((item) => item.id === accountId);

			return items.update(
				itemIndex,
				{
					id: accountId,
					isUpdating: instruction.transactionStatus.status !== 'finalized',
					name: '',
					workspaceId,
					applicationId,
					instructionId,
					isCreating: false,
					isDeleting: false,
					close: null,
					derivation: null,
					collection: null,
					kind: { id: 4, name: 'token' },
					payer: null,
					modifier: {
						id: 0,
						name: 'init',
					},
					space: null,
					uncheckedExplanation: null,
					mint,
					tokenAuthority,
				},
				(item: InstructionAccountItemView) => ({
					...item,
					isUpdating: instruction.transactionStatus.status !== 'finalized',
					mint,
					tokenAuthority,
				})
			);
		}
		default: {
			return items;
		}
	}
};
