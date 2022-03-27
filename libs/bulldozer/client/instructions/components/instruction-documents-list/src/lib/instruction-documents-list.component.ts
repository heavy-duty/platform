import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import {
  InstructionAccountItemView,
  InstructionDocumentItemView,
} from '@bulldozer-client/instructions-data-access';
import {
  Collection,
  Document,
  InstructionAccountDto,
} from '@heavy-duty/bulldozer-devkit';

@Component({
  selector: 'bd-instruction-documents-list',
  template: `
    <mat-card class="p-3">
      <section class="flex flex-col gap-3">
        <header bdSectionHeader>
          <h2>
            Documents
            <button
              color="primary"
              mat-icon-button
              aria-label="Add instruction document"
              bdEditInstructionDocumentTrigger
              [collections]="collections"
              [instructionAccounts]="instructionAccounts"
              (editInstructionDocument)="onCreateInstructionDocument($event)"
            >
              <mat-icon>add</mat-icon>
            </button>
          </h2>
          <p>Visualize the list of documents and manage them.</p>
        </header>

        <mat-list
          role="list"
          *ngIf="
            instructionDocuments && instructionDocuments.length > 0;
            else emptyList
          "
          class="flex flex-col gap-2"
        >
          <mat-list-item
            role="listitem"
            *ngFor="
              let instructionDocument of instructionDocuments;
              let i = index
            "
            class="h-28 bg-white bg-opacity-5 mat-elevation-z2"
          >
            <div class="flex items-center gap-4 w-full">
              <div
                class="flex justify-center items-center w-12 h-12 rounded-full bg-black bg-opacity-10 text-xl font-bold"
              >
                <mat-icon>description</mat-icon>
              </div>

              <div class="flex-grow">
                <h3 class="mb-0 flex items-center gap-2 flex-grow">
                  <span
                    [matTooltip]="
                      instructionDocument.document.name
                        | bdItemUpdatingMessage: instructionDocument:'Document'
                    "
                  >
                    <span class="text-lg font-bold">
                      {{ instructionDocument.document.name }}
                    </span>

                    <span
                      class="text-xs font-thin"
                      *ngIf="instructionDocument.document.data.modifier"
                      [ngSwitch]="instructionDocument.document.data.modifier.id"
                    >
                      <ng-container *ngSwitchCase="0">
                        ({{ instructionDocument.document.data.modifier.name }}:
                        space
                        {{ instructionDocument.document.data.modifier.space }})
                      </ng-container>
                      <ng-container *ngSwitchCase="1">
                        ({{ instructionDocument.document.data.modifier.name }})
                      </ng-container>
                    </span>
                  </span>
                  <mat-progress-spinner
                    *ngIf="instructionDocument | bdItemShowSpinner"
                    diameter="16"
                    mode="indeterminate"
                  ></mat-progress-spinner>
                </h3>

                <p
                  class="text-xs mb-0 italic"
                  *ngIf="instructionDocument.document.collection"
                >
                  Collection:
                  {{ instructionDocument.document.collection.document.name }}
                  <a
                    class="underline text-accent"
                    [routerLink]="[
                      '/applications',
                      instructionDocument.document.data.application,
                      'collections',
                      instructionDocument.document.collection.document.id
                    ]"
                    >{{
                      instructionDocument.document.collection.document.id
                        | obscureAddress
                    }}</a
                  >
                </p>
                <p
                  class="text-xs mb-0 italic"
                  *ngIf="instructionDocument.document.close"
                >
                  Close:
                  {{ instructionDocument.document.close.document.name }} ({{
                    instructionDocument.document.close.document.id
                      | obscureAddress
                  }})
                </p>
                <p
                  class="text-xs mb-0 italic"
                  *ngIf="instructionDocument.document.payer"
                >
                  Payer:
                  {{ instructionDocument.document.payer.document.name }} ({{
                    instructionDocument.document.payer.document.id
                      | obscureAddress
                  }})
                </p>
                <ng-container
                  *ngIf="
                    instructionDocument.document.relations &&
                    instructionDocument.document.relations.length > 0
                  "
                >
                  <p class="mt-2 mb-0 font-bold">Relations</p>
                  <ul class="list-disc pl-4">
                    <li
                      *ngFor="
                        let relation of instructionDocument.document.relations
                      "
                      class="text-xs"
                    >
                      {{ relation.extras.to.document.name }} ({{
                        relation.id | obscureAddress
                      }})

                      <button
                        class="w-6 h-6 leading-6"
                        mat-icon-button
                        [attr.aria-label]="
                          'Delete relation to ' +
                          relation.extras.to.document.name
                        "
                        (click)="
                          onDeleteInstructionRelation(
                            relation.id,
                            relation.from,
                            relation.to
                          )
                        "
                        [disabled]="!connected"
                      >
                        <mat-icon>delete</mat-icon>
                      </button>
                    </li>
                  </ul>
                </ng-container>
              </div>

              <button
                mat-mini-fab
                color="primary"
                aria-label="Document menu"
                [matMenuTriggerFor]="documentMenu"
              >
                <mat-icon>more_horiz</mat-icon>
              </button>
              <mat-menu #documentMenu="matMenu">
                <button
                  mat-menu-item
                  bdEditInstructionRelationTrigger
                  [instructionAccounts]="instructionAccounts"
                  [from]="instructionDocument.document.id"
                  (editInstructionRelation)="
                    onCreateInstructionRelation($event.from, $event.to)
                  "
                  [disabled]="!connected"
                >
                  <mat-icon>add</mat-icon>
                  <span>Create relation</span>
                </button>
                <button
                  mat-menu-item
                  bdEditInstructionDocumentTrigger
                  [collections]="collections"
                  [instructionAccounts]="instructionAccounts"
                  [instructionDocument]="instructionDocument.document"
                  (editInstructionDocument)="
                    onUpdateInstructionDocument(
                      instructionDocument.document.id,
                      $event
                    )
                  "
                  [disabled]="!connected"
                >
                  <mat-icon>edit</mat-icon>
                  <span>Update document</span>
                </button>
                <button
                  mat-menu-item
                  (click)="
                    onDeleteInstructionDocument(instructionDocument.document.id)
                  "
                  [disabled]="!connected"
                >
                  <mat-icon>delete</mat-icon>
                  <span>Delete document</span>
                </button>
              </mat-menu>
            </div>
          </mat-list-item>
        </mat-list>

        <ng-template #emptyList>
          <p class="text-center text-xl py-8">There's no documents yet.</p>
        </ng-template>
      </section>
    </mat-card>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [],
})
export class InstructionDocumentsListComponent {
  @Input() connected = false;
  @Input() instructionDocuments: InstructionDocumentItemView[] | null = null;
  @Input() instructionAccounts: InstructionAccountItemView[] | null = null;
  @Input() collections: Document<Collection>[] | null = null;
  @Output() createInstructionDocument =
    new EventEmitter<InstructionAccountDto>();
  @Output() updateInstructionDocument = new EventEmitter<{
    instructionAccountId: string;
    instructionAccountDto: InstructionAccountDto;
  }>();
  @Output() deleteInstructionDocument = new EventEmitter<string>();
  @Output() createInstructionRelation = new EventEmitter<{
    fromAccountId: string;
    toAccountId: string;
  }>();
  @Output() deleteInstructionRelation = new EventEmitter<{
    instructionRelationId: string;
    fromAccountId: string;
    toAccountId: string;
  }>();

  onCreateInstructionDocument(instructionAccountDto: InstructionAccountDto) {
    this.createInstructionDocument.emit(instructionAccountDto);
  }

  onUpdateInstructionDocument(
    instructionAccountId: string,
    instructionAccountDto: InstructionAccountDto
  ) {
    this.updateInstructionDocument.emit({
      instructionAccountId,
      instructionAccountDto,
    });
  }

  onDeleteInstructionDocument(instructionAccountId: string) {
    this.deleteInstructionDocument.emit(instructionAccountId);
  }

  onCreateInstructionRelation(fromAccountId: string, toAccountId: string) {
    this.createInstructionRelation.emit({ fromAccountId, toAccountId });
  }

  onDeleteInstructionRelation(
    instructionRelationId: string,
    fromAccountId: string,
    toAccountId: string
  ) {
    this.deleteInstructionRelation.emit({
      instructionRelationId,
      fromAccountId,
      toAccountId,
    });
  }
}
