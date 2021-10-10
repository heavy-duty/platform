import * as Handlebars from 'handlebars';

import { __rust_template, __collections_template } from './templates';
import { __instructions_template } from './templates/__instructions_program';
import { __instructions_body_template } from './templates/__instructions_body_program';
import { formatName } from './utils';
import {
  IApplication,
  ICollection,
  ICollectionAttribute,
  IInstrucction,
  IInstrucctionArgument,
  IInstructionAccount,
  IMetadata,
} from '..';

// TODO: Move later
Handlebars.registerHelper('switch', function (this: any, value, options) {
  this.switch_value = value;
  return options.fn(this);
});

Handlebars.registerHelper('case', function (this: any, value, options) {
  if (value == this.switch_value) {
    return options.fn(this);
  }
});

const formatInstructionsArguments = (
  instructionId: string,
  instructionArguments: IInstrucctionArgument[]
) =>
  instructionArguments
    .filter((argument) => argument.data.instruction === instructionId)
    .map((argument) => {
      return {
        id: argument.id,
        data: {
          ...argument.data,
          name: formatName(argument.data.name),
        },
      };
    });

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
      arguments: formatInstructionsArguments(
        instruction.id,
        metadata.instructionArguments
      ),
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

const formatCollectionMetadata = (
  collection: ICollection,
  attributes: ICollectionAttribute[]
) => ({
  name: formatName(collection.data.name),
  attributes: attributes
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
});

const formatInstructionMetadata = (
  instruction: IInstrucction,
  instructionArguments: IInstrucctionArgument[]
) => ({
  name: formatName(instruction.data.name),
  arguments: formatInstructionsArguments(instruction.id, instructionArguments),
});

const getTemplateByType = (type: string): string => {
  switch (type) {
    case 'full_program':
      return __rust_template;
    case 'collections_program':
      return __collections_template;
    case 'instructions_program':
      return __instructions_template;
    case 'instructions_body_program':
      return __instructions_body_template;
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
  collection: ICollection,
  attributes: ICollectionAttribute[]
) => {
  if (!collection) return; // Im doing something wrong :thinking:
  const formatedCollection = formatCollectionMetadata(collection, attributes);

  return generateRustCode(
    { collection: formatedCollection },
    getTemplateByType('collections_program')
  );
};

export const generateInstructionsRustCode = (
  instruction: IInstrucction,
  instructionArguments: IInstrucctionArgument[]
) => {
  console.log(instruction, instructionArguments);
  if (!instruction) return; // Im doing something wrong :thinking:

  const formatedInstructions = formatInstructionMetadata(
    instruction,
    instructionArguments
  );

  const templates = {
    context: generateRustCode(
      { instruction: formatedInstructions },
      getTemplateByType('instructions_program')
    ),
    handler: generateRustCode(
      { instruction: formatedInstructions },
      getTemplateByType('instructions_body_program')
    ),
  };

  return templates;
};

export const generateProgramRustCode = (rawMetadata: any) => {
  try {
    const metadata = {
      application: rawMetadata[0],
      collections: rawMetadata[1],
      collectionAttributes: rawMetadata[2],
      instructions: rawMetadata[3],
      instructionArguments: rawMetadata[4],
      instructionAccounts: rawMetadata[5],
    };

    console.log('GENERANDO USANDO ESTO -> ', metadata);

    // Temporal. TODO: Add correct typing to whole library
    const formatedProgram = formatProgramMetadata(metadata);

    return generateRustCode(
      { program: formatedProgram },
      getTemplateByType('full_program')
    );
  } catch (e) {
    throw new Error(e as string);
  }
};
