import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Collection, Document } from '@heavy-duty/bulldozer-devkit';

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
              [disabled]="connected === false"
            >
              <mat-icon>edit</mat-icon>
              <span>Edit collection</span>
            </button>
            <button
              mat-menu-item
              (click)="onDeleteCollection(collection)"
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
  @Input() collections?: Document<Collection>[] | null = null;
  @Output() createCollection = new EventEmitter();
  @Output() updateCollection = new EventEmitter<Document<Collection>>();
  @Output() deleteCollection = new EventEmitter<Document<Collection>>();

  onCreateCollection(event: Event) {
    event.stopPropagation();
    event.preventDefault();
    this.createCollection.emit();
  }

  onEditCollection(collection: Document<Collection>) {
    this.updateCollection.emit(collection);
  }

  onDeleteCollection(collection: Document<Collection>) {
    this.deleteCollection.emit(collection);
  }
}
