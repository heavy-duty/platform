import { Component, Input } from '@angular/core';
import { CollectionsStore } from '@bulldozer-client/collections-data-access';

@Component({
  selector: 'bd-collection-explorer',
  template: `
    <mat-expansion-panel togglePosition="before">
      <mat-expansion-panel-header class="pl-6 pr-0">
        <div class="flex justify-between items-center flex-grow">
          <mat-panel-title> Collections </mat-panel-title>
          <button
            mat-icon-button
            [disabled]="!connected"
            aria-label="Create collection"
            bdStopPropagation
            bdEditCollectionTrigger
            (editCollection)="
              onCreateCollection(workspaceId, applicationId, $event)
            "
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
              (editCollection)="
                onUpdateCollection(
                  collection.data.workspace,
                  collection.id,
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
                  collection.data.workspace,
                  collection.data.application,
                  collection.id
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
  providers: [CollectionsStore],
})
export class CollectionExplorerComponent {
  @Input() connected = false;

  private _workspaceId!: string;
  @Input() set workspaceId(value: string) {
    this._workspaceId = value;
  }
  get workspaceId() {
    return this._workspaceId;
  }

  private _applicationId!: string;
  @Input() set applicationId(value: string) {
    this._applicationId = value;
    this._collectionsStore.setFilters({
      application: this.applicationId,
    });
  }
  get applicationId() {
    return this._applicationId;
  }

  readonly collections$ = this._collectionsStore.collections$;

  constructor(private readonly _collectionsStore: CollectionsStore) {}

  onCreateCollection(
    workspaceId: string,
    applicationId: string,
    collectionName: string
  ) {
    this._collectionsStore.createCollection({
      workspaceId,
      applicationId,
      collectionName,
    });
  }

  onUpdateCollection(
    workspaceId: string,
    collectionId: string,
    collectionName: string
  ) {
    this._collectionsStore.updateCollection({
      workspaceId,
      collectionId,
      collectionName,
    });
  }

  onDeleteCollection(
    workspaceId: string,
    applicationId: string,
    collectionId: string
  ) {
    this._collectionsStore.deleteCollection({
      workspaceId,
      applicationId,
      collectionId,
    });
  }
}
