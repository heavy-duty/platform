export interface IFormatedName {
  snakeCase: string;
  normalCase: string;
  camelCase: string;
  pascalCase: string;
}

export interface ICollectionAttribute {
  id: string;
  data: {
    application: string;
    authority: string;
    collection: string;
    kind: {
      id: number;
      name: string;
      size: number;
    };
    modifier: {
      id: number;
      name: string;
      size: number;
    };
    name: string;
  };
}
export interface ICollection {
  id: string;
  data: {
    application: string;
    authority: string;
    name: string;
  };
}

export interface IInstrucction {
  id: string;
  data: {
    application: string;
    authority: string;
    name: string;
  };
}

export interface IInstrucctionArgument {
  id: string;
  data: {
    authority: string;
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
    };
  };
}

export interface IInstructionAccount {
  id: string;
  data: {
    kind: {
      id: number;
      name: string;
    };
    modifier: {
      id: number;
      name: string;
    };
    collection: string;
    program: string;
    payer: string; // Accuont ID de la misma instruccion.
    close: string; // Accuont ID de la misma instruccion.
    space: number;
    name: string;
  };
}

export interface IApplication {
  id: string;
  data: {
    name: string;
    authority: string;
  };
}

export interface IMetadata {
  application: IApplication;
  collections: ICollection[];
  collectionAttributes: ICollectionAttribute[];
  instructions: IInstrucction[];
  instructionArguments: IInstrucctionArgument[];
  instructionAccounts: IInstructionAccount[];

  // instructionAccountsBasic: rawMetadata[5];
  // instructionAccountsProgram: rawMetadata[6];
  // instructionAccountsSigner: rawMetadata[7];
}
