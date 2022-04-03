import { INSTRUCTION_ACCOUNT_ACCOUNT_NAME } from '../utils';
import {
  ACCOUNT_KIND_FIELD_LABEL,
  APPLICATION_FIELD_LABEL,
  AUTHORITY_FIELD_LABEL,
  INSTRUCTION_FIELD_LABEL,
  QueryBuilder,
  QueryFilters,
  WORKSPACE_FIELD_LABEL,
} from './internal';

export type InstructionAccountFilterKeys =
  | typeof AUTHORITY_FIELD_LABEL
  | typeof WORKSPACE_FIELD_LABEL
  | typeof APPLICATION_FIELD_LABEL
  | typeof INSTRUCTION_FIELD_LABEL
  | typeof ACCOUNT_KIND_FIELD_LABEL;
export type InstructionAccountFilters =
  QueryFilters<InstructionAccountFilterKeys>;

export const instructionAccountQueryBuilder = () =>
  new QueryBuilder<InstructionAccountFilterKeys>(
    INSTRUCTION_ACCOUNT_ACCOUNT_NAME
  );
