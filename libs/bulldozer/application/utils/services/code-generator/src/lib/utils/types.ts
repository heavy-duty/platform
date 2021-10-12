export interface FormattedName {
  snakeCase: string;
  normalCase: string;
  camelCase: string;
  pascalCase: string;
}

export interface CodeGeneratorParameters {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any; // TODO:  fix to support only
  // { collection: formatedCollection },
  // { instruction: formatedInstructions },
  // { instruction: formatedInstructions },
  // { program: formatedProgram },
}

export interface ApplicationMetadata {
  application: { template: string; fileName: string };
  collections: { template: string; fileName: string }[];
  instructions: { template: string; fileName: string }[];
  collectionsMod: { template: string };
  instructionsMod: { template: string };
}
