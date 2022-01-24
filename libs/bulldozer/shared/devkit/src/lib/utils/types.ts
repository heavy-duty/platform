export interface CollectionAttributeDto {
  name: string;
  kind: number;
  modifier: number | null;
  size: number | null;
  max: number | null;
  maxLength: number | null;
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

export interface InstructionArgumentDto {
  name: string;
  kind: number;
  modifier: number | null;
  size: number | null;
  max: number | null;
  maxLength: number | null;
}

export interface Workspace {
  authority: string;
  name: string;
}

export interface Application {
  authority: string;
  workspace: string;
  name: string;
}

export interface Collection {
  authority: string;
  workspace: string;
  application: string;
  name: string;
}

export interface CollectionAttribute {
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

export interface Instruction {
  authority: string;
  workspace: string;
  application: string;
  name: string;
  body: string;
}

export interface InstructionArgument {
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

export interface InstructionAccount {
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

export interface InstructionRelation {
  authority: string;
  workspace: string;
  application: string;
  instruction: string;
  from: string;
  to: string;
}

export interface Document<T> {
  id: string;
  data: T;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata: any;
}
