import {
	APPLICATION_ACCOUNT_NAME,
	BUDGET_ACCOUNT_NAME,
	COLLABORATOR_ACCOUNT_NAME,
	COLLECTION_ACCOUNT_NAME,
	COLLECTION_ATTRIBUTE_ACCOUNT_NAME,
	INSTRUCTION_ACCOUNT_ACCOUNT_NAME,
	INSTRUCTION_ACCOUNT_NAME,
	INSTRUCTION_ARGUMENT_ACCOUNT_NAME,
	INSTRUCTION_RELATION_ACCOUNT_NAME,
	USER_ACCOUNT_NAME,
	WORKSPACE_ACCOUNT_NAME,
} from './consts';

export const AUTHORITY_FIELD_LABEL = 'authority';
export const WORKSPACE_FIELD_LABEL = 'workspace';
export const APPLICATION_FIELD_LABEL = 'application';
export const COLLECTION_FIELD_LABEL = 'collection';
export const INSTRUCTION_FIELD_LABEL = 'instruction';
export const ACCOUNT_KIND_FIELD_LABEL = 'accountKind';
export const RELATION_FROM_FIELD_LABEL = 'from';
export const RELATION_TO_FIELD_LABEL = 'to';

export type FieldLabel =
	| typeof AUTHORITY_FIELD_LABEL
	| typeof WORKSPACE_FIELD_LABEL
	| typeof APPLICATION_FIELD_LABEL
	| typeof INSTRUCTION_FIELD_LABEL
	| typeof COLLECTION_FIELD_LABEL
	| typeof ACCOUNT_KIND_FIELD_LABEL
	| typeof RELATION_FROM_FIELD_LABEL
	| typeof RELATION_TO_FIELD_LABEL;

export type Filters = Partial<{
	[key in
		| typeof AUTHORITY_FIELD_LABEL
		| typeof WORKSPACE_FIELD_LABEL
		| typeof APPLICATION_FIELD_LABEL
		| typeof COLLECTION_FIELD_LABEL
		| typeof INSTRUCTION_FIELD_LABEL
		| typeof ACCOUNT_KIND_FIELD_LABEL
		| typeof RELATION_FROM_FIELD_LABEL
		| typeof RELATION_TO_FIELD_LABEL]: string;
}>;

export type AccountName =
	| typeof USER_ACCOUNT_NAME
	| typeof COLLABORATOR_ACCOUNT_NAME
	| typeof BUDGET_ACCOUNT_NAME
	| typeof WORKSPACE_ACCOUNT_NAME
	| typeof APPLICATION_ACCOUNT_NAME
	| typeof COLLECTION_ACCOUNT_NAME
	| typeof COLLECTION_ATTRIBUTE_ACCOUNT_NAME
	| typeof INSTRUCTION_ACCOUNT_NAME
	| typeof INSTRUCTION_ARGUMENT_ACCOUNT_NAME
	| typeof INSTRUCTION_ACCOUNT_ACCOUNT_NAME
	| typeof INSTRUCTION_RELATION_ACCOUNT_NAME;
