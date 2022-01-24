export const LAYOUT_AUTHORITY_OFFSET = 8;
export const LAYOUT_WORKSPACE_OFFSET = 40;

export const WORKSPACE_ACCOUNT_NAME = 'workspace';
export const APPLICATION_ACCOUNT_NAME = 'application';
export const COLLECTION_ACCOUNT_NAME = 'collection';
export const COLLECTION_ATTRIBUTE_ACCOUNT_NAME = 'collectionAttribute';
export const INSTRUCTION_ACCOUNT_NAME = 'instruction';
export const INSTRUCTION_ARGUMENT_ACCOUNT_NAME = 'instructionArgument';
export const INSTRUCTION_ACCOUNT_ACCOUNT_NAME = 'instructionAccount';
export const INSTRUCTION_RELATION_ACCOUNT_NAME = 'instructionRelation';
export type AccountName =
  | typeof WORKSPACE_ACCOUNT_NAME
  | typeof APPLICATION_ACCOUNT_NAME
  | typeof COLLECTION_ACCOUNT_NAME
  | typeof COLLECTION_ATTRIBUTE_ACCOUNT_NAME
  | typeof INSTRUCTION_ACCOUNT_NAME
  | typeof INSTRUCTION_ARGUMENT_ACCOUNT_NAME
  | typeof INSTRUCTION_ACCOUNT_ACCOUNT_NAME
  | typeof INSTRUCTION_RELATION_ACCOUNT_NAME;