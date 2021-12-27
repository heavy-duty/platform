export interface WorkspaceInfo {
  authority: string;
  name: string;
}

export interface Workspace {
  id: string;
  data: WorkspaceInfo;
}

export interface ApplicationInfo {
  authority: string;
  workspace: string;
  name: string;
}

export interface Application {
  id: string;
  data: ApplicationInfo;
}

export interface CollectionInfo {
  authority: string;
  workspace: string;
  application: string;
  name: string;
}

export interface Collection {
  id: string;
  data: CollectionInfo;
}

export interface CollectionAttributeInfo {
  authority: string;
  workspace: string;
  application: string;
  collection: string;
  name: string;
  kind: {
    id: number;
    name: string;
    size: number;
  };
  modifier: {
    id: number;
    name: string;
    size: number;
  } | null;
  max: number | null;
  maxLength: number | null;
}

export interface CollectionAttribute {
  id: string;
  data: CollectionAttributeInfo;
}

export interface CollectionAttributeDto {
  name: string;
  kind: number;
  modifier: number | null;
  size: number | null;
  max: number | null;
  maxLength: number | null;
}

export interface InstructionInfo {
  authority: string;
  workspace: string;
  application: string;
  name: string;
  body: string;
}

export interface Instruction {
  id: string;
  data: InstructionInfo;
}

export interface InstructionArgumentInfo {
  authority: string;
  workspace: string;
  application: string;
  instruction: string;
  name: string;
  kind: {
    id: number;
    name: string;
    size: number;
  };
  modifier: {
    id: number;
    name: string;
    size: number;
  } | null;
  max: number | null;
  maxLength: number | null;
}

export interface InstructionArgument {
  id: string;
  data: InstructionArgumentInfo;
}

export interface InstructionArgumentDto {
  name: string;
  kind: number;
  modifier: number | null;
  size: number | null;
  max: number | null;
  maxLength: number | null;
}

export interface Program {
  id: string;
  name: string;
}

export interface InstructionAccountInfo {
  authority: string;
  workspace: string;
  application: string;
  instruction: string;
  name: string;
  kind: {
    id: number;
    name: string;
  };
  modifier: {
    id: number;
    name: string;
  } | null;
  collection: string | null;
  space: number | null;
  payer: string | null;
  close: string | null;
}

export interface InstructionAccount {
  id: string;
  data: InstructionAccountInfo;
}

export interface InstructionAccountDto {
  name: string;
  kind: number;
  modifier: number | null;
  space: number | null;
}

export interface InstructionAccountExtras {
  collection: string | null;
  payer: string | null;
  close: string | null;
}

export interface InstructionRelationInfo {
  authority: string;
  workspace: string;
  application: string;
  instruction: string;
  from: string;
  to: string;
}

export interface InstructionRelation {
  id: string;
  data: InstructionRelationInfo;
}
