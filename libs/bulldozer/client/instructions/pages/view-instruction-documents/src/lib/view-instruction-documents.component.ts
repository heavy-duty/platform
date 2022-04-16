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
    <!-- <header
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
            [collections]="(collections$ | ngrxPush)?.toArray() ?? null"
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

    <main *ngrxLet="documents$; let documents">
      <div
        *ngIf="documents && documents.length > 0; else emptyList"
        class="flex gap-6 flex-wrap"
      >
        <mat-card
          *ngFor="let instructionDocument of documents; let i = index"
          class="h-auto w-full rounded-lg overflow-hidden bd-bg-image-5 p-0"
        >
          <aside class="flex items-center bd-bg-black px-4 py-1 gap-1">
            <div class="flex-1 flex items-center gap-2">
              <ng-container *ngIf="instructionDocument | bdItemChanging">
                <mat-progress-spinner
                  diameter="20"
                  mode="indeterminate"
                ></mat-progress-spinner>

                <p class="m-0 text-xs text-white text-opacity-60">
                  <ng-container *ngIf="instructionDocument.isCreating">
                    Creating...
                  </ng-container>
                  <ng-container *ngIf="instructionDocument.isUpdating">
                    Updating...
                  </ng-container>
                  <ng-container *ngIf="instructionDocument.isDeleting">
                    Deleting...
                  </ng-container>
                </p>
              </ng-container>
            </div>

            <button
              mat-icon-button
              bdEditInstructionDocument
              [collections]="(collections$ | ngrxPush)?.toArray() ?? null"
              [instructionAccounts]="(instructionAccounts$ | ngrxPush) ?? null"
              [instructionDocument]="instructionDocument.document"
              (editInstructionDocument)="
                onUpdateInstructionDocument(
                  instructionDocument.document.data.workspace,
                  instructionDocument.document.data.instruction,
                  instructionDocument.document.id,
                  $event
                )
              "
              [disabled]="
                (connected$ | ngrxPush) === false ||
                (instructionDocument | bdItemChanging)
              "
              [attr.aria-label]="
                'Update document ' + instructionDocument.document.name
              "
            >
              <mat-icon>edit</mat-icon>
            </button>

            <button
              mat-icon-button
              [attr.aria-label]="
                'Delete document ' + instructionDocument.document.name
              "
              (click)="
                onDeleteInstructionDocument(
                  instructionDocument.document.data.workspace,
                  instructionDocument.document.data.instruction,
                  instructionDocument.document.id
                )
              "
              [disabled]="
                (connected$ | ngrxPush) === false ||
                (instructionDocument | bdItemChanging)
              "
            >
              <mat-icon>delete</mat-icon>
            </button>
          </aside>

          <header class="flex items-center gap-4 p-4">
            <div
              class="w-12 h-12 flex justify-center items-center bd-bg-black rounded-full"
            >
              <mat-icon
                class="w-1/2"
                [ngClass]="{
                  'text-green-500':
                    instructionDocument.document.data.modifier === null,
                  'text-blue-500':
                    instructionDocument.document.data.modifier?.id === 0,
                  'text-purple-500':
                    instructionDocument.document.data.modifier?.id === 1 &&
                    instructionDocument.close === null,
                  'text-yellow-700':
                    instructionDocument.document.data.modifier?.id === 1 &&
                    instructionDocument.close !== null
                }"
              >
                description
              </mat-icon>
            </div>

            <div class="flex-1">
              <h2
                class="mb-0 text-lg font-bold uppercase"
                [matTooltip]="
                  instructionDocument.document.name
                    | bdItemUpdatingMessage: instructionDocument:'Document'
                "
                matTooltipShowDelay="500"
              >
                {{ instructionDocument.document.name }}
              </h2>

              <p class="text-xs mb-0" *ngIf="instructionDocument.collection">
                Collection:
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
                >
                  {{ instructionDocument.collection.document.name }}
                </a>
              </p>
            </div>

            <div class="w-32 text-center">
              <p class="text-lg uppercase font-bold m-0">
                <ng-container
                  *ngIf="instructionDocument.document.data.modifier !== null"
                  [ngSwitch]="instructionDocument.document.data.modifier.id"
                >
                  <ng-container *ngSwitchCase="0"> create </ng-container>
                  <ng-container *ngSwitchCase="1">
                    <ng-container *ngIf="instructionDocument.close === null">
                      update
                    </ng-container>
                    <ng-container *ngIf="instructionDocument.close !== null">
                      delete
                    </ng-container>
                  </ng-container>
                </ng-container>

                <ng-container
                  *ngIf="instructionDocument.document.data.modifier === null"
                >
                  readonly
                </ng-container>
              </p>

              <p
                class="text-xs m-0 overflow-hidden whitespace-nowrap overflow-ellipsis"
                *ngIf="
                  instructionDocument.document.data.modifier !== null &&
                  instructionDocument.document.data.modifier.id === 0 &&
                  instructionDocument.payer !== null
                "
              >
                Payed by:

                <br />

                <a
                  class="underline text-accent"
                  [routerLink]="[
                    '/workspaces',
                    instructionDocument.document.data.workspace,
                    'applications',
                    instructionDocument.document.data.application,
                    'instructions',
                    instructionDocument.document.data.instruction,
                    instructionDocument.payer.document.data.kind.id === 0
                      ? 'documents'
                      : 'signers'
                  ]"
                  >{{ instructionDocument.payer?.document?.name }}</a
                >

                <br />

                ({{ instructionDocument.document.data.modifier.space }} bytes)
              </p>

              <p
                class="text-xs m-0 overflow-hidden whitespace-nowrap overflow-ellipsis"
                *ngIf="
                  instructionDocument.document.data.modifier !== null &&
                  instructionDocument.document.data.modifier.id === 1 &&
                  instructionDocument.close !== null
                "
              >
                Rent sent to:

                <br />

                <a
                  class="underline text-accent"
                  [routerLink]="[
                    '/workspaces',
                    instructionDocument.document.data.workspace,
                    'applications',
                    instructionDocument.document.data.application,
                    'instructions',
                    instructionDocument.document.data.instruction,
                    instructionDocument.close.document.data.kind.id === 0
                      ? 'documents'
                      : 'signers'
                  ]"
                >
                  {{ instructionDocument.close.document.name }}
                </a>
              </p>
            </div>
          </header>

          <section class="p-4">
            <div class="flex justify-start items-center">
              <p class="text-lg uppercase m-0">relation</p>
              <button
                mat-icon-button
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
              </button>
            </div>

            <div class="flex justify-start flex-wrap gap-4">
              <div
                *ngFor="let relation of instructionDocument.relations"
                class="relative"
              >
                <div
                  class="flex justify-between items-center gap-2 bd-bg-black px-8 py-2"
                >
                  <div class="w-48">
                    <h3
                      class="uppercase font-bold m-0 overflow-hidden whitespace-nowrap overflow-ellipsis"
                      [matTooltip]="
                        relation.extras.to.document.name
                          | bdItemUpdatingMessage: relation:'Relation to'
                      "
                    >
                      {{ relation.extras.to.document.name }}
                    </h3>

                    <p class="text-xs font-thin m-0">
                      ({{ relation.document.id | obscureAddress }})
                    </p>
                  </div>

                  <div class="w-10">
                    <button
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
                      [disabled]="
                        (connected$ | ngrxPush) === false ||
                        (relation | bdItemChanging)
                      "
                    >
                      <mat-icon>delete</mat-icon>
                    </button>
                  </div>
                </div>

                <div
                  class="w-2.5 h-2.5 rounded-full bg-gray-400 flex items-center justify-center overflow-hidden absolute top-2 left-2"
                >
                  <div class="w-full h-px bg-gray-600 rotate-45"></div>
                </div>

                <div
                  class="w-2.5 h-2.5 rounded-full bg-gray-400 flex items-center justify-center overflow-hidden absolute top-2 right-2"
                >
                  <div class="w-full h-px bg-gray-600"></div>
                </div>

                <div
                  class="w-2.5 h-2.5 rounded-full bg-gray-400 flex items-center justify-center overflow-hidden absolute bottom-2 left-2"
                >
                  <div class="w-full h-px bg-gray-600  rotate-90"></div>
                </div>

                <div
                  class="w-2.5 h-2.5 rounded-full bg-gray-400 flex items-center justify-center overflow-hidden absolute bottom-2 right-2"
                >
                  <div class="w-full h-px bg-gray-600  -rotate-12"></div>
                </div>
              </div>
            </div>
          </section>
        </mat-card>
      </div>

      <ng-template #emptyList>
        <p class="text-center text-xl py-8">There's no documents yet.</p>
      </ng-template>
    </main> -->
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
  // readonly documents$ = this._viewInstructionDocumentsStore.documents$;
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
