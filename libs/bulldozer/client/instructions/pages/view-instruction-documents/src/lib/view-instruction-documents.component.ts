import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  OnInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  CollectionQueryStore,
  CollectionsStore,
} from '@bulldozer-client/collections-data-access';
import {
  InstructionAccountQueryStore,
  InstructionAccountsStore,
  InstructionRelationQueryStore,
  InstructionRelationsStore,
} from '@bulldozer-client/instructions-data-access';
import { InstructionAccountDto } from '@heavy-duty/bulldozer-devkit';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { map } from 'rxjs';
import { ViewInstructionDocumentsStore } from './view-instruction-documents.store';

@Component({
  selector: 'bd-view-instruction-documents',
  template: `
    <header
      class="mb-8 border-b-2 border-yellow-500 flex items-center justify-between"
    >
      <div>
        <h1 class="text-2xl uppercase mb-1">Documents</h1>
        <p class="text-sm font-thin mb-2">
          The documents are the entities that make up the instruction.
        </p>
      </div>

      <ng-container *ngIf="workspaceId$ | ngrxPush as workspaceId">
        <ng-container *ngIf="applicationId$ | ngrxPush as applicationId">
          <button
            *ngIf="instructionId$ | ngrxPush as instructionId"
            mat-mini-fab
            color="accent"
            bdEditInstructionDocument
            [collections]="(collections$ | ngrxPush) ?? null"
            [instructionAccounts]="(instructionAccounts$ | ngrxPush) ?? null"
            (editInstructionDocument)="
              onCreateInstructionDocument(
                workspaceId,
                applicationId,
                instructionId,
                $event
              )
            "
          >
            <mat-icon>add</mat-icon>
          </button>
        </ng-container>
      </ng-container>
    </header>

    <main class="flex flex-col gap-4" *ngrxLet="documents$; let documents">
      <mat-list
        role="list"
        *ngIf="documents && documents.length > 0; else emptyList"
        class="flex flex-col gap-2"
      >
        <mat-list-item
          role="listitem"
          *ngFor="let instructionDocument of documents; let i = index"
          class="h-auto py-2 bg-white bg-opacity-5 mat-elevation-z2"
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
                *ngIf="instructionDocument.collection"
              >
                Collection:
                {{ instructionDocument.collection.document.name }}
                <a
                  class="underline text-accent"
                  [routerLink]="[
                    '/workspaces',
                    instructionDocument.document.data.workspace,
                    'applications',
                    instructionDocument.document.data.application,
                    'collections',
                    instructionDocument.collection.document.id
                  ]"
                  >{{
                    instructionDocument.collection.document.id | obscureAddress
                  }}</a
                >
              </p>
              <p class="text-xs mb-0 italic" *ngIf="instructionDocument.close">
                Close:
                {{ instructionDocument.close.document.name }} ({{
                  instructionDocument.close.document.id | obscureAddress
                }})
              </p>
              <p class="text-xs mb-0 italic" *ngIf="instructionDocument.payer">
                Payer:
                {{ instructionDocument.payer.document.name }} ({{
                  instructionDocument.payer.document.id | obscureAddress
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
                    class="flex items-center gap-2"
                  >
                    <span class="flex items-center gap-2">
                      <span
                        [matTooltip]="
                          relation.extras.to.document.name
                            | bdItemUpdatingMessage: relation:'Relation to'
                        "
                      >
                        <span class="font-bold">
                          {{ relation.extras.to.document.name }}
                        </span>

                        <span class="text-xs font-thin">
                          ({{ relation.document.id | obscureAddress }})
                        </span>
                      </span>
                      <mat-progress-spinner
                        *ngIf="relation | bdItemShowSpinner"
                        diameter="16"
                        mode="indeterminate"
                      ></mat-progress-spinner>
                    </span>

                    <button
                      class="w-6 h-6 leading-6"
                      mat-icon-button
                      [attr.aria-label]="
                        'Delete relation to ' + relation.extras.to.document.name
                      "
                      (click)="
                        onDeleteInstructionRelation(
                          relation.document.data.workspace,
                          relation.document.data.instruction,
                          relation.document.from,
                          relation.document.to
                        )
                      "
                      [disabled]="(connected$ | ngrxPush) === false"
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
                bdEditInstructionRelation
                [instructionAccounts]="
                  (instructionAccounts$ | ngrxPush) ?? null
                "
                [from]="instructionDocument.document.id"
                (editInstructionRelation)="
                  onCreateInstructionRelation(
                    instructionDocument.document.data.workspace,
                    instructionDocument.document.data.application,
                    instructionDocument.document.data.instruction,
                    $event.from,
                    $event.to
                  )
                "
                [disabled]="(connected$ | ngrxPush) === false"
              >
                <mat-icon>add</mat-icon>
                <span>Create relation</span>
              </button>
              <button
                mat-menu-item
                bdEditInstructionDocument
                [collections]="(collections$ | ngrxPush) ?? null"
                [instructionAccounts]="
                  (instructionAccounts$ | ngrxPush) ?? null
                "
                [instructionDocument]="instructionDocument.document"
                (editInstructionDocument)="
                  onUpdateInstructionDocument(
                    instructionDocument.document.data.workspace,
                    instructionDocument.document.data.instruction,
                    instructionDocument.document.id,
                    $event
                  )
                "
                [disabled]="(connected$ | ngrxPush) === false"
              >
                <mat-icon>edit</mat-icon>
                <span>Update document</span>
              </button>
              <button
                mat-menu-item
                (click)="
                  onDeleteInstructionDocument(
                    instructionDocument.document.data.workspace,
                    instructionDocument.document.data.instruction,
                    instructionDocument.document.id
                  )
                "
                [disabled]="(connected$ | ngrxPush) === false"
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
    </main>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    InstructionAccountsStore,
    InstructionAccountQueryStore,
    InstructionRelationsStore,
    InstructionRelationQueryStore,
    CollectionsStore,
    CollectionQueryStore,
    ViewInstructionDocumentsStore,
  ],
})
export class ViewInstructionDocumentsComponent implements OnInit {
  @HostBinding('class') class = 'block p-8 bg-white bg-opacity-5 h-full';
  instructionBody: string | null = null;
  readonly connected$ = this._walletStore.connected$;
  readonly workspaceId$ = this._viewInstructionDocumentsStore.workspaceId$;
  readonly applicationId$ = this._viewInstructionDocumentsStore.applicationId$;
  readonly instructionId$ = this._viewInstructionDocumentsStore.instructionId$;
  readonly documents$ = this._viewInstructionDocumentsStore.documents$;
  readonly collections$ = this._collectionsStore.collections$;
  readonly instructionAccounts$ =
    this._instructionAccountsStore.instructionAccounts$;

  constructor(
    private readonly _route: ActivatedRoute,
    private readonly _walletStore: WalletStore,
    private readonly _collectionsStore: CollectionsStore,
    private readonly _instructionAccountsStore: InstructionAccountsStore,
    private readonly _viewInstructionDocumentsStore: ViewInstructionDocumentsStore
  ) {}

  ngOnInit() {
    this._viewInstructionDocumentsStore.setWorkspaceId(
      this._route.paramMap.pipe(map((paramMap) => paramMap.get('workspaceId')))
    );
    this._viewInstructionDocumentsStore.setApplicationId(
      this._route.paramMap.pipe(
        map((paramMap) => paramMap.get('applicationId'))
      )
    );
    this._viewInstructionDocumentsStore.setInstructionId(
      this._route.paramMap.pipe(
        map((paramMap) => paramMap.get('instructionId'))
      )
    );
  }

  onCreateInstructionDocument(
    workspaceId: string,
    applicationId: string,
    instructionId: string,
    instructionAccountDto: InstructionAccountDto
  ) {
    this._viewInstructionDocumentsStore.createInstructionAccount({
      workspaceId,
      applicationId,
      instructionId,
      instructionAccountDto,
    });
  }

  onUpdateInstructionDocument(
    workspaceId: string,
    instructionId: string,
    instructionAccountId: string,
    instructionAccountDto: InstructionAccountDto
  ) {
    this._viewInstructionDocumentsStore.updateInstructionAccount({
      workspaceId,
      instructionId,
      instructionAccountId,
      instructionAccountDto,
    });
  }

  onDeleteInstructionDocument(
    workspaceId: string,
    instructionId: string,
    instructionAccountId: string
  ) {
    this._viewInstructionDocumentsStore.deleteInstructionAccount({
      workspaceId,
      instructionId,
      instructionAccountId,
    });
  }

  onCreateInstructionRelation(
    workspaceId: string,
    applicationId: string,
    instructionId: string,
    fromAccountId: string,
    toAccountId: string
  ) {
    this._viewInstructionDocumentsStore.createInstructionRelation({
      workspaceId,
      applicationId,
      instructionId,
      fromAccountId,
      toAccountId,
    });
  }

  onDeleteInstructionRelation(
    workspaceId: string,
    instructionId: string,
    fromAccountId: string,
    toAccountId: string
  ) {
    this._viewInstructionDocumentsStore.deleteInstructionRelation({
      workspaceId,
      instructionId,
      fromAccountId,
      toAccountId,
    });
  }
}
