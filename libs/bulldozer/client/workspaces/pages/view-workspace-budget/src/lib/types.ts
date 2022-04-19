export interface BudgetItemView {
  id: string;
  workspaceId: string;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  totalDeposited: number;
  totalValueLocked: number;
}
