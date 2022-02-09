import { Injectable } from '@angular/core';
import { CodeEditorOptions } from '@bulldozer-client/code-editor';
import { DarkThemeService } from '@bulldozer-client/dark-theme-service';
import { generateInstructionCode } from '@heavy-duty/generator';
import { ComponentStore } from '@ngrx/component-store';
import { combineLatest, tap } from 'rxjs';
import { ViewCollectionsStore } from './view-collections.store';
import { ViewInstructionAccountsStore } from './view-instruction-accounts.store';
import { ViewInstructionArgumentsStore } from './view-instruction-arguments.store';
import { ViewInstructionRelationsStore } from './view-instruction-relations.store';
import { ViewInstructionStore } from './view-instruction.store';

const COMMON_EDITOR_OPTIONS = {
  language: 'rust',
  automaticLayout: true,
  fontSize: 16,
  wordWrap: true,
};

interface ViewModel {
  contextCode: string | null;
  contextEditorOptions: CodeEditorOptions | null;
  handleEditorOptions: CodeEditorOptions | null;
}

const initialState: ViewModel = {
  contextCode: null,
  contextEditorOptions: null,
  handleEditorOptions: null,
};

@Injectable()
export class ViewInstructionCodeStore extends ComponentStore<ViewModel> {
  readonly contextCode$ = this.select(({ contextCode }) => contextCode);
  readonly contextEditorOptions$ = this.select(
    ({ contextEditorOptions }) => contextEditorOptions
  );
  readonly handleEditorOptions$ = this.select(
    ({ handleEditorOptions }) => handleEditorOptions
  );
  readonly handleCode$ = this.select(
    this._viewInstructionStore.instruction$,
    (instruction) => instruction && instruction.data.body
  );

  constructor(
    private readonly _viewInstructionStore: ViewInstructionStore,
    private readonly _viewInstructionArgumentsStore: ViewInstructionArgumentsStore,
    private readonly _viewInstructionAccountsStore: ViewInstructionAccountsStore,
    private readonly _viewInstructionRelationsStore: ViewInstructionRelationsStore,
    private readonly _viewCollectionsStore: ViewCollectionsStore,
    private readonly _themeService: DarkThemeService
  ) {
    super(initialState);
  }

  protected readonly loadEditorOptions = this.effect(() =>
    this._themeService.isDarkThemeEnabled$.pipe(
      tap((isDarkThemeEnabled) =>
        this.patchState({
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
      )
    )
  );

  protected readonly loadContextCode = this.effect(() =>
    combineLatest({
      instruction: this._viewInstructionStore.instruction$,
      instructionArguments:
        this._viewInstructionArgumentsStore.instructionArguments$,
      instructionAccounts:
        this._viewInstructionAccountsStore.instructionAccounts$,
      instructionRelations:
        this._viewInstructionRelationsStore.instructionRelations$,
      collections: this._viewCollectionsStore.collections$,
    }).pipe(
      tap(
        ({
          instruction,
          instructionArguments,
          instructionAccounts,
          instructionRelations,
          collections,
        }) =>
          this.patchState({
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
      )
    )
  );
}
