import { InstructionStatus } from '@heavy-duty/bulldozer-devkit';
import { List } from 'immutable';
import { InstructionRelationItemView } from './types';

export const reduceInstructions = (
  items: List<InstructionRelationItemView>,
  instruction: InstructionStatus
): List<InstructionRelationItemView> => {
  switch (instruction.name) {
    case 'createInstructionRelation': {
      if (
        instruction.transactionStatus.status === undefined ||
        instruction.transactionStatus.status === 'confirmed'
      ) {
        const workspaceId = instruction.accounts.find(
          (account) => account.name === 'Workspace'
        )?.pubkey;
        const applicationId = instruction.accounts.find(
          (account) => account.name === 'Application'
        )?.pubkey;
        const instructionId = instruction.accounts.find(
          (account) => account.name === 'Instruction'
        )?.pubkey;
        const fromId = instruction.accounts.find(
          (account) => account.name === 'From'
        )?.pubkey;
        const toId = instruction.accounts.find(
          (account) => account.name === 'To'
        )?.pubkey;
        const relationId = instruction.accounts.find(
          (account) => account.name === 'Relation'
        )?.pubkey;

        if (
          workspaceId === undefined ||
          applicationId === undefined ||
          instructionId === undefined ||
          fromId === undefined ||
          toId === undefined ||
          relationId === undefined
        ) {
          throw new Error('Malformed Create Instruction Relation');
        }

        const itemIndex = items.findIndex((item) => item.id === relationId);

        if (itemIndex === -1) {
          return items.push({
            id: relationId,
            isCreating: true,
            isUpdating: false,
            isDeleting: false,
            instructionId,
            applicationId,
            workspaceId,
            from: fromId,
            to: toId,
          });
        } else {
          return items.update(itemIndex, (item) => ({
            ...item,
            id: relationId,
            isCreating: true,
            isUpdating: false,
            isDeleting: false,
            instructionId,
            applicationId,
            workspaceId,
            from: fromId,
            to: toId,
          }));
        }
      } else if (instruction.transactionStatus.status === 'finalized') {
        return items.map((item) => {
          if (
            !instruction.accounts.some(
              (account) =>
                account.name === 'Relation' && account.pubkey === item.id
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
    case 'deleteInstructionRelation':
      if (
        instruction.transactionStatus.status === undefined ||
        instruction.transactionStatus.status === 'confirmed'
      ) {
        return items.map((item) => {
          if (
            !instruction.accounts.some(
              (account) =>
                account.name === 'Relation' && account.pubkey === item.id
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
                account.name === 'Relation' && account.pubkey === item.id
            )
        );
      } else {
        return items;
      }
    default:
      return items;
  }
};
