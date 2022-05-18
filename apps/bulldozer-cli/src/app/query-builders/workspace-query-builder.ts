import {
	AUTHORITY_FIELD_LABEL,
	QueryBuilder,
	QueryFilters,
	WORKSPACE_ACCOUNT_NAME,
} from './internal';

export type WorkspaceFilterKeys = typeof AUTHORITY_FIELD_LABEL;
export type WorkspaceFilters = QueryFilters<WorkspaceFilterKeys>;

export const workspaceQueryBuilder = () =>
	new QueryBuilder<WorkspaceFilterKeys>(WORKSPACE_ACCOUNT_NAME);
