import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { InstructionDocument } from '@bulldozer-client/instructions-data-access';
import {
  Collection,
  Document,
  InstructionAccount,
  InstructionAccountDto,
} from '@heavy-duty/bulldozer-devkit';

@Component({
  selector: 'bd-instruction-documents-list',
  template: `
    <section>
      <mat-card class="mb-4">
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
        >
          <mat-list-item
            role="listitem"
            *ngFor="
              let instructionDocument of instructionDocuments;
              let i = index
            "
            class="h-auto bg-white bg-opacity-5 mat-elevation-z2 mb-2 last:mb-0 py-2"
          >
            <div class="flex items-center gap-4 w-full">
              <div
                class="flex justify-center items-center w-12 h-12 rounded-full bg-black bg-opacity-10 text-xl font-bold"
              >
                <mat-icon>description</mat-icon>
              </div>

              <div class="flex-grow">
                <h3 class="mb-0 text-lg font-bold">
                  {{ instructionDocument.name }}

                  <span
                    class="text-xs font-thin"
                    *ngIf="instructionDocument.data.modifier"
                    [ngSwitch]="instructionDocument.data.modifier.id"
                  >
                    <ng-container *ngSwitchCase="0">
                      ({{ instructionDocument.data.modifier.name }}: space
                      {{ instructionDocument.data.modifier.space }})
                    </ng-container>
                    <ng-container *ngSwitchCase="1">
                      ({{ instructionDocument.data.modifier.name }})
                    </ng-container>
                  </span>
                </h3>
                <p
                  class="text-xs mb-0 italic"
                  *ngIf="instructionDocument.collection"
                >
                  Collection:
                  {{ instructionDocument.collection.name }}
                  <a
                    class="underline text-accent"
                    [routerLink]="[
                      '/applications',
                      instructionDocument.data.application,
                      'collections',
                      instructionDocument.collection.id
                    ]"
                    >{{ instructionDocument.collection.id | obscureAddress }}</a
                  >
                </p>
                <p
                  class="text-xs mb-0 italic"
                  *ngIf="instructionDocument.close"
                >
                  Close:
                  {{ instructionDocument.close.name }} ({{
                    instructionDocument.close.id | obscureAddress
                  }})
                </p>
                <p
                  class="text-xs mb-0 italic"
                  *ngIf="instructionDocument.payer"
                >
                  Payer:
                  {{ instructionDocument.payer.name }} ({{
                    instructionDocument.payer.id | obscureAddress
                  }})
                </p>
                <ng-container
                  *ngIf="
                    instructionDocument.relations &&
                    instructionDocument.relations.length > 0
                  "
                >
                  <p class="mt-2 mb-0 font-bold">Relations</p>
                  <ul class="list-disc pl-4">
                    <li
                      *ngFor="let relation of instructionDocument.relations"
                      class="text-xs"
                    >
                      {{ relation.extras.to.name }} ({{
                        relation.id | obscureAddress
                      }})
                      <button
                        class="w-6 h-6 leading-6"
                        mat-icon-button
                        [attr.aria-label]="
                          'More options of ' +
                          relation.extras.to.name +
                          ' has one relation'
                        "
                        [matMenuTriggerFor]="documentRelationMenu"
                      >
                        <mat-icon>more_horiz</mat-icon>
                      </button>
                      <mat-menu #documentRelationMenu="matMenu">
                        <button
                          mat-menu-item
                          bdEditInstructionRelationTrigger
                          [instructionRelation]="relation"
                          [collections]="collections"
                          [instructionAccounts]="instructionAccounts"
                          [from]="instructionDocument.id"
                          (editInstructionRelation)="
                            onUpdateInstructionRelation(
                              relation.id,
                              $event.from,
                              $event.to
                            )
                          "
                          [disabled]="!connected"
                        >
                          <mat-icon>edit</mat-icon>
                          <span>Update relation</span>
                        </button>
                        <button
                          mat-menu-item
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
                          <span>Delete relation</span>
                        </button>
                      </mat-menu>
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
                  [collections]="collections"
                  [instructionAccounts]="instructionAccounts"
                  [from]="instructionDocument.id"
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
                  [instructionDocument]="instructionDocument"
                  (editInstructionDocument)="
                    onUpdateInstructionDocument(instructionDocument.id, $event)
                  "
                  [disabled]="!connected"
                >
                  <mat-icon>edit</mat-icon>
                  <span>Update document</span>
                </button>
                <button
                  mat-menu-item
                  (click)="onDeleteInstructionDocument(instructionDocument.id)"
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
      </mat-card>
    </section>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [],
})
export class InstructionDocumentsListComponent {
  @Input() connected = false;
  @Input() instructionDocuments: InstructionDocument[] | null = null;
  @Input() instructionAccounts: Document<InstructionAccount>[] | null = null;
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
  @Output() updateInstructionRelation = new EventEmitter<{
    instructionRelationId: string;
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

  onUpdateInstructionRelation(
    instructionRelationId: string,
    fromAccountId: string,
    toAccountId: string
  ) {
    this.updateInstructionRelation.emit({
      instructionRelationId,
      fromAccountId,
      toAccountId,
    });
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
