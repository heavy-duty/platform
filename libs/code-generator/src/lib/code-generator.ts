import * as Handlebars from 'handlebars';

import {
  ICollection,
  ICollectionAttribute,
  IFormatedFullProgram,
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
const formatProgramMetadata = (metadata: IMetadata): IFormatedFullProgram => {
  try {
    const formatedCollection = metadata.collections.map((collection) => ({
      collection: collection,
      attributes: metadata.collectionAttributes.filter(
        (attribute) => attribute.data.collection === collection.id
      ),
    }));

    const formatedInstructions = metadata.instructions.map((instruction) => ({
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

    return {
      application: {
        template: generateRustCode(
          {
            program: {
              id: metadata.application.id,
              name: formatName(metadata.application.data.name),
              instructions: formatedInstructions.map((formatedInstruction) => ({
                ...formatedInstruction,
                instruction: {
                  ...formatedInstruction.instruction,
                  data: {
                    ...formatedInstruction.instruction.data,
                    name: formatName(formatedInstruction.instruction.data.name),
                  },
                },
                iarguments: formatedInstruction.iarguments.map((iargument) => ({
                  ...iargument,
                  data: {
                    ...iargument.data,
                    name: formatName(iargument.data.name),
                  },
                })),
              })),
            },
          },
          getTemplateByType('full_program')
        ),
      },
      collections: formatedCollection.map(({ collection, attributes }) => ({
        template: generateCollectionRustCode(collection, attributes),
        fileName: formatName(collection.data.name)?.snakeCase + '.rs',
      })),
      instructions: formatedInstructions.map(
        ({ instruction, iarguments, accounts }) => ({
          template: generateInstructionsRustCode(
            instruction,
            iarguments,
            accounts
          ),
          fileName: formatName(instruction.data.name)?.snakeCase + '.rs',
        })
      ),
      collectionsMod: {
        template: generateRustCode(
          {
            collectionOrInstruction: formatedCollection.map((collectionInfo) =>
              formatName(collectionInfo.collection.data.name)
            ),
          },
          getTemplateByType('mod')
        ),
      },
      instructionsMod: {
        template: generateRustCode(
          {
            collectionOrInstruction: formatedInstructions.map(
              (instrucctionInfo) =>
                formatName(instrucctionInfo.instruction.data.name)
            ),
          },
          getTemplateByType('mod')
        ),
      },
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
    const formatedProgram = formatProgramMetadata(metadata);
    console.log(formatedProgram);

    return formatedProgram;
  } catch (e) {
    throw new Error(e as string);
  }
};
