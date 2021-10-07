export interface CollectionAttributeInfo {
  authority: string;
  application: string;
  collection: string;
  name: string;
  kind: {
    name: string;
    size: number;
  };
  modifier: {
    name: string;
    size: number;
  };
  bump: number;
}

export interface CollectionAttribute {
  id: string;
  data: CollectionAttributeInfo;
}

export interface CollectionAttributeInfoExt
  extends Omit<CollectionAttributeInfo, 'name'> {
  name: IFormatedName;
}

export interface CollectionAttributeExt {
  id: string;
  data: CollectionAttributeInfoExt;
}

export interface InstructionArgumentInfo {
  authority: string;
  application: string;
  collection: string;
  instruction: string;
  name: string;
  kind: string;
  modifier: {
    name: string;
    size: number;
  };
  bump: number;
}

export interface InstructionArgument {
  id: string;
  data: InstructionArgumentInfo;
}

export interface InstructionArgumentInfoExt
  extends Omit<InstructionArgumentInfo, 'name'> {
  name: IFormatedName;
}

export interface InstructionArgumentExt {
  id: string;
  data: InstructionArgumentInfoExt;
}

export interface InstructionAccountInfo {
  authority: string;
  application: string;
  collection: string;
  instruction: string;
  name: string;
  kind: string;
  bump: number;
}

export interface InstructionAccount {
  id: string;
  data: InstructionAccountInfo;
}

export interface InstructionAccountInfoExt
  extends Omit<InstructionAccountInfo, 'name'> {
  name: IFormatedName;
}

export interface InstructionAccountExt {
  id: string;
  data: InstructionAccountInfoExt;
}

export interface IProgramAppCollections {
  name: string;
  attributes: CollectionAttribute[];
  instructions: {
    name: string;
    arguments: InstructionArgument[];
    accounts: InstructionAccount[];
  }[];
}

export interface IProgramAppCollectionsExt {
  name: IFormatedName;
  attributes: CollectionAttributeExt[];
  instructions: {
    name: IFormatedName;
    arguments: InstructionArgumentExt[];
    accounts: InstructionAccountExt[];
  }[];
}

export interface ApplicationInfo {
  authority: string;
  name: string;
}

export interface Application {
  id: string;
  data: ApplicationInfo;
}

export interface CollectionInfo {
  authority: string;
  application: string;
  name: string;
  bump: number;
}

export interface Collection {
  id: string;
  data: CollectionInfo;
}

export interface CollectionInstructionInfo {
  authority: string;
  application: string;
  collection: string;
  name: string;
  bump: number;
}

export interface CollectionInstruction {
  id: string;
  data: CollectionInstructionInfo;
}

export interface IMetadata {
  application: Application;
  collections: Collection[];
  collectionAttributes: CollectionAttribute[];
  instructions: CollectionInstruction[];
  instructionArguments: InstructionArgument[];
  instructionAccounts: InstructionAccount[];
}

export interface IProgramMetadata {
  name: string;
  id: string;
  collections: IProgramAppCollections[];
}

export interface IProgramMetadataExt {
  id: string;
  name: IFormatedName;
  collections: IProgramAppCollectionsExt[];
}

export interface IFormatedName {
  snakeCase: string;
  normalCase: string;
  camelCase: string;
  pascalCase: string;
}

// pruebaaaa
export interface IGenerateFileResponse {
  status: boolean;
  data?: string;
}
