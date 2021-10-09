import * as Handlebars from 'handlebars';

import { __rust_template, __collections_template } from './templates';
import { __instructions_template } from './templates/__instructions_program';
import { IMetadata } from './types';
import { formatName } from './utils';

const formatProgramMetadata = (metadata: IMetadata) => {
  try {
    const formatedCollection = metadata.collections.map((collection) => {
      const collectionsMetadata = {
        name: formatName(collection.data.name),
        attributes: metadata.collectionAttributes
          .filter((attribute) => attribute.data.collection === collection.id)
          .map((attribute) => {
            return {
              id: attribute.id,
              data: {
                ...attribute.data,
                name: formatName(attribute.data.name),
              },
            };
          }),
      };
      return collectionsMetadata;
    });

    const formatedInstructionAccounts = [2];

    const formatedInstructions = metadata.instructions.map((instruction) => ({
      name: formatName(instruction.data.name),
      arguments: metadata.instructionArguments
        .filter((argument) => argument.data.instruction === instruction.id)
        .map((argument) => {
          return {
            id: argument.id,
            data: {
              ...argument.data,
              name: formatName(argument.data.name),
            },
          };
        }),
      accounts: formatedInstructionAccounts,
    }));

    if (!metadata.application) {
      throw new Error('No application metadata given.');
    }

    const formatedMetadata = {
      id: metadata.application.id,
      name: formatName(metadata.application.data.name),
      collections: formatedCollection,
      instructions: formatedInstructions,
    };

    return formatedMetadata;
  } catch (e) {
    throw new Error(e as string);
  }
};

const formatCollectionMetadata = (collection: any, attributes: any) => ({
  name: formatName(collection.data.name),
  attributes: attributes
    .filter((attribute: any) => attribute.data.collection === collection.id)
    .map((attribute: any) => {
      return {
        id: attribute.id,
        data: {
          ...attribute.data,
          name: formatName(attribute.data.name),
        },
      };
    }),
});

const formatInstructionMetadata = (instruction: any, iarguments: any) => ({
  name: formatName(instruction.data.name),
  arguments: iarguments
    .filter((argument: any) => argument.data.instruction === instruction.id)
    .map((argument: any) => {
      return {
        id: argument.id,
        data: {
          ...argument.data,
          name: formatName(argument.data.name),
        },
      };
    }),
});

const getTemplateByType = (type: string): string => {
  switch (type) {
    case 'full_program':
      return __rust_template;
    case 'collections_program':
      return __collections_template;
    case 'instructions_program':
      return __instructions_template;
    default:
      return __rust_template;
  }
};

const generateRustCode = (formatedMetadataObj: any, collectionType: string) => {
  const template = Handlebars.compile(collectionType);
  const compiledTemplated = template(formatedMetadataObj);
  const programFile = compiledTemplated;

  return programFile;
};

export const generateCollectionRustCode = (
  collection: any,
  attributes: any
) => {
  if (!collection) return; // Im doing something wrong :thinking:

  const formatedCollection = formatCollectionMetadata(collection, attributes);

  return generateRustCode(
    { collection: formatedCollection },
    getTemplateByType('collections_program')
  );
};

export const generateInstructionsRustCode = (
  instruction: any,
  iarguments: any
) => {
  if (!instruction) return; // Im doing something wrong :thinking:

  const formatedInstructions = formatInstructionMetadata(
    instruction,
    iarguments
  );

  return generateRustCode(
    { instruction: formatedInstructions },
    getTemplateByType('instructions_program')
  );
};

export const generateProgramRustCode = (rawMetadata: any) => {
  try {
    const metadata = {
      application: rawMetadata[0],
      collections: rawMetadata[1],
      collectionAttributes: rawMetadata[2],
      instructions: rawMetadata[3],
      instructionArguments: rawMetadata[4],
      instructionAccountsBasic: rawMetadata[5],
      instructionAccountsProgram: rawMetadata[6],
      instructionAccountsSigner: rawMetadata[7],
    };

    console.log('GENERANDO USANDO ESTO -> ', metadata);

    // Temporal. TODO: Add correct typing to whole library
    const formatedProgram = formatProgramMetadata(
      metadata as unknown as IMetadata
    );

    return generateRustCode(
      { program: formatedProgram },
      getTemplateByType('full_program')
    );
  } catch (e) {
    throw new Error(e as string);
  }
};
