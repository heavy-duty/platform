import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { CollectionAttributeItemView } from '@bulldozer-client/collections-data-access';
import { CollectionAttributeDto } from '@heavy-duty/bulldozer-devkit';

@Component({
  selector: 'bd-collection-attributes-list',
  template: `
    <mat-card class="p-3">
      <section class="flex flex-col gap-3">
        <header bdSectionHeader>
          <h2>
            Attributes
            <button
              color="primary"
              mat-icon-button
              aria-label="Add collection attribute"
              bdEditCollectionAttributeTrigger
              (editCollectionAttribute)="onCreateCollectionAttribute($event)"
            >
              <mat-icon>add</mat-icon>
            </button>
          </h2>
          <p>Visualize the list of attributes and manage them.</p>
        </header>

        <mat-list
          role="list"
          *ngIf="
            collectionAttributes && collectionAttributes.length > 0;
            else emptyList
          "
          class="flex flex-col gap-2"
        >
          <mat-list-item
            role="listitem"
            *ngFor="
              let collectionAttribute of collectionAttributes;
              let i = index
            "
            class="h-20 bg-white bg-opacity-5 mat-elevation-z2"
          >
            <div class="flex items-center gap-4 w-full">
              <div
                class="flex justify-center items-center w-12 h-12 rounded-full bg-black bg-opacity-10 text-xl font-bold"
              >
                {{ i + 1 }}
              </div>
              <div class="flex-grow">
                <h3 class="mb-0 text-lg font-bold flex items-center gap-2">
                  <span
                    [matTooltip]="
                      collectionAttribute.document.name
                        | bdItemUpdatingMessage: collectionAttribute:'Attribute'
                    "
                  >
                    {{ collectionAttribute.document.name }}
                  </span>
                  <mat-progress-spinner
                    *ngIf="collectionAttribute | bdItemShowSpinner"
                    diameter="16"
                    mode="indeterminate"
                  ></mat-progress-spinner>
                </h3>
                <p class="text-xs mb-0 italic">
                  Type:

                  <ng-container
                    *ngIf="collectionAttribute.document.data.modifier"
                  >
                    {{ collectionAttribute.document.data.modifier.name }}
                    <ng-container
                      *ngIf="
                        collectionAttribute.document.data.modifier.name ===
                        'array'
                      "
                    >
                      ({{ collectionAttribute.document.data.modifier?.size }})
                    </ng-container>
                    of
                  </ng-container>

                  {{ collectionAttribute.document.data.kind.name }}.
                </p>
              </div>
              <button
                mat-mini-fab
                color="primary"
                aria-label="Attributes menu"
                [matMenuTriggerFor]="collectionAttributeMenu"
              >
                <mat-icon>more_horiz</mat-icon>
              </button>
              <mat-menu #collectionAttributeMenu="matMenu">
                <button
                  mat-menu-item
                  bdEditCollectionAttributeTrigger
                  [collectionAttribute]="collectionAttribute.document"
                  (editCollectionAttribute)="
                    onUpdateCollectionAttribute(
                      collectionAttribute.document.id,
                      $event
                    )
                  "
                  [disabled]="!connected"
                >
                  <mat-icon>edit</mat-icon>
                  <span>Update attribute</span>
                </button>
                <button
                  mat-menu-item
                  (click)="
                    onDeleteCollectionAttribute(
                      collectionAttribute.document.data.collection,
                      collectionAttribute.document.id
                    )
                  "
                  [disabled]="!connected"
                >
                  <mat-icon>delete</mat-icon>
                  <span>Delete attribute</span>
                </button>
              </mat-menu>
            </div>
          </mat-list-item>
        </mat-list>

        <ng-template #emptyList>
          <p class="text-center text-xl py-8">There's no attributes yet.</p>
        </ng-template>
      </section>
    </mat-card>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollectionAttributesListComponent {
  @Input() connected = false;
  @Input() collectionAttributes: CollectionAttributeItemView[] | null = null;
  @Output() createCollectionAttribute =
    new EventEmitter<CollectionAttributeDto>();
  @Output() updateCollectionAttribute = new EventEmitter<{
    collectionAttributeId: string;
    collectionAttributeDto: CollectionAttributeDto;
  }>();
  @Output() deleteCollectionAttribute = new EventEmitter<{
    collectionId: string;
    collectionAttributeId: string;
  }>();

  onCreateCollectionAttribute(collectionAttributeDto: CollectionAttributeDto) {
    this.createCollectionAttribute.emit(collectionAttributeDto);
  }

  onUpdateCollectionAttribute(
    collectionAttributeId: string,
    collectionAttributeDto: CollectionAttributeDto
  ) {
    this.updateCollectionAttribute.emit({
      collectionAttributeId,
      collectionAttributeDto,
    });
  }

  onDeleteCollectionAttribute(
    collectionId: string,
    collectionAttributeId: string
  ) {
    this.deleteCollectionAttribute.emit({
      collectionId,
      collectionAttributeId,
    });
  }
}
