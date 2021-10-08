import * as Handlebars from 'handlebars';
import { BehaviorSubject } from 'rxjs';

import { __rust_template, __collections_template } from './templates';
import { __instructions_template } from './templates/__instructions_program';
import { IMetadata } from './types';
import { formatName } from './utils';

const _metadatacode = new BehaviorSubject<string>('Your code will be here');

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
    }));

    if (!metadata.application) {
      throw new Error('No application given.');
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

export const generateCollectionRustCode = (
  collection: any,
  attributes: any
) => {
  if (!collection) return; // Im doing something wrong :thinking:

  const formatedCollection = formatCollectionMetadata(collection, attributes);

  const template = Handlebars.compile(getTemplateByType('collections_program'));
  const compiledTemplated = template({ collection: formatedCollection });
  const programFile = compiledTemplated;

  _metadatacode.next(programFile);
};

export const generateInstructionsRustCode = (
  instruction: any,
  iarguments: any
) => {
  if (!instruction) return; // Im doing something wrong :thinking:

  const formatedCollection = formatInstructionMetadata(instruction, iarguments);

  const template = Handlebars.compile(
    getTemplateByType('instructions_program')
  );
  const compiledTemplated = template({ instruction: formatedCollection });
  const programFile = compiledTemplated;

  _metadatacode.next(programFile);
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

    const formatedMetadata = formatProgramMetadata(
      metadata as unknown as IMetadata
    );

    const template = Handlebars.compile(getTemplateByType('full_program'));
    const compiledTemplated = template({ program: formatedMetadata });
    const programFile = compiledTemplated;

    _metadatacode.next(programFile);
  } catch (e) {
    throw new Error(e as string);
  }
};

export const currentMetadataCode = _metadatacode.asObservable();
