import * as Handlebars from 'handlebars';

import {
  ICollection,
  ICollectionAttribute,
  IGenerateRustCode,
  IInstrucction,
  IInstrucctionArgument,
  IInstructionAccount,
  IMetadata,
} from '..';
import { formatName, getTemplateByType } from './utils';

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
//

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

const formatInstructionsArguments = (
  instructionId: string,
  instructionArguments: IInstrucctionArgument[]
) =>
  instructionArguments
    .filter((argument) => argument.data.instruction === instructionId)
    .map((argument) => ({
      id: argument.id,
      data: {
        ...argument.data,
        name: formatName(argument.data.name),
      },
    }));

const formatInstructionsAccounts = (
  instructionId: string,
  instructionAccounts: IInstructionAccount[]
) =>
  instructionAccounts
    .filter((account) => account.data.instruction === instructionId)
    .map((account) => {
      let payer = null,
        collection = null,
        modifier = null,
        close = null;
      if (account.data.payer) {
        payer = {
          ...account.data.payer,
          data: {
            ...account.data.payer?.data,
            name: formatName(account.data.payer?.data?.name),
          },
        };
      }

      if (account.data.collection) {
        collection = {
          ...account.data.collection,
          data: {
            ...account.data.collection?.data,
            name: formatName(account.data.collection?.data?.name),
          },
        };
      }

      if (account.data.close) {
        close = {
          ...account.data.close,
          data: {
            ...account.data.close?.data,
            name: formatName(account.data.close?.data?.name),
          },
        };
      }

      if (account.data.modifier.name !== 'none') {
        modifier = account.data.modifier;
      }

      return {
        id: account.id,
        data: {
          ...account.data,
          collection: collection,
          modifier: modifier,
          close,
          payer: payer,
          name: formatName(account.data.name),
        },
      };
    });

const formatInstructionMetadata = (
  instruction: IInstrucction,
  instructionArguments: IInstrucctionArgument[],
  instructionAccounts: IInstructionAccount[]
) => ({
  name: formatName(instruction.data.name),
  arguments: formatInstructionsArguments(instruction.id, instructionArguments),
  accounts: formatInstructionsAccounts(instruction.id, instructionAccounts),
});

const generateRustCode = (
  formatedMetadataObj: IGenerateRustCode,
  collectionType: string
) => {
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
  instructionArguments: IInstrucctionArgument[],
  instructionAccounts: IInstructionAccount[]
) => {
  if (!instruction) return; // Im doing something wrong :thinking:

  const formatedInstructions = formatInstructionMetadata(
    instruction,
    instructionArguments,
    instructionAccounts
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
