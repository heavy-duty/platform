import {
  DepositToBudgetDto,
  InstructionStatus,
} from '@heavy-duty/bulldozer-devkit';
import { BudgetItemView } from './types';

export const reduceInstructions = (
  item: BudgetItemView | null,
  instruction: InstructionStatus
): BudgetItemView | null => {
  if (item === null) {
    return null;
  }

  switch (instruction.name) {
    case 'depositToBudget': {
      if (instruction.transactionStatus.status === 'confirmed') {
        const data = instruction.data as {
          arguments: DepositToBudgetDto;
        };
        const amount = data.arguments.amount;

        return {
          ...item,
          totalDeposited: item.totalDeposited + amount.toNumber(),
          totalValueLocked: item.totalValueLocked + amount.toNumber(),
          isUpdating: true,
        };
      } else if (instruction.transactionStatus.status === 'finalized') {
        return {
          ...item,
          isUpdating: false,
        };
      } else {
        return item;
      }
    }
    case 'withdrawFromBudget': {
      if (instruction.transactionStatus.status === 'confirmed') {
        const data = instruction.data as {
          arguments: DepositToBudgetDto;
        };
        const amount = data.arguments.amount;

        return {
          ...item,
          totalValueLocked: item.totalValueLocked - amount.toNumber(),
          isUpdating: true,
        };
      } else if (instruction.transactionStatus.status === 'finalized') {
        return {
          ...item,
          isUpdating: false,
        };
      } else {
        return item;
      }
    }
    default:
      return item;
  }
};
