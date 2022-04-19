import { DepositToBudgetDto, WithdrawFromBudgetDto } from '../../utils';

export interface DepositToBudgetParams {
  authority: string;
  workspaceId: string;
  depositToBudgetDto: DepositToBudgetDto;
}

export interface WithdrawFromBudgetParams {
  authority: string;
  workspaceId: string;
  withdrawFromBudgetDto: WithdrawFromBudgetDto;
}
