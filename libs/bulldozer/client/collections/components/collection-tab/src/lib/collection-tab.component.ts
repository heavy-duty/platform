import { Component, HostBinding, Input } from '@angular/core';
import { CollectionStore } from '@bulldozer-client/collections-data-access';
import { TabStore } from '@bulldozer-client/core-data-access';
import { CollectionTabStore } from './collection-tab.store';

@Component({
  selector: 'bd-collection-tab',
  template: `
    <div
      *ngIf="collection$ | ngrxPush as collection"
      class="flex items-center p-0"
    >
      <a
        [routerLink]="[
          '/workspaces',
          collection.document.data.workspace,
          'applications',
          collection.document.data.application,
          'collections',
          collection.document.id
        ]"
        class="w-40 h-12 flex justify-between gap-2 items-center pl-4 flex-grow"
        [matTooltip]="
          collection.document.name
            | bdItemUpdatingMessage: collection:'Collection'
        "
        matTooltipShowDelay="500"
      >
        <span
          class="flex-grow text-left overflow-hidden whitespace-nowrap overflow-ellipsis"
        >
          {{ collection.document.name }}
        </span>
        <mat-progress-spinner
          *ngIf="collection | bdItemShowSpinner"
          class="flex-shrink-0"
          mode="indeterminate"
          diameter="16"
        ></mat-progress-spinner>
      </a>

      <button
        mat-icon-button
        [attr.aria-label]="'Close ' + collection.document.name + ' tab'"
        (click)="onCloseTab(collection.document.id)"
      >
        <mat-icon>close</mat-icon>
      </button>
    </div>
  `,
  providers: [CollectionStore, CollectionTabStore],
})
export class CollectionTabComponent {
  @HostBinding('class') class = 'block w-full';

  @Input() set collectionId(value: string) {
    this._collectionTabStore.setCollectionId(value);
  }

  readonly collection$ = this._collectionStore.collection$;

  constructor(
    private readonly _tabStore: TabStore,
    private readonly _collectionTabStore: CollectionTabStore,
    private readonly _collectionStore: CollectionStore
  ) {}

  onCloseTab(collectionId: string) {
    this._tabStore.closeTab(collectionId);
  }
}
