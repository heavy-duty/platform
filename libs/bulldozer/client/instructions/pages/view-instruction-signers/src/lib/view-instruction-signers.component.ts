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

    <main *ngrxLet="signers$; let signers">
      <div
        *ngIf="signers && signers.length > 0; else emptyList"
        class="flex gap-6 flex-wrap"
      >
        <mat-card
          *ngFor="let signer of signers; let i = index"
          class="h-auto w-96 rounded-lg overflow-hidden bd-bg-image-6 p-0"
        >
          <aside class="flex items-center bd-bg-black px-4 py-1 gap-1">
            <mat-progress-spinner
              *ngIf="signer | bdItemShowSpinner"
              diameter="24"
              mode="indeterminate"
            ></mat-progress-spinner>

            <div class="flex-1 flex justify-end">
              <button
                mat-icon-button
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
                [attr.aria-label]="'Update signer ' + signer.document.name"
              >
                <mat-icon>edit</mat-icon>
              </button>

              <button
                mat-icon-button
                [attr.aria-label]="'Delete signer ' + signer.document.name"
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
              </button>
            </div>
          </aside>

          <header class="flex items-center gap-4 p-4">
            <div
              class="w-12 h-12 flex justify-center items-center bd-bg-black rounded-full"
            >
              <mat-icon color="accent" class="w-1/2"> assignment_ind </mat-icon>
            </div>

            <div>
              <h2
                class="mb-0 text-lg font-bold uppercase"
                [matTooltip]="
                  signer.document.name | bdItemUpdatingMessage: signer:'Signer'
                "
                matTooltipShowDelay="500"
              >
                {{ signer.document.name }}
              </h2>
              <p class="m-0">
                <ng-container *ngIf="signer.document.data.modifier === null">
                  Non-mutable
                </ng-container>
                <ng-container
                  *ngIf="
                    signer.document.data.modifier !== null &&
                    signer.document.data.modifier.id === 1
                  "
                >
                  Mutable
                </ng-container>
              </p>
            </div>
          </header>
        </mat-card>
      </div>

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
