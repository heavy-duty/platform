import { INSTRUCTION_RELATION_ACCOUNT_NAME } from '../utils';
import {
  APPLICATION_FIELD_LABEL,
  AUTHORITY_FIELD_LABEL,
  INSTRUCTION_FIELD_LABEL,
  QueryBuilder,
  QueryFilters,
  RELATION_FROM_FIELD_LABEL,
  RELATION_TO_FIELD_LABEL,
  WORKSPACE_FIELD_LABEL,
} from './internal';

export type InstructionRelationFilterKeys =
  | typeof AUTHORITY_FIELD_LABEL
  | typeof WORKSPACE_FIELD_LABEL
  | typeof APPLICATION_FIELD_LABEL
  | typeof INSTRUCTION_FIELD_LABEL
  | typeof RELATION_FROM_FIELD_LABEL
  | typeof RELATION_TO_FIELD_LABEL;
export type InstructionRelationFilters =
  QueryFilters<InstructionRelationFilterKeys>;

export const instructionRelationQueryBuilder = () =>
  new QueryBuilder<InstructionRelationFilterKeys>(
    INSTRUCTION_RELATION_ACCOUNT_NAME
  );
