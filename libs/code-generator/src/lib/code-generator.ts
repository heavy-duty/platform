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

Handlebars.registerHelper('eq', function (this: any, a, b, options) {
  if (a == b) {
    return options.fn(this);
  }
});

Handlebars.registerHelper('gt', function (this: any, a, b, options) {
  if (a > b) {
    return options.fn(this);
  }
});
//

// TODO: Move interfaces
const formatProgramMetadata = (
  metadata: IMetadata
): { collections: string[]; instructions: string[] } => {
  try {
    const formatedCollection: {
      collection: ICollection;
      attributes: ICollectionAttribute[];
    }[] = metadata.collections.map((collection) => ({
      collection: collection,
      attributes: metadata.collectionAttributes.filter(
        (attribute) => attribute.data.collection === collection.id
      ),
    }));

    const formatedInstructions: {
      instruction: IInstrucction;
      iarguments: IInstrucctionArgument[];
      accounts: IInstructionAccount[];
    }[] = metadata.instructions.map((instruction) => ({
      instruction: instruction,
      iarguments: metadata.instructionArguments.filter(
        (argument) => argument.data.instruction === instruction.id
      ),
      accounts: metadata.instructionAccounts.filter(
        (accounts) => accounts.data.instruction === instruction.id
      ),
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
    console.log(formatedInstructions);
    return {
      collections: formatedCollection.map(({ collection, attributes }) =>
        generateCollectionRustCode(collection, attributes)
      ),
      instructions: formatedInstructions.map(
        ({ instruction, iarguments, accounts }) =>
          generateInstructionsRustCode(instruction, iarguments, accounts)
      ),
    };
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
  if (!collection) return ''; // Im doing something wrong :thinking:
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
  if (!instruction) return ''; // Im doing something wrong :thinking:

  const formatedInstructions = formatInstructionMetadata(
    instruction,
    instructionArguments,
    instructionAccounts
  );
  const collections = formatedInstructions.accounts.reduce(
    (collections, account) =>
      account.data.collection && account.data.collection.data.name !== null
        ? collections.set(account.data.collection.id, account.data.collection)
        : collections,
    new Map([])
  );
  return generateRustCode(
    {
      instruction: formatedInstructions,
      collections: Array.from(collections.values()),
    },
    getTemplateByType('instructions_context_program')
  );
};

// TODO: Remove Temporal 'any'. Add correct typing to whole library
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
    console.log(metadata);
    const formatedProgram = formatProgramMetadata(metadata);

    return formatedProgram;
  } catch (e) {
    throw new Error(e as string);
  }
};
