import { Component, Input } from '@angular/core';
import { Collection, Document } from '@heavy-duty/bulldozer-devkit';
import { CollectionExplorerStore } from './collection-explorer.store';

@Component({
  selector: 'bd-collection-explorer',
  template: `
    <mat-expansion-panel togglePosition="before">
      <mat-expansion-panel-header class="pl-6 pr-0">
        <div class="flex justify-between items-center flex-grow">
          <mat-panel-title> Collections </mat-panel-title>
          <button
            mat-icon-button
            [disabled]="(connected$ | ngrxPush) === false"
            aria-label="Create collection"
            (click)="onCreateCollection($event)"
          >
            <mat-icon>add</mat-icon>
          </button>
        </div>
      </mat-expansion-panel-header>
      <mat-nav-list dense>
        <mat-list-item
          *ngFor="let collection of collections$ | ngrxPush"
          class="pl-8 pr-0"
        >
          <a
            matLine
            [routerLink]="[
              '/workspaces',
              collection.data.workspace,
              'applications',
              collection.data.application,
              'collections',
              collection.id
            ]"
            [matTooltip]="collection.name"
            matTooltipShowDelay="500"
          >
            {{ collection.name }}
          </a>

          <button
            mat-icon-button
            [attr.aria-label]="
              'More options of ' + collection.name + ' collection'
            "
            [matMenuTriggerFor]="collectionOptionsMenu"
          >
            <mat-icon>more_horiz</mat-icon>
          </button>
          <mat-menu #collectionOptionsMenu="matMenu">
            <button
              mat-menu-item
              (click)="onEditCollection(collection)"
              [disabled]="(connected$ | ngrxPush) === false"
            >
              <mat-icon>edit</mat-icon>
              <span>Edit collection</span>
            </button>
            <button
              mat-menu-item
              (click)="onDeleteCollection(collection)"
              [disabled]="(connected$ | ngrxPush) === false"
            >
              <mat-icon>delete</mat-icon>
              <span>Delete collection</span>
            </button>
          </mat-menu>
        </mat-list-item>
      </mat-nav-list>
    </mat-expansion-panel>
  `,
  providers: [CollectionExplorerStore],
})
export class CollectionExplorerComponent {
  @Input() set applicationId(value: string | undefined) {
    this._collectionExplorerStore.setApplicationId(value);
  }
  readonly connected$ = this._collectionExplorerStore.connected$;
  readonly collections$ = this._collectionExplorerStore.collections$;

  constructor(private _collectionExplorerStore: CollectionExplorerStore) {}

  onCreateCollection(event: Event) {
    event.stopPropagation();
    event.preventDefault();

    this._collectionExplorerStore.createCollection();
  }

  onEditCollection(collection: Document<Collection>) {
    this._collectionExplorerStore.updateCollection(collection);
  }

  onDeleteCollection(collection: Document<Collection>) {
    this._collectionExplorerStore.deleteCollection(collection);
  }
}
