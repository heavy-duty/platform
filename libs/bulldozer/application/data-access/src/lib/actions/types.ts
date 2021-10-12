export enum ApplicationActionTypes {
  ApplicationInit = 'Application initialized',
  ApplicationCreated = 'Application created',
  ApplicationUpdated = 'Application updated',
  ApplicationDeleted = 'Application deleted',
}

export enum CollectionActionTypes {
  CollectionInit = 'Collection initialized',
  CollectionCreated = 'Collection created',
  CollectionUpdated = 'Collection updated',
  CollectionDeleted = 'Collection deleted',
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
  InstructionArgumentCreated = 'Instruction argument created',
  InstructionArgumentUpdated = 'Instruction argument updated',
  InstructionArgumentDeleted = 'Instruction argument deleted',
  InstructionRelationCreated = 'Instruction relation created',
  InstructionRelationUpdated = 'Instruction relation updated',
  InstructionRelationDeleted = 'Instruction relation deleted',
  InstructionAccountCreated = 'Instruction account created',
  InstructionAccountUpdated = 'Instruction account updated',
  InstructionAccountDeleted = 'Instruction account deleted',
}

export interface Action<T extends unknown> {
  type: ApplicationActionTypes | InstructionActionTypes | CollectionActionTypes;
  payload?: T;
}
