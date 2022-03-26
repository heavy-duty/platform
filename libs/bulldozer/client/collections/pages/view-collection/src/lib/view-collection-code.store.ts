import { Injectable } from '@angular/core';
import { CodeEditorOptions } from '@bulldozer-client/code-editor';
import {
  CollectionAttributesStore,
  CollectionStore,
} from '@bulldozer-client/collections-data-access';
import { DarkThemeStore } from '@bulldozer-client/core-data-access';
import {
  Collection,
  CollectionAttribute,
  Document,
} from '@heavy-duty/bulldozer-devkit';
import { generateCollectionCode } from '@heavy-duty/generator';
import { ComponentStore } from '@ngrx/component-store';

interface ViewModel {
  code: string | null;
  editorOptions: CodeEditorOptions | null;
}

const initialState: ViewModel = {
  code: null,
  editorOptions: null,
};

@Injectable()
export class ViewCollectionCodeStore extends ComponentStore<ViewModel> {
  readonly code$ = this.select(({ code }) => code);
  readonly editorOptions$ = this.select(({ editorOptions }) => editorOptions);

  constructor(
    collectionStore: CollectionStore,
    collectionAttributesStore: CollectionAttributesStore,
    darkThemeStore: DarkThemeStore
  ) {
    super(initialState);

    this._loadEditorOptions(darkThemeStore.isDarkThemeEnabled$);
    this._loadCode(
      this.select(
        collectionStore.collection$,
        collectionAttributesStore.collectionAttributes$,
        (collection, collectionAttributes) => ({
          collection: collection?.document ?? null,
          collectionAttributes,
        }),
        { debounce: true }
      )
    );
  }

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
