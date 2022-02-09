import { COLLECTION_ACCOUNT_NAME } from '../utils';
import {
  APPLICATION_FIELD_LABEL,
  AUTHORITY_FIELD_LABEL,
  QueryBuilder,
  QueryFilters,
  WORKSPACE_FIELD_LABEL,
} from './internal';

export type CollectionFilterKeys =
  | typeof AUTHORITY_FIELD_LABEL
  | typeof WORKSPACE_FIELD_LABEL
  | typeof APPLICATION_FIELD_LABEL;
export type CollectionFilters = QueryFilters<CollectionFilterKeys>;

export const collectionQueryBuilder = () =>
  new QueryBuilder<CollectionFilterKeys>(COLLECTION_ACCOUNT_NAME);
