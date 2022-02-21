import { COLLABORATOR_ACCOUNT_NAME } from '../utils';
import {
  AUTHORITY_FIELD_LABEL,
  QueryBuilder,
  QueryFilters,
  WORKSPACE_FIELD_LABEL,
} from './internal';

export type CollaboratorFilterKeys =
  | typeof AUTHORITY_FIELD_LABEL
  | typeof WORKSPACE_FIELD_LABEL;
export type CollaboratorFilters = QueryFilters<CollaboratorFilterKeys>;

export const collaboratorQueryBuilder = () =>
  new QueryBuilder<CollaboratorFilterKeys>(COLLABORATOR_ACCOUNT_NAME);
