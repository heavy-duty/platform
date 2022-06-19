import { INSTRUCTION_ACCOUNT_CONSTRAINT_ACCOUNT_NAME } from '../utils';
import {
	APPLICATION_FIELD_LABEL,
	AUTHORITY_FIELD_LABEL,
	INSTRUCTION_ACCOUNT_FIELD_LABEL,
	INSTRUCTION_FIELD_LABEL,
	QueryBuilder,
	QueryFilters,
	WORKSPACE_FIELD_LABEL,
} from './internal';

export type InstructionAccountConstraintFilterKeys =
	| typeof AUTHORITY_FIELD_LABEL
	| typeof WORKSPACE_FIELD_LABEL
	| typeof APPLICATION_FIELD_LABEL
	| typeof INSTRUCTION_FIELD_LABEL
	| typeof INSTRUCTION_ACCOUNT_FIELD_LABEL;
export type InstructionAccountConstraintFilters =
	QueryFilters<InstructionAccountConstraintFilterKeys>;

export const instructionAccountConstraintQueryBuilder = () =>
	new QueryBuilder<InstructionAccountConstraintFilterKeys>(
		INSTRUCTION_ACCOUNT_CONSTRAINT_ACCOUNT_NAME
	);
