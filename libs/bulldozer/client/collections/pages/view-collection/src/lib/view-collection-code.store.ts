import { Injectable } from '@angular/core';
import { CodeEditorOptions } from '@bulldozer-client/code-editor';
import { DarkThemeService } from '@bulldozer-client/dark-theme-service';
import { generateCollectionCode } from '@heavy-duty/generator';
import { ComponentStore } from '@ngrx/component-store';
import { combineLatest, tap } from 'rxjs';
import { ViewCollectionAttributesStore } from './view-collection-attributes.store';
import { ViewCollectionStore } from './view-collection.store';

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
    private readonly _viewCollectionStore: ViewCollectionStore,
    private readonly _viewCollectionAttributesStore: ViewCollectionAttributesStore,
    private readonly _themeService: DarkThemeService
  ) {
    super(initialState);
  }

  protected readonly loadEditorOptions = this.effect(() =>
    this._themeService.isDarkThemeEnabled$.pipe(
      tap((isDarkThemeEnabled) =>
        this.patchState({
          editorOptions: {
            theme: isDarkThemeEnabled ? 'vs-dark' : 'vs-light',
            language: 'rust',
            automaticLayout: true,
            readOnly: true,
            fontSize: 16,
          },
        })
      )
    )
  );

  protected readonly loadCode = this.effect(() =>
    combineLatest({
      collection: this._viewCollectionStore.collection$,
      collectionAttributes:
        this._viewCollectionAttributesStore.collectionAttributes$,
    }).pipe(
      tap(({ collection, collectionAttributes }) =>
        this.patchState({
          code:
            collection &&
            generateCollectionCode(collection, collectionAttributes),
        })
      )
    )
  );
}
