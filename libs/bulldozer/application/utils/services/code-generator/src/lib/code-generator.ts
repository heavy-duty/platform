import { saveAs } from 'file-saver';
import * as JSZip from 'jszip';

import { formatCollection, formatInstruction, formatName } from './formatters';
import {
  generateCode,
  getTemplateByType,
  ApplicationMetadata,
  registerHandleBarsHelpers,
} from './utils';
import {
  Application,
  CollectionExtended,
  InstructionExtended,
} from '@heavy-duty/bulldozer/application/utils/types';

// TODO: Move later
registerHandleBarsHelpers();

export const generateInstructionCode = (instruction: InstructionExtended) => {
  const formattedInstructions = formatInstruction(instruction);
  const formattedCollections = formattedInstructions.accounts.reduce(
    (collections, account) =>
      account.data.collection && account.data.collection.data.name !== null
        ? collections.set(account.data.collection.id, account.data.collection)
        : collections,
    new Map([])
  );

  return generateCode(
    {
      instruction: formattedInstructions,
      collections: Array.from(formattedCollections.values()),
    },
    getTemplateByType('instructions_context_program')
  );
};

export const generateCollectionCode = (collection: CollectionExtended) => {
  const formattedCollection = formatCollection(collection);

  return generateCode(
    { collection: formattedCollection },
    getTemplateByType('collections_program')
  );
};

export const generateModCode = (entries: { data: { name: string } }[]) => {
  return generateCode(
    {
      entries: entries.map((entry) => formatName(entry.data.name)),
    },
    getTemplateByType('mod')
  );
};

export const generateApplicationCode = (
  application: Application,
  instructions: InstructionExtended[]
) => {
  return generateCode(
    {
      program: {
        id: application.id,
        name: formatName(application.data.name),
        instructions: instructions.map((instruction) => ({
          ...instruction,
          data: {
            ...instruction.data,
            name: formatName(instruction.data.name),
          },
          arguments: instruction.arguments.map((argument) => ({
            ...argument,
            data: {
              ...argument.data,
              name: formatName(argument.data.name),
            },
          })),
        })),
      },
    },
    getTemplateByType('full_program')
  );
};

export const generateApplicationMetadata = (
  application: Application,
  collections: CollectionExtended[],
  instructions: InstructionExtended[]
): ApplicationMetadata => {
  return {
    application: {
      template: generateApplicationCode(application, instructions),
    },
    collections: collections.map((collection) => ({
      template: generateCollectionCode(collection),
      fileName: formatName(collection.data.name).snakeCase + '.rs',
    })),
    instructions: instructions.map((instruction) => ({
      template: generateInstructionCode(instruction),
      fileName: formatName(instruction.data.name).snakeCase + '.rs',
    })),
    collectionsMod: {
      template: generateModCode(collections),
    },
    instructionsMod: {
      template: generateModCode(instructions),
    },
  };
};

export const generateApplicationZip = (templates: ApplicationMetadata) => {
  const zip = new JSZip();
  zip.file('lib.rs', templates.application.template);

  // Creating collection folder and files
  const collectionFolder = zip.folder('collections');

  templates.collections.forEach((collection) => {
    collectionFolder?.file(collection.fileName, collection.template);
  });
  collectionFolder?.file('mod.rs', templates.collectionsMod.template);

  // Creating instructions folder and files
  const instructionsFolder = zip.folder('instructions');
  templates.instructions.forEach((instruction) => {
    instructionsFolder?.file(instruction.fileName, instruction.template);
  });
  instructionsFolder?.file('mod.rs', templates.instructionsMod.template);

  // Save a download file
  zip.generateAsync({ type: 'blob' }).then(function (content) {
    saveAs(content, 'program.code.zip');
  });
};
