export enum WorkspaceActionTypes {
  WorkspaceCreated = 'Workspace created',
  WorkspaceUpdated = 'Workspace updated',
  WorkspaceDeleted = 'Workspace deleted',
}

export enum ApplicationActionTypes {
  ApplicationCreated = 'Application created',
  ApplicationUpdated = 'Application updated',
  ApplicationDeleted = 'Application deleted',
}

export enum CollectionActionTypes {
  CollectionCreated = 'Collection created',
  CollectionUpdated = 'Collection updated',
  CollectionDeleted = 'Collection deleted',
}

export enum CollectionAttributeActionTypes {
  CollectionAttributeCreated = 'Collection attribute created',
  CollectionAttributeUpdated = 'Collection attribute updated',
  CollectionAttributeDeleted = 'Collection attribute deleted',
}

export enum InstructionActionTypes {
  InstructionInit = 'Instruction initialized',
  InstructionCreated = 'Instruction created',
  InstructionUpdated = 'Instruction updated',
  InstructionDeleted = 'Instruction deleted',
  InstructionBodyUpdated = 'Instruction body updated',
}

export enum InstructionAccountActionTypes {
  InstructionAccountCreated = 'Instruction account created',
  InstructionAccountUpdated = 'Instruction account updated',
  InstructionAccountDeleted = 'Instruction account deleted',
}
export enum InstructionArgumentActionTypes {
  InstructionArgumentCreated = 'Instruction argument created',
  InstructionArgumentUpdated = 'Instruction argument updated',
  InstructionArgumentDeleted = 'Instruction argument deleted',
}

export enum InstructionRelationActionTypes {
  InstructionRelationCreated = 'Instruction relation created',
  InstructionRelationUpdated = 'Instruction relation updated',
  InstructionRelationDeleted = 'Instruction relation deleted',
}

export interface Action<T> {
  type:
    | WorkspaceActionTypes
    | ApplicationActionTypes
    | InstructionActionTypes
    | InstructionAccountActionTypes
    | InstructionArgumentActionTypes
    | InstructionRelationActionTypes
    | CollectionActionTypes
    | CollectionAttributeActionTypes;
  payload?: T;
}
