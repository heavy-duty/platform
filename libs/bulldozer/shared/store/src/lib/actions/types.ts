export const WORKSPACE_CREATED = 'Workspace created';
export const WORKSPACE_UPDATED = 'Workspace updated';
export const WORKSPACE_DELETED = 'Workspace deleted';

export type WorkspaceActionTypes =
  | typeof WORKSPACE_CREATED
  | typeof WORKSPACE_UPDATED
  | typeof WORKSPACE_DELETED;

export const APPLICATION_CREATED = 'Application created';
export const APPLICATION_UPDATED = 'Application updated';
export const APPLICATION_DELETED = 'Application deleted';

export type ApplicationActionTypes =
  | typeof APPLICATION_CREATED
  | typeof APPLICATION_UPDATED
  | typeof APPLICATION_DELETED;

export const COLLECTION_CREATED = 'Collection created';
export const COLLECTION_UPDATED = 'Collection updated';
export const COLLECTION_DELETED = 'Collection deleted';

export type CollectionActionTypes =
  | typeof COLLECTION_CREATED
  | typeof COLLECTION_UPDATED
  | typeof COLLECTION_DELETED;

export const COLLECTION_ATTRIBUTE_CREATED = 'Collection attribute created';
export const COLLECTION_ATTRIBUTE_UPDATED = 'Collection attribute updated';
export const COLLECTION_ATTRIBUTE_DELETED = 'Collection attribute deleted';

export type CollectionAttributeActionTypes =
  | typeof COLLECTION_ATTRIBUTE_CREATED
  | typeof COLLECTION_ATTRIBUTE_UPDATED
  | typeof COLLECTION_ATTRIBUTE_DELETED;

export const INSTRUCTION_CREATED = 'Instruction created';
export const INSTRUCTION_UPDATED = 'Instruction updated';
export const INSTRUCTION_BODY_UPDATED = 'Instruction body updated';
export const INSTRUCTION_DELETED = 'Instruction deleted';

export type InstructionActionTypes =
  | typeof INSTRUCTION_CREATED
  | typeof INSTRUCTION_UPDATED
  | typeof INSTRUCTION_BODY_UPDATED
  | typeof INSTRUCTION_DELETED;

export const INSTRUCTION_ACCOUNT_CREATED = 'Instruction account created';
export const INSTRUCTION_ACCOUNT_UPDATED = 'Instruction account updated';
export const INSTRUCTION_ACCOUNT_DELETED = 'Instruction account deleted';

export type InstructionAccountActionTypes =
  | typeof INSTRUCTION_ACCOUNT_CREATED
  | typeof INSTRUCTION_ACCOUNT_UPDATED
  | typeof INSTRUCTION_ACCOUNT_DELETED;

export const INSTRUCTION_ARGUMENT_CREATED = 'Instruction argument created';
export const INSTRUCTION_ARGUMENT_UPDATED = 'Instruction argument updated';
export const INSTRUCTION_ARGUMENT_DELETED = 'Instruction argument deleted';

export type InstructionArgumentActionTypes =
  | typeof INSTRUCTION_ARGUMENT_CREATED
  | typeof INSTRUCTION_ARGUMENT_UPDATED
  | typeof INSTRUCTION_ARGUMENT_DELETED;

export const INSTRUCTION_RELATION_CREATED = 'Instruction relation created';
export const INSTRUCTION_RELATION_UPDATED = 'Instruction relation updated';
export const INSTRUCTION_RELATION_DELETED = 'Instruction relation deleted';

export type InstructionRelationActionTypes =
  | typeof INSTRUCTION_RELATION_CREATED
  | typeof INSTRUCTION_RELATION_UPDATED
  | typeof INSTRUCTION_RELATION_DELETED;

export interface Action<T> {
  type:
    | WorkspaceActionTypes
    | ApplicationActionTypes
    | CollectionActionTypes
    | CollectionAttributeActionTypes
    | InstructionActionTypes
    | InstructionAccountActionTypes
    | InstructionArgumentActionTypes
    | InstructionRelationActionTypes;
  payload?: T;
}
