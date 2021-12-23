import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Collection } from '@heavy-duty/bulldozer/application/utils/types';

@Component({
  selector: 'bd-collection-selector',
  template: `
    <mat-expansion-panel>
      <mat-expansion-panel-header>
        <div class="flex justify-between items-center flex-grow">
          <mat-panel-title> Collections </mat-panel-title>
          <button
            mat-icon-button
            [disabled]="connected === false"
            aria-label="Create collection"
            (click)="onCreateCollection($event)"
          >
            <mat-icon>add</mat-icon>
          </button>
        </div>
      </mat-expansion-panel-header>
      <mat-nav-list dense>
        <mat-list-item *ngFor="let collection of collections">
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
            [matTooltip]="collection.data.name"
            matTooltipShowDelay="500"
          >
            {{ collection.data.name }}
          </a>

          <button
            mat-icon-button
            [attr.aria-label]="
              'More options of ' + collection.data.name + ' collection'
            "
            [matMenuTriggerFor]="collectionOptionsMenu"
          >
            <mat-icon>more_horiz</mat-icon>
          </button>
          <mat-menu #collectionOptionsMenu="matMenu">
            <button
              mat-menu-item
              (click)="onEditCollection(collection)"
              [disabled]="connected === false"
            >
              <mat-icon>edit</mat-icon>
              <span>Edit collection</span>
            </button>
            <button
              mat-menu-item
              (click)="onDeleteCollection(collection.id)"
              [disabled]="connected === false"
            >
              <mat-icon>delete</mat-icon>
              <span>Delete collection</span>
            </button>
          </mat-menu>
        </mat-list-item>
      </mat-nav-list>
    </mat-expansion-panel>
  `,
})
export class CollectionSelectorComponent {
  @Input() connected?: boolean | null = null;
  @Input() collections?: Collection[] | null = null;
  @Output() createCollection = new EventEmitter();
  @Output() updateCollection = new EventEmitter<Collection>();
  @Output() deleteCollection = new EventEmitter<string>();

  onCreateCollection(event: Event) {
    event.stopPropagation();
    event.preventDefault();
    this.createCollection.emit();
  }

  onEditCollection(collection: Collection) {
    this.updateCollection.emit(collection);
  }

  onDeleteCollection(collectionId: string) {
    this.deleteCollection.emit(collectionId);
  }
}
