import { Component, Input } from '@angular/core';
import { CollectionStore } from '@heavy-duty/bulldozer-store';
import { CollectionExplorerStore } from './collection-explorer.store';

@Component({
  selector: 'bd-collection-explorer',
  template: `
    <mat-expansion-panel
      togglePosition="before"
      *ngIf="applicationId$ | ngrxPush as applicationId"
    >
      <mat-expansion-panel-header class="pl-6 pr-0">
        <div class="flex justify-between items-center flex-grow">
          <mat-panel-title> Collections </mat-panel-title>
          <button
            mat-icon-button
            [disabled]="!connected"
            aria-label="Create collection"
            bdStopPropagation
            bdEditCollectionTrigger
            (editCollection)="onCreateCollection(applicationId, $event)"
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
              bdEditCollectionTrigger
              [collection]="collection"
              (editCollection)="onUpdateCollection(applicationId, $event)"
              [disabled]="!connected"
            >
              <mat-icon>edit</mat-icon>
              <span>Edit collection</span>
            </button>
            <button
              mat-menu-item
              (click)="onDeleteCollection(applicationId, collection.id)"
              [disabled]="!connected"
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
  @Input() connected = false;
  @Input() set applicationId(value: string | undefined) {
    this._collectionExplorerStore.setApplicationId(value);
  }
  readonly applicationId$ = this._collectionExplorerStore.applicationId$;
  readonly collections$ = this._collectionExplorerStore.collections$;

  constructor(
    private _collectionStore: CollectionStore,
    private _collectionExplorerStore: CollectionExplorerStore
  ) {}

  onCreateCollection(applicationId: string, collectionName: string) {
    this._collectionStore.createCollection({ applicationId, collectionName });
  }

  onUpdateCollection(collectionId: string, collectionName: string) {
    this._collectionStore.updateCollection({ collectionId, collectionName });
  }

  onDeleteCollection(applicationId: string, collectionId: string) {
    this._collectionStore.deleteCollection({ applicationId, collectionId });
  }
}
