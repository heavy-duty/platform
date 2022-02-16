import { Component, HostBinding, Input } from '@angular/core';
import { CollectionStore } from '@bulldozer-client/collections-data-access';
import { CollectionTabStore } from './collection-tab.store';

@Component({
  selector: 'bd-collection-tab',
  template: `
    <div
      *ngIf="collection$ | ngrxPush as collection"
      class="flex items-stretch p-0"
    >
      <a
        [routerLink]="[
          '/workspaces',
          collection.data.workspace,
          'applications',
          collection.data.application,
          'collections',
          collection.id
        ]"
        class="flex items-center pl-4 flex-grow"
      >
        {{ collection.name }}
      </a>
      <button
        mat-icon-button
        [attr.aria-label]="'Close ' + collection.name + ' tab'"
        (click)="onCloseTab()"
      >
        <mat-icon>close</mat-icon>
      </button>
    </div>
  `,
  providers: [CollectionStore, CollectionTabStore],
})
export class CollectionTabComponent {
  @HostBinding('class') class = 'block w-full';

  private _collectionId!: string;
  @Input() set collectionId(value: string) {
    this._collectionId = value;
    this._collectionStore.setCollectionId(this.collectionId);
  }
  get collectionId() {
    return this._collectionId;
  }

  readonly collection$ = this._collectionStore.collection$;

  constructor(
    private readonly _collectionStore: CollectionStore,
    private readonly _collectionTabStore: CollectionTabStore
  ) {}

  onCloseTab() {
    this._collectionTabStore.closeTab(this.collectionId);
  }
}
