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

interface ApplicationMetadata {
  template: string;
  name: FormattedName;
  collections: { template: string; name: FormattedName }[];
  instructions: { template: string; name: FormattedName }[];
  collectionsMod: { template: string };
  instructionsMod: { template: string };
}

export interface WorkspaceMetadata {
  applications: ApplicationMetadata[];
}
