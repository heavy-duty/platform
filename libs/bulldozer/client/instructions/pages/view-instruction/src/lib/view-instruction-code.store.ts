import { Injectable } from '@angular/core';
import { CodeEditorOptions } from '@bulldozer-client/code-editor';
import { CollectionsStore } from '@bulldozer-client/collections-data-access';
import { DarkThemeStore } from '@bulldozer-client/core-data-access';
import {
  InstructionAccountsStore,
  InstructionArgumentsStore,
  InstructionRelationsStore,
  InstructionStore,
} from '@bulldozer-client/instructions-data-access';
import {
  Collection,
  Document,
  Instruction,
  InstructionAccount,
  InstructionArgument,
  InstructionRelation,
  Relation,
} from '@heavy-duty/bulldozer-devkit';
import { generateInstructionCode } from '@heavy-duty/generator';
import { ComponentStore } from '@ngrx/component-store';

const COMMON_EDITOR_OPTIONS: CodeEditorOptions = {
  language: 'rust',
  automaticLayout: true,
  fontSize: 16,
  wordWrap: 'on',
  theme: 'vs-light',
  readOnly: false,
};

interface ViewModel {
  contextCode: string | null;
  contextEditorOptions: CodeEditorOptions;
  handleCode: string | null;
  handleEditorOptions: CodeEditorOptions;
}

const initialState: ViewModel = {
  contextCode: null,
  contextEditorOptions: {
    ...COMMON_EDITOR_OPTIONS,
    readOnly: true,
  },
  handleCode: null,
  handleEditorOptions: COMMON_EDITOR_OPTIONS,
};

@Injectable()
export class ViewInstructionCodeStore extends ComponentStore<ViewModel> {
  readonly contextCode$ = this.select(({ contextCode }) => contextCode);
  readonly contextEditorOptions$ = this.select(
    ({ contextEditorOptions }) => contextEditorOptions
  );
  readonly handleCode$ = this.select(({ handleCode }) => handleCode);
  readonly handleEditorOptions$ = this.select(
    ({ handleEditorOptions }) => handleEditorOptions
  );

  constructor(
    private readonly _instructionStore: InstructionStore,
    instructionArgumentsStore: InstructionArgumentsStore,
    instructionAccountsStore: InstructionAccountsStore,
    instructionRelationsStore: InstructionRelationsStore,
    collectionsStore: CollectionsStore,
    darkThemeStore: DarkThemeStore
  ) {
    super(initialState);

    this._loadContextCode(
      this.select(
        this._instructionStore.instruction$,
        instructionArgumentsStore.instructionArguments$,
        instructionAccountsStore.instructionAccounts$,
        instructionRelationsStore.instructionRelations$,
        collectionsStore.collections$,
        (
          instruction,
          instructionArguments,
          instructionAccounts,
          instructionRelations,
          collections
        ) => ({
          instruction: instruction?.document ?? null,
          instructionArguments,
          instructionAccounts,
          instructionRelations,
          collections: collections.map(({ document }) => document),
        }),
        { debounce: true }
      )
    );
    this._loadEditorOptions(darkThemeStore.isDarkThemeEnabled$);
    this._loadHandleCode(
      this.select(
        this._instructionStore.instruction$,
        (instruction) => instruction?.document.data.body ?? null
      )
    );
  }

  private readonly _loadEditorOptions = this.updater<boolean>(
    (state, isDarkThemeEnabled) => ({
      ...state,
      contextEditorOptions: {
        ...COMMON_EDITOR_OPTIONS,
        theme: isDarkThemeEnabled ? 'vs-dark' : 'vs-light',
        readOnly: true,
      },
      handleEditorOptions: {
        ...COMMON_EDITOR_OPTIONS,
        theme: isDarkThemeEnabled ? 'vs-dark' : 'vs-light',
        readOnly: false,
      },
    })
  );

  private readonly _loadHandleCode = this.updater<string | null>(
    (state, handleCode) => ({ ...state, handleCode })
  );

  private readonly _loadContextCode = this.updater<{
    instruction: Document<Instruction> | null;
    instructionArguments: Document<InstructionArgument>[];
    instructionAccounts: Document<InstructionAccount>[];
    instructionRelations: Relation<InstructionRelation>[];
    collections: Document<Collection>[];
  }>(
    (
      state,
      {
        instruction,
        instructionArguments,
        instructionAccounts,
        instructionRelations,
        collections,
      }
    ) => ({
      ...state,
      contextCode:
        instruction &&
        generateInstructionCode(
          instruction,
          instructionArguments,
          instructionAccounts,
          instructionRelations,
          collections
        ),
    })
  );
}
