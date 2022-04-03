import { Component, HostBinding, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  CollectionAttributeQueryStore,
  CollectionAttributesStore,
  CollectionStore,
} from '@bulldozer-client/collections-data-access';
import { DarkThemeStore } from '@bulldozer-client/core-data-access';
import { map } from 'rxjs';
import { ViewCollectionCodeStore } from './view-collection-code.store';

@Component({
  selector: 'bd-view-collection-code',
  template: `
    <header class="mb-8 border-b-2 border-yellow-500">
      <h1 class="text-2xl uppercase mb-1">Code Viewer</h1>
      <p class="text-sm font-thin mb-2">
        The code editor allows you to customize a collection.
      </p>
    </header>

    <main class="flex-1">
      <div class="h-full" *ngIf="collection$ | ngrxPush as collection">
        <bd-code-editor
          class="flex-1"
          customClass="h-full"
          [template]="(code$ | ngrxPush) ?? null"
          [options]="(editorOptions$ | ngrxPush) ?? null"
        ></bd-code-editor>
      </div>
    </main>
  `,
  styles: [],
  providers: [
    CollectionStore,
    CollectionAttributesStore,
    CollectionAttributeQueryStore,
    DarkThemeStore,
    ViewCollectionCodeStore,
  ],
})
export class ViewCollectionCodeComponent implements OnInit {
  @HostBinding('class') class =
    'flex flex-col p-8 bg-white bg-opacity-5 h-full';

  readonly code$ = this._viewCollectionCodeStore.code$;
  readonly editorOptions$ = this._viewCollectionCodeStore.editorOptions$;
  readonly collection$ = this._collectionStore.collection$;

  constructor(
    private readonly _route: ActivatedRoute,
    private readonly _collectionStore: CollectionStore,
    private readonly _viewCollectionCodeStore: ViewCollectionCodeStore
  ) {}

  ngOnInit() {
    this._viewCollectionCodeStore.setCollectionId(
      this._route.paramMap.pipe(map((paramMap) => paramMap.get('collectionId')))
    );
  }
}
