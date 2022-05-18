import {
	APPLICATION_FIELD_LABEL,
	AUTHORITY_FIELD_LABEL,
	INSTRUCTION_ACCOUNT_NAME,
	QueryBuilder,
	QueryFilters,
	WORKSPACE_FIELD_LABEL,
} from './internal';

export type InstructionFilterKeys =
	| typeof AUTHORITY_FIELD_LABEL
	| typeof WORKSPACE_FIELD_LABEL
	| typeof APPLICATION_FIELD_LABEL;
export type InstructionFilters = QueryFilters<InstructionFilterKeys>;

export const instructionQueryBuilder = () =>
	new QueryBuilder<InstructionFilterKeys>(INSTRUCTION_ACCOUNT_NAME);
