import { saveAs } from 'file-saver';
import * as JSZip from 'jszip';

import {
  formatApplication,
  formatCollection,
  formatInstruction,
  formatName,
} from './formatters';
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
  const formattedInstruction = formatInstruction(instruction);
  const formattedCollections = formattedInstruction.accounts.reduce(
    (collections, account) =>
      account.data.collection && account.data.collection.data.name !== null
        ? collections.set(account.data.collection.id, account.data.collection)
        : collections,
    new Map([])
  );

  return generateCode(
    {
      instruction: formattedInstruction,
      collections: Array.from(formattedCollections.values()),
    },
    getTemplateByType('instructions')
  );
};

export const generateCollectionCode = (collection: CollectionExtended) => {
  const formattedCollection = formatCollection(collection);

  return generateCode(
    { collection: formattedCollection },
    getTemplateByType('collections')
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
  const formattedApplication = formatApplication(application, instructions);

  return generateCode(
    {
      application: formattedApplication,
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
      fileName: formatName(application.data.name).camelCase,
    },
    collections: collections.map((collection) => ({
      template: generateCollectionCode(collection),
      fileName: formatName(collection.data.name).snakeCase,
    })),
    instructions: instructions.map((instruction) => ({
      template: generateInstructionCode(instruction),
      fileName: formatName(instruction.data.name).snakeCase,
    })),
    collectionsMod: {
      template: generateModCode(collections),
    },
    instructionsMod: {
      template: generateModCode(instructions),
    },
  };
};

export const generateApplicationZip = (
  application: Application,
  metadata: ApplicationMetadata
) => {
  const zip = new JSZip();
  const applicationName = formatName(application.data.name);

  const applicationFolder = zip.folder(applicationName.snakeCase);

  applicationFolder?.file;
  applicationFolder?.file('.gitignore', getTemplateByType('gitignore'));
  applicationFolder?.file('.prettierrc.json', getTemplateByType('prettierrc'));
  applicationFolder?.file(
    'Anchor.toml',
    generateCode({ applicationName }, getTemplateByType('anchor'))
  );
  applicationFolder?.file('Cargo.toml', getTemplateByType('cargo'));
  applicationFolder?.file(
    'README.md',
    generateCode({ applicationName }, getTemplateByType('readme'))
  );
  applicationFolder?.file('tsconfig.json', getTemplateByType('tsconfig'));
  applicationFolder?.file(
    'package.json',
    generateCode({ applicationName }, getTemplateByType('packageJson'))
  );

  // Creating migrations folder and file
  const migrationsFolder = applicationFolder?.folder('migrations');
  migrationsFolder?.file('deploy.js', getTemplateByType('migrations.deploy'));

  // Creating tests folder and file
  const testsFolder = applicationFolder?.folder('tests');
  testsFolder?.file(
    `${metadata.application.fileName}.spec.ts`,
    generateCode({ applicationName }, getTemplateByType('test'))
  );

  // Creating program folder and adding main files
  const programFolderDir = 'programs/' + metadata.application.fileName;
  const programFolder = applicationFolder?.folder(programFolderDir);
  programFolder?.file('Xargo.toml', getTemplateByType('program.xargo'));
  programFolder?.file(
    'Cargo.toml',
    generateCode({ applicationName }, getTemplateByType('program.cargo'))
  );

  const programFolderSrcDir = programFolderDir + '/src';
  const programFolderSrc = applicationFolder?.folder(programFolderSrcDir);
  programFolderSrc?.file('lib.rs', metadata.application.template);

  // Creating collection folder and files
  const collectionFolder = applicationFolder?.folder(
    programFolderSrcDir + '/collections'
  );

  metadata.collections.forEach((collection) => {
    collectionFolder?.file(collection.fileName + '.rs', collection.template);
  });
  collectionFolder?.file('mod.rs', metadata.collectionsMod.template);

  // Creating instructions folder and files
  const instructionsFolder = applicationFolder?.folder(
    programFolderSrcDir + '/instructions'
  );
  metadata.instructions.forEach((instruction) => {
    instructionsFolder?.file(
      instruction.fileName + '.rs',
      instruction.template
    );
  });
  instructionsFolder?.file('mod.rs', metadata.instructionsMod.template);

  // Save a download file
  zip.generateAsync({ type: 'blob' }).then(function (content) {
    saveAs(content, metadata.application.fileName + '-program.zip');
  });
};
