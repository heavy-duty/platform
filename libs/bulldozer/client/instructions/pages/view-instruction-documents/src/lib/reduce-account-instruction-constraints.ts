import { InstructionStatus } from '@heavy-duty/bulldozer-devkit';
import { List } from 'immutable';
import { InstructionAccountConstraintItemView } from './types';

export const reduceInstructions = (
	items: List<InstructionAccountConstraintItemView>,
	instruction: InstructionStatus
): List<InstructionAccountConstraintItemView> => {
	switch (instruction.name) {
		case 'createInstructionAccountConstraint': {
			const data = instruction.data as {
				arguments: {
					name: string;
					body: string;
				};
			};
			const name = data.arguments.name;
			const body = data.arguments.body;

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
			const accountConstraintId = instruction.accounts.find(
				(account) => account.name === 'Account Constraint'
			)?.pubkey;

			if (
				workspaceId === undefined ||
				applicationId === undefined ||
				instructionId === undefined ||
				accountId === undefined ||
				accountConstraintId === undefined
			) {
				throw new Error('Malformed Create Instruction Account Constraint');
			}

			const itemIndex = items.findIndex(
				(item) => item.id === accountConstraintId
			);

			if (
				instruction.transactionStatus.status === undefined ||
				instruction.transactionStatus.status === 'confirmed'
			) {
				if (itemIndex === -1) {
					return items.push({
						id: accountConstraintId,
						name,
						body,
						isCreating: true,
						isUpdating: false,
						isDeleting: false,
						accountId,
						instructionId,
						applicationId,
						workspaceId,
					});
				} else {
					return items.update(
						itemIndex,
						{
							id: accountConstraintId,
							name,
							body,
							isCreating: true,
							isUpdating: false,
							isDeleting: false,
							accountId,
							instructionId,
							applicationId,
							workspaceId,
						},
						(item) => ({
							...item,
							isCreating: true,
							name,
							body,
						})
					);
				}
			} else if (instruction.transactionStatus.status === 'finalized') {
				if (itemIndex === -1) {
					return items.push({
						id: accountConstraintId,
						name,
						body,
						isCreating: false,
						isUpdating: false,
						isDeleting: false,
						accountId,
						instructionId,
						applicationId,
						workspaceId,
					});
				} else {
					return items.update(
						itemIndex,
						{
							id: accountConstraintId,
							name,
							body,
							isCreating: false,
							isUpdating: false,
							isDeleting: false,
							accountId,
							instructionId,
							applicationId,
							workspaceId,
						},
						(item) => ({
							...item,
							isCreating: false,
						})
					);
				}
			} else {
				return items;
			}
		}
		case 'updateInstructionAccountConstraint': {
			const data = instruction.data as {
				arguments: {
					name: string;
					body: string;
				};
			};
			const name = data.arguments.name;
			const body = data.arguments.body;

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
			const accountConstraintId = instruction.accounts.find(
				(account) => account.name === 'Account Constraint'
			)?.pubkey;

			if (
				workspaceId === undefined ||
				applicationId === undefined ||
				instructionId === undefined ||
				accountId === undefined ||
				accountConstraintId === undefined
			) {
				throw new Error('Malformed Update Instruction Account Constraint');
			}

			const itemIndex = items.findIndex(
				(item) => item.id === accountConstraintId
			);

			if (
				instruction.transactionStatus.status === undefined ||
				instruction.transactionStatus.status === 'confirmed'
			) {
				if (itemIndex === -1) {
					return items.push({
						id: accountConstraintId,
						name,
						body,
						isCreating: true,
						isUpdating: false,
						isDeleting: false,
						accountId,
						instructionId,
						applicationId,
						workspaceId,
					});
				} else {
					return items.update(
						itemIndex,
						{
							id: accountConstraintId,
							name,
							body,
							isCreating: true,
							isUpdating: false,
							isDeleting: false,
							accountId,
							instructionId,
							applicationId,
							workspaceId,
						},
						(item) => ({
							...item,
							name,
							body,
							isCreating: true,
						})
					);
				}
			} else if (instruction.transactionStatus.status === 'finalized') {
				if (itemIndex === -1) {
					return items.push({
						id: accountConstraintId,
						name,
						body,
						isCreating: false,
						isUpdating: false,
						isDeleting: false,
						accountId,
						instructionId,
						applicationId,
						workspaceId,
					});
				} else {
					return items.update(
						itemIndex,
						{
							id: accountConstraintId,
							name,
							body,
							isCreating: false,
							isUpdating: false,
							isDeleting: false,
							accountId,
							instructionId,
							applicationId,
							workspaceId,
						},
						(item) => ({
							...item,
							isCreating: false,
						})
					);
				}
			} else {
				return items;
			}
		}
		case 'deleteInstructionAccountConstraint': {
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
			const accountConstraintId = instruction.accounts.find(
				(account) => account.name === 'Account Constraint'
			)?.pubkey;

			if (
				workspaceId === undefined ||
				applicationId === undefined ||
				instructionId === undefined ||
				accountId === undefined ||
				accountConstraintId === undefined
			) {
				throw new Error('Malformed Update Instruction Account Constraint');
			}

			const itemIndex = items.findIndex(
				(item) => item.id === accountConstraintId
			);

			if (
				instruction.transactionStatus.status === undefined ||
				instruction.transactionStatus.status === 'confirmed'
			) {
				if (itemIndex === -1) {
					return items;
				} else {
					return items.update(
						itemIndex,
						{
							id: accountConstraintId,
							name: '',
							body: '',
							isCreating: false,
							isUpdating: false,
							isDeleting: true,
							accountId,
							instructionId,
							applicationId,
							workspaceId,
						},
						(item) => ({
							...item,
							isDeleting: true,
						})
					);
				}
			} else if (instruction.transactionStatus.status === 'finalized') {
				if (itemIndex === -1) {
					return items;
				} else {
					return items.remove(itemIndex);
				}
			} else {
				return items;
			}
		}
		default: {
			return items;
		}
	}
};
