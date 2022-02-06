import { Injectable } from '@angular/core';
import { DarkThemeService } from '@bulldozer-client/dark-theme-service';
import { generateCollectionCode } from '@heavy-duty/generator';
import { ComponentStore } from '@ngrx/component-store';
import { map } from 'rxjs';
import { ViewCollectionAttributesStore } from './view-collection-attributes.store';
import { ViewCollectionStore } from './view-collection.store';

@Injectable()
export class ViewCollectionCodeStore extends ComponentStore<object> {
  readonly rustCode$ = this.select(
    this._viewCollectionStore.collection$,
    this._viewCollectionAttributesStore.collectionAttributes$,
    (collection, collectionAttributes) =>
      collection && generateCollectionCode(collection, collectionAttributes)
  );
  readonly editorOptions$ = this._themeService.isDarkThemeEnabled$.pipe(
    map((isDarkThemeEnabled) => ({
      theme: isDarkThemeEnabled ? 'vs-dark' : 'vs-light',
      language: 'rust',
      automaticLayout: true,
      readOnly: true,
      fontSize: 16,
    }))
  );

  constructor(
    private readonly _viewCollectionStore: ViewCollectionStore,
    private readonly _viewCollectionAttributesStore: ViewCollectionAttributesStore,
    private readonly _themeService: DarkThemeService
  ) {
    super();
  }
}
