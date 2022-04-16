import { Component, HostBinding, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  CollectionAttributesStore,
  CollectionStore,
} from '@bulldozer-client/collections-data-access';
import { isNotNullOrUndefined } from '@heavy-duty/rxjs';
import { distinctUntilChanged, map } from 'rxjs';
import { ViewCollectionCodeAttributesStore } from './view-collection-code-attributes.store';
import { ViewCollectionCodeCollectionStore } from './view-collection-code-collection.store';
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
      <div class="h-full" *ngIf="code$ | ngrxPush as code">
        <bd-code-editor
          class="flex-1"
          customClass="h-full"
          [template]="code"
          [options]="{
            theme: 'vs-dark',
            language: 'rust',
            automaticLayout: true,
            readOnly: true,
            fontSize: 16
          }"
        ></bd-code-editor>
      </div>
    </main>
  `,
  styles: [],
  providers: [
    CollectionStore,
    CollectionAttributesStore,
    ViewCollectionCodeStore,
    ViewCollectionCodeCollectionStore,
    ViewCollectionCodeAttributesStore,
  ],
})
export class ViewCollectionCodeComponent implements OnInit {
  @HostBinding('class') class =
    'flex flex-col p-8 bg-white bg-opacity-5 h-full';

  readonly code$ = this._viewCollectionCodeStore.code$;
  readonly collectionId$ = this._route.paramMap.pipe(
    map((paramMap) => paramMap.get('collectionId')),
    isNotNullOrUndefined,
    distinctUntilChanged()
  );

  constructor(
    private readonly _route: ActivatedRoute,
    private readonly _viewCollectionCodeStore: ViewCollectionCodeStore,
    private readonly _viewCollectionCodeAttributesStore: ViewCollectionCodeAttributesStore,
    private readonly _viewCollectionCodeCollectionStore: ViewCollectionCodeCollectionStore
  ) {}

  ngOnInit() {
    this._viewCollectionCodeAttributesStore.setCollectionId(this.collectionId$);
    this._viewCollectionCodeCollectionStore.setCollectionId(this.collectionId$);
  }
}
