import {
  Application,
  Collection,
  CollectionAttribute,
  Document,
  Instruction,
  InstructionAccount,
  InstructionArgument,
  InstructionRelation,
  Workspace,
} from '@heavy-duty/bulldozer-devkit';
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
  registerHandleBarsHelpers,
  WorkspaceMetadata,
} from './utils';

// TODO: Move later
registerHandleBarsHelpers();

export const generateInstructionCode = (
  instruction: Document<Instruction>,
  instructionArguments: Document<InstructionArgument>[],
  instructionAccounts: Document<InstructionAccount>[],
  instructionRelations: Document<InstructionRelation>[],
  collections: Document<Collection>[]
) => {
  const formattedInstruction = formatInstruction(
    instruction,
    instructionArguments,
    instructionAccounts,
    instructionRelations,
    collections
  );
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

export const generateCollectionCode = (
  collection: Document<Collection>,
  collectionAttributes: Document<CollectionAttribute>[]
) => {
  const formattedCollection = formatCollection(
    collection,
    collectionAttributes
  );

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
  application: Document<Application>,
  instructions: Document<Instruction>[],
  instructionArguments: Document<InstructionArgument>[]
) => {
  const formattedApplication = formatApplication(
    application,
    instructions,
    instructionArguments
  );

  return generateCode(
    {
      application: formattedApplication,
    },
    getTemplateByType('full_program')
  );
};

export const generateWorkspaceMetadata = (
  applications: Document<Application>[],
  collections: Document<Collection>[],
  collectionAttributes: Document<CollectionAttribute>[],
  instructions: Document<Instruction>[],
  instructionArguments: Document<InstructionArgument>[],
  instructionAccounts: Document<InstructionAccount>[],
  instructionRelations: Document<InstructionRelation>[]
): WorkspaceMetadata => {
  return {
    applications: applications.map((application) => {
      const filteredCollections = collections.filter(
        (collection) => collection.data.application === application.id
      );
      const filteredInstructions = instructions.filter(
        (instruction) => instruction.data.application === application.id
      );

      return {
        template: generateApplicationCode(
          application,
          filteredInstructions,
          instructionArguments.filter(
            ({ data }) => data.application === application.id
          )
        ),
        name: formatName(application.data.name),
        collections: filteredCollections.map((collection) => ({
          template: generateCollectionCode(
            collection,
            collectionAttributes.filter(
              ({ data }) => data.collection === collection.id
            )
          ),
          name: formatName(collection.data.name),
        })),
        instructions: filteredInstructions.map((instruction) => ({
          template: generateInstructionCode(
            instruction,
            instructionArguments.filter(
              ({ data }) => data.instruction === instruction.id
            ),
            instructionAccounts.filter(
              ({ data }) => data.instruction === instruction.id
            ),
            instructionRelations.filter(
              ({ data }) => data.instruction === instruction.id
            ),
            collections
          ),
          name: formatName(instruction.data.name),
        })),
        collectionsMod: {
          template: generateModCode(filteredCollections),
        },
        instructionsMod: {
          template: generateModCode(filteredInstructions),
        },
      };
    }),
  };
};

export const generateWorkspaceZip = (
  workspace: Document<Workspace>,
  metadata: WorkspaceMetadata
) => {
  const zip = new JSZip();
  const workspaceName = formatName(workspace.data.name);
  const workspaceFolder = zip.folder(workspaceName.snakeCase);

  workspaceFolder?.file;
  workspaceFolder?.file('.gitignore', getTemplateByType('gitignore'));
  workspaceFolder?.file('.prettierrc.json', getTemplateByType('prettierrc'));
  workspaceFolder?.file(
    'Anchor.toml',
    generateCode({ workspaceName }, getTemplateByType('anchor'))
  );
  workspaceFolder?.file('Cargo.toml', getTemplateByType('cargo'));
  workspaceFolder?.file(
    'README.md',
    generateCode({ workspaceName }, getTemplateByType('readme'))
  );
  workspaceFolder?.file('tsconfig.json', getTemplateByType('tsconfig'));
  workspaceFolder?.file(
    'package.json',
    generateCode({ workspaceName }, getTemplateByType('packageJson'))
  );

  // Creating migrations folder and file
  const migrationsFolder = workspaceFolder?.folder('migrations');
  migrationsFolder?.file('deploy.js', getTemplateByType('migrations.deploy'));

  // Creating programs folder
  const programsFolderDir = 'programs';
  const programsFolder = workspaceFolder?.folder(programsFolderDir);

  // Creating tests folder
  const testsFolderDir = 'tests';
  const testsFolder = workspaceFolder?.folder(testsFolderDir);

  // Create all the applications from workspace
  metadata.applications.forEach((application) => {
    // Creating application folder and adding main files
    const applicationFolder = programsFolder?.folder(
      application.name.normalCase
    );
    applicationFolder?.file('Xargo.toml', getTemplateByType('program.xargo'));
    applicationFolder?.file(
      'Cargo.toml',
      generateCode(
        { applicationName: application.name },
        getTemplateByType('program.cargo')
      )
    );
    const applicationFolderSrc = applicationFolder?.folder('src');
    applicationFolderSrc?.file('lib.rs', application.template);

    // Creating collection folder and files
    const collectionFolder = applicationFolderSrc?.folder('collections');
    application.collections.forEach((collection) => {
      collectionFolder?.file(
        collection.name.snakeCase + '.rs',
        collection.template
      );
    });
    collectionFolder?.file('mod.rs', application.collectionsMod.template);

    // Creating instructions folder and files
    const instructionsFolder = applicationFolderSrc?.folder('instructions');
    application.instructions.forEach((instruction) => {
      instructionsFolder?.file(
        instruction.name.snakeCase + '.rs',
        instruction.template
      );
    });
    instructionsFolder?.file('mod.rs', application.instructionsMod.template);

    // Creating tests per application
    testsFolder?.file(
      `${application.name.normalCase}.spec.ts`,
      generateCode(
        { applicationName: application.name },
        getTemplateByType('test')
      )
    );
  });

  // Save a download file
  zip.generateAsync({ type: 'blob' }).then(function (content) {
    saveAs(content, workspaceName.normalCase + '-program.zip');
  });
};
