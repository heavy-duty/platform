import {
	AUTHORITY_FIELD_LABEL,
	QueryBuilder,
	QueryFilters,
	USER_ACCOUNT_NAME,
} from './internal';

export type UserFilterKeys = typeof AUTHORITY_FIELD_LABEL;
export type UserFilters = QueryFilters<UserFilterKeys>;

export const userQueryBuilder = () =>
	new QueryBuilder<UserFilterKeys>(USER_ACCOUNT_NAME);
