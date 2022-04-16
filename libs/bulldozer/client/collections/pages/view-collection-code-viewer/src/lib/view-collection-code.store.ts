import { Injectable } from '@angular/core';
import { CodeEditorOptions } from '@bulldozer-client/code-editor';
import {
  CollectionAttributeQueryStore,
  CollectionAttributesStore,
  CollectionStore,
} from '@bulldozer-client/collections-data-access';
import { DarkThemeStore } from '@bulldozer-client/core-data-access';
import {
  InstructionStatus,
  WorkspaceInstructionsStore,
} from '@bulldozer-client/workspaces-data-access';
import {
  Collection,
  CollectionAttribute,
  Document,
} from '@heavy-duty/bulldozer-devkit';
import { generateCollectionCode } from '@heavy-duty/generator';
import { isNotNullOrUndefined } from '@heavy-duty/rxjs';
import { ComponentStore } from '@ngrx/component-store';
import { combineLatest, filter, switchMap, tap } from 'rxjs';

interface ViewModel {
  code: string | null;
  editorOptions: CodeEditorOptions | null;
  collectionId: string | null;
}

const initialState: ViewModel = {
  code: null,
  editorOptions: null,
  collectionId: null,
};

@Injectable()
export class ViewCollectionCodeStore extends ComponentStore<ViewModel> {
  readonly collectionId$ = this.select(({ collectionId }) => collectionId);
  readonly code$ = this.select(({ code }) => code);
  readonly editorOptions$ = this.select(({ editorOptions }) => editorOptions);

  constructor(
    private readonly _collectionStore: CollectionStore,
    private readonly _collectionAttributesStore: CollectionAttributesStore,
    private readonly _collectionAttributeQueryStore: CollectionAttributeQueryStore,
    darkThemeStore: DarkThemeStore,
    workspaceInstructionsStore: WorkspaceInstructionsStore
  ) {
    super(initialState);

    this._loadEditorOptions(darkThemeStore.isDarkThemeEnabled$);
    this._loadCode(
      this.select(
        this._collectionStore.collection$,
        this._collectionAttributesStore.collectionAttributes$,
        (collection, collectionAttributes) => ({
          collection: collection ?? null,
          collectionAttributes: collectionAttributes.map(
            ({ document }) => document
          ),
        }),
        { debounce: true }
      )
    );

    this._collectionStore.setCollectionId(this.collectionId$);

    this._collectionAttributeQueryStore.setFilters(
      combineLatest({
        collection: this.collectionId$.pipe(isNotNullOrUndefined),
      })
    );
    this._collectionAttributesStore.setCollectionAttributeIds(
      this._collectionAttributeQueryStore.collectionAttributeIds$
    );

    this._handleInstruction(
      this.collectionId$.pipe(
        isNotNullOrUndefined,
        switchMap((collectionId) =>
          workspaceInstructionsStore.instruction$.pipe(
            filter((instruction) =>
              instruction.accounts.some(
                (account) =>
                  account.name === 'Collection' &&
                  account.pubkey === collectionId
              )
            )
          )
        )
      )
    );
  }

  readonly setCollectionId = this.updater<string | null>(
    (state, collectionId) => ({ ...state, collectionId })
  );

  private readonly _handleInstruction = this.effect<InstructionStatus>(
    tap((instructionStatus) => {
      switch (instructionStatus.name) {
        /* case 'updateCollection':
        case 'deleteCollection': {
          this._collectionStore.dispatch(instructionStatus);
          break;
        } */
        case 'createCollectionAttribute':
        case 'updateCollectionAttribute':
        case 'deleteCollectionAttribute': {
          this._collectionAttributesStore.dispatch(instructionStatus);
          break;
        }
        default:
          break;
      }
    })
  );

  private readonly _loadEditorOptions = this.updater<boolean>(
    (state, isDarkThemeEnabled) => ({
      ...state,
      editorOptions: {
        theme: isDarkThemeEnabled ? 'vs-dark' : 'vs-light',
        language: 'rust',
        automaticLayout: true,
        readOnly: true,
        fontSize: 16,
      },
    })
  );

  private readonly _loadCode = this.updater<{
    collection: Document<Collection> | null;
    collectionAttributes: Document<CollectionAttribute>[];
  }>((state, { collection, collectionAttributes }) => ({
    ...state,
    code:
      collection && generateCollectionCode(collection, collectionAttributes),
  }));
}
