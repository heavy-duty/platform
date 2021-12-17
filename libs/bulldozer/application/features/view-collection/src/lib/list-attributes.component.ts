import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { CollectionAttribute } from '@heavy-duty/bulldozer/application/utils/types';

@Component({
  selector: 'bd-list-attributes',
  template: `
    <section>
      <mat-card class="mb-4">
        <header bdSectionHeader>
          <h2>Attributes</h2>
          <p>Visualize the list of attributes and manage them.</p>
        </header>

        <mat-list
          role="list"
          *ngIf="attributes && attributes.length > 0; else emptyList"
        >
          <mat-list-item
            role="listitem"
            *ngFor="let attribute of attributes; let i = index"
            class="h-20 bg-white bg-opacity-5 mat-elevation-z2 mb-2 last:mb-0"
          >
            <div class="flex items-center gap-4 w-full">
              <div
                class="flex justify-center items-center w-12 h-12 rounded-full bg-black bg-opacity-10 text-xl font-bold"
              >
                {{ i + 1 }}
              </div>
              <div class="flex-grow">
                <h3 class="mb-0 text-lg font-bold">
                  {{ attribute.data.name }}
                </h3>
                <p class="text-xs mb-0 italic">
                  Type:

                  <ng-container *ngIf="attribute.data.modifier">
                    {{ attribute.data.modifier.name }}
                    <ng-container
                      *ngIf="attribute.data.modifier.name === 'array'"
                    >
                      ({{ attribute.data.modifier?.size }})
                    </ng-container>
                    of
                  </ng-container>

                  {{ attribute.data.kind.name }}.
                </p>
              </div>
              <button
                mat-mini-fab
                color="primary"
                aria-label="Attributes menu"
                [matMenuTriggerFor]="attributeMenu"
              >
                <mat-icon>more_horiz</mat-icon>
              </button>
              <mat-menu #attributeMenu="matMenu">
                <button
                  mat-menu-item
                  (click)="onUpdateAttribute(attribute)"
                  [disabled]="!connected"
                >
                  <mat-icon>edit</mat-icon>
                  <span>Update attribute</span>
                </button>
                <button
                  mat-menu-item
                  (click)="onDeleteAttribute(attribute.id)"
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
      </mat-card>
    </section>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListAttributesComponent {
  @Input() connected?: boolean | null = null;
  @Input() attributes?: CollectionAttribute[] | null = null;
  @Output() updateAttribute = new EventEmitter<CollectionAttribute>();
  @Output() deleteAttribute = new EventEmitter<string>();

  onUpdateAttribute(attributes: CollectionAttribute) {
    this.updateAttribute.emit(attributes);
  }

  onDeleteAttribute(attributeId: string) {
    this.deleteAttribute.emit(attributeId);
  }
}
