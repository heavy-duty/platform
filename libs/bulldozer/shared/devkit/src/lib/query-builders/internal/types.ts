export const AUTHORITY_FIELD_LABEL = 'authority';
export const WORKSPACE_FIELD_LABEL = 'workspace';
export const APPLICATION_FIELD_LABEL = 'application';
export const COLLECTION_FIELD_LABEL = 'collection';
export const INSTRUCTION_FIELD_LABEL = 'instruction';

export type FieldLabel =
  | typeof AUTHORITY_FIELD_LABEL
  | typeof WORKSPACE_FIELD_LABEL
  | typeof APPLICATION_FIELD_LABEL
  | typeof INSTRUCTION_FIELD_LABEL
  | typeof COLLECTION_FIELD_LABEL;

export type Filters = Partial<{
  [key in
    | typeof AUTHORITY_FIELD_LABEL
    | typeof WORKSPACE_FIELD_LABEL
    | typeof APPLICATION_FIELD_LABEL
    | typeof COLLECTION_FIELD_LABEL
    | typeof INSTRUCTION_FIELD_LABEL]: string;
}>;
