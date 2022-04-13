import { Component, Input } from '@angular/core';
import {
  CollectionQueryStore,
  CollectionsStore,
} from '@bulldozer-client/collections-data-access';
import { CollectionExplorerStore } from './collection-explorer.store';

@Component({
  selector: 'bd-collection-explorer',
  template: `
    <mat-expansion-panel togglePosition="before">
      <mat-expansion-panel-header class="pl-6 pr-0">
        <div class="flex justify-between items-center flex-grow">
          <mat-panel-title class="font-bold"> Collections </mat-panel-title>
          <ng-container *ngIf="workspaceId$ | ngrxPush as workspaceId">
            <button
              *ngIf="applicationId$ | ngrxPush as applicationId"
              mat-icon-button
              [disabled]="!connected"
              aria-label="Create collection"
              bdStopPropagation
              bdEditCollection
              (editCollection)="
                onCreateCollection(workspaceId, applicationId, $event)
              "
            >
              <mat-icon>add</mat-icon>
            </button>
          </ng-container>
        </div>
      </mat-expansion-panel-header>
      <mat-nav-list dense>
        <mat-list-item
          *ngFor="let collection of collections$ | ngrxPush"
          class="pr-0"
        >
          <a
            class="w-full flex justify-between gap-2 items-center flex-grow m-0 pl-0"
            matLine
            [routerLink]="[
              '/workspaces',
              collection.document.data.workspace,
              'applications',
              collection.document.data.application,
              'collections',
              collection.document.id
            ]"
            [matTooltip]="
              collection.document.name
                | bdItemUpdatingMessage: collection:'Collection'
            "
            matTooltipShowDelay="500"
          >
            <span
              class="pl-12 flex-grow text-left overflow-hidden whitespace-nowrap overflow-ellipsis"
            >
              {{ collection.document.name }}
            </span>
            <mat-progress-spinner
              *ngIf="collection | bdItemShowSpinner"
              class="flex-shrink-0"
              diameter="16"
              mode="indeterminate"
            ></mat-progress-spinner>
          </a>

          <button
            mat-icon-button
            [attr.aria-label]="
              'More options of ' + collection.document.name + ' collection'
            "
            [matMenuTriggerFor]="collectionOptionsMenu"
          >
            <mat-icon>more_horiz</mat-icon>
          </button>
          <mat-menu #collectionOptionsMenu="matMenu" class="bd-bg-image-7 ">
            <button
              mat-menu-item
              bdEditCollection
              [collection]="collection.document"
              (editCollection)="
                onUpdateCollection(
                  collection.document.data.workspace,
                  collection.document.data.application,
                  collection.document.id,
                  $event
                )
              "
              [disabled]="!connected"
            >
              <mat-icon>edit</mat-icon>
              <span>Edit collection</span>
            </button>
            <button
              mat-menu-item
              (click)="
                onDeleteCollection(
                  collection.document.data.workspace,
                  collection.document.data.application,
                  collection.document.id
                )
              "
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
  providers: [CollectionsStore, CollectionQueryStore, CollectionExplorerStore],
})
export class CollectionExplorerComponent {
  @Input() connected = false;

  @Input() set workspaceId(value: string) {
    this._collectionExplorerStore.setWorkspaceId(value);
  }
  @Input() set applicationId(value: string) {
    this._collectionExplorerStore.setApplicationId(value);
  }

  readonly workspaceId$ = this._collectionExplorerStore.workspaceId$;
  readonly applicationId$ = this._collectionExplorerStore.applicationId$;
  readonly collections$ = this._collectionsStore.collections$;

  constructor(
    private readonly _collectionExplorerStore: CollectionExplorerStore,
    private readonly _collectionsStore: CollectionsStore
  ) {}

  onCreateCollection(
    workspaceId: string,
    applicationId: string,
    collectionName: string
  ) {
    this._collectionExplorerStore.createCollection({
      workspaceId,
      applicationId,
      collectionName,
    });
  }

  onUpdateCollection(
    workspaceId: string,
    applicationId: string,
    collectionId: string,
    collectionName: string
  ) {
    this._collectionExplorerStore.updateCollection({
      workspaceId,
      applicationId,
      collectionId,
      collectionName,
    });
  }

  onDeleteCollection(
    workspaceId: string,
    applicationId: string,
    collectionId: string
  ) {
    this._collectionExplorerStore.deleteCollection({
      workspaceId,
      applicationId,
      collectionId,
    });
  }
}
