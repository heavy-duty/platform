import { INSTRUCTION_ARGUMENT_ACCOUNT_NAME } from '../utils';
import {
  APPLICATION_FIELD_LABEL,
  AUTHORITY_FIELD_LABEL,
  INSTRUCTION_FIELD_LABEL,
  QueryBuilder,
  QueryFilters,
  WORKSPACE_FIELD_LABEL,
} from './internal';

export type InstructionArgumentFilterKeys =
  | typeof AUTHORITY_FIELD_LABEL
  | typeof WORKSPACE_FIELD_LABEL
  | typeof APPLICATION_FIELD_LABEL
  | typeof INSTRUCTION_FIELD_LABEL;
export type InstructionArgumentFilters =
  QueryFilters<InstructionArgumentFilterKeys>;

export const instructionArgumentQueryBuilder = () =>
  new QueryBuilder<InstructionArgumentFilterKeys>(
    INSTRUCTION_ARGUMENT_ACCOUNT_NAME
  );
