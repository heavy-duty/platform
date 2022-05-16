import {
	APPLICATION_ACCOUNT_NAME,
	AUTHORITY_FIELD_LABEL,
	QueryBuilder,
	QueryFilters,
	WORKSPACE_FIELD_LABEL,
} from './internal';

export type ApplicationFilterKeys =
	| typeof AUTHORITY_FIELD_LABEL
	| typeof WORKSPACE_FIELD_LABEL;
export type ApplicationFilters = QueryFilters<ApplicationFilterKeys>;

export const applicationQueryBuilder = () =>
	new QueryBuilder<ApplicationFilterKeys>(APPLICATION_ACCOUNT_NAME);
