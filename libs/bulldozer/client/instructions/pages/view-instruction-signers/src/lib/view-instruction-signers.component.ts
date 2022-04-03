import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  OnInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  InstructionAccountQueryStore,
  InstructionAccountsStore,
} from '@bulldozer-client/instructions-data-access';
import { InstructionAccountDto } from '@heavy-duty/bulldozer-devkit';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { map } from 'rxjs';
import { ViewInstructionSignersStore } from './view-instruction-signers.store';

@Component({
  selector: 'bd-view-instruction-signers',
  template: `
    <header
      class="mb-8 border-b-2 border-yellow-500 flex items-center justify-between"
    >
      <div>
        <h1 class="text-2xl uppercase mb-1">Signers</h1>
        <p class="text-sm font-thin mb-2">
          The signers are all the signatures required to execute the
          instruction.
        </p>
      </div>

      <ng-container *ngIf="workspaceId$ | ngrxPush as workspaceId">
        <ng-container *ngIf="applicationId$ | ngrxPush as applicationId">
          <button
            *ngIf="instructionId$ | ngrxPush as instructionId"
            mat-mini-fab
            color="accent"
            bdEditInstructionSigner
            (editInstructionSigner)="
              onCreateInstructionAccount(
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

    <main class="flex flex-col gap-4" *ngrxLet="signers$; let signers">
      <mat-list
        role="list"
        *ngIf="signers && signers.length > 0; else emptyList"
        class="flex flex-col gap-2"
      >
        <mat-list-item
          role="listitem"
          *ngFor="let signer of signers; let i = index"
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
                    signer.document.name
                      | bdItemUpdatingMessage: signer:'Account'
                  "
                >
                  {{ signer.document.name }}
                </span>
                <mat-progress-spinner
                  *ngIf="signer | bdItemShowSpinner"
                  diameter="16"
                  mode="indeterminate"
                ></mat-progress-spinner>
              </h3>
              <p class="text-xs mb-0 italic">
                Type:

                <ng-container *ngIf="signer.document.data.modifier">
                  {{ signer.document.data.modifier.name }}.
                </ng-container>
              </p>
            </div>
            <button
              mat-mini-fab
              color="primary"
              aria-label="Accounts menu"
              [matMenuTriggerFor]="signerMenu"
            >
              <mat-icon>more_horiz</mat-icon>
            </button>
            <mat-menu #signerMenu="matMenu">
              <button
                mat-menu-item
                bdEditInstructionSigner
                [instructionSigner]="signer.document"
                (editInstructionSigner)="
                  onUpdateInstructionAccount(
                    signer.document.data.workspace,
                    signer.document.data.instruction,
                    signer.document.id,
                    $event
                  )
                "
                [disabled]="(connected$ | ngrxPush) === false"
              >
                <mat-icon>edit</mat-icon>
                <span>Update signer</span>
              </button>
              <button
                mat-menu-item
                (click)="
                  onDeleteInstructionAccount(
                    signer.document.data.workspace,
                    signer.document.data.application,
                    signer.document.id
                  )
                "
                [disabled]="(connected$ | ngrxPush) === false"
              >
                <mat-icon>delete</mat-icon>
                <span>Delete signer</span>
              </button>
            </mat-menu>
          </div>
        </mat-list-item>
      </mat-list>

      <ng-template #emptyList>
        <p class="text-center text-xl py-8">There's no signers yet.</p>
      </ng-template>
    </main>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    InstructionAccountsStore,
    InstructionAccountQueryStore,
    ViewInstructionSignersStore,
  ],
})
export class ViewInstructionSignersComponent implements OnInit {
  @HostBinding('class') class = 'block p-8 bg-white bg-opacity-5 h-full';
  instructionBody: string | null = null;
  readonly connected$ = this._walletStore.connected$;
  readonly workspaceId$ = this._viewInstructionSignersStore.workspaceId$;
  readonly applicationId$ = this._viewInstructionSignersStore.applicationId$;
  readonly instructionId$ = this._viewInstructionSignersStore.instructionId$;
  readonly signers$ = this._instructionAccountsStore.instructionAccounts$;

  constructor(
    private readonly _route: ActivatedRoute,
    private readonly _instructionAccountsStore: InstructionAccountsStore,
    private readonly _walletStore: WalletStore,
    private readonly _viewInstructionSignersStore: ViewInstructionSignersStore
  ) {}

  ngOnInit() {
    this._viewInstructionSignersStore.setWorkspaceId(
      this._route.paramMap.pipe(map((paramMap) => paramMap.get('workspaceId')))
    );
    this._viewInstructionSignersStore.setApplicationId(
      this._route.paramMap.pipe(
        map((paramMap) => paramMap.get('applicationId'))
      )
    );
    this._viewInstructionSignersStore.setInstructionId(
      this._route.paramMap.pipe(
        map((paramMap) => paramMap.get('instructionId'))
      )
    );
  }

  onCreateInstructionAccount(
    workspaceId: string,
    applicationId: string,
    instructionId: string,
    instructionAccountDto: InstructionAccountDto
  ) {
    this._viewInstructionSignersStore.createInstructionAccount({
      workspaceId,
      applicationId,
      instructionId,
      instructionAccountDto,
    });
  }

  onUpdateInstructionAccount(
    workspaceId: string,
    instructionId: string,
    instructionAccountId: string,
    instructionAccountDto: InstructionAccountDto
  ) {
    this._viewInstructionSignersStore.updateInstructionAccount({
      workspaceId,
      instructionId,
      instructionAccountId,
      instructionAccountDto,
    });
  }

  onDeleteInstructionAccount(
    workspaceId: string,
    instructionId: string,
    instructionAccountId: string
  ) {
    this._viewInstructionSignersStore.deleteInstructionAccount({
      workspaceId,
      instructionId,
      instructionAccountId,
    });
  }
}
