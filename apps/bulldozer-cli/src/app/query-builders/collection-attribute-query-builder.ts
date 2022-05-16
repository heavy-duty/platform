import {
	APPLICATION_FIELD_LABEL,
	AUTHORITY_FIELD_LABEL,
	COLLECTION_ATTRIBUTE_ACCOUNT_NAME,
	COLLECTION_FIELD_LABEL,
	QueryBuilder,
	QueryFilters,
	WORKSPACE_FIELD_LABEL,
} from './internal';

export type CollectionAttributeFilterKeys =
	| typeof AUTHORITY_FIELD_LABEL
	| typeof WORKSPACE_FIELD_LABEL
	| typeof APPLICATION_FIELD_LABEL
	| typeof COLLECTION_FIELD_LABEL;
export type CollectionAttributeFilters =
	QueryFilters<CollectionAttributeFilterKeys>;

export const collectionAttributeQueryBuilder = () =>
	new QueryBuilder<CollectionAttributeFilterKeys>(
		COLLECTION_ATTRIBUTE_ACCOUNT_NAME
	);
