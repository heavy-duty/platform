import { BUDGET_ACCOUNT_NAME } from '../utils';
import {
  AUTHORITY_FIELD_LABEL,
  QueryBuilder,
  QueryFilters,
  WORKSPACE_FIELD_LABEL,
} from './internal';

export type BudgetFilterKeys =
  | typeof AUTHORITY_FIELD_LABEL
  | typeof WORKSPACE_FIELD_LABEL;
export type BudgetFilters = QueryFilters<BudgetFilterKeys>;

export const budgetQueryBuilder = () =>
  new QueryBuilder<BudgetFilterKeys>(BUDGET_ACCOUNT_NAME);
