import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  OnInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  InstructionArgumentQueryStore,
  InstructionArgumentsStore,
} from '@bulldozer-client/instructions-data-access';
import { InstructionArgumentDto } from '@heavy-duty/bulldozer-devkit';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { map } from 'rxjs';
import { ViewInstructionArgumentsStore } from './view-instruction-arguments.store';

@Component({
  selector: 'bd-view-instruction-arguments',
  template: `
    <header
      class="mb-8 border-b-2 border-yellow-500 flex items-center justify-between"
    >
      <div>
        <h1 class="text-2xl uppercase mb-1">Arguments</h1>
        <p class="text-sm font-thin mb-2">
          The arguments are the input parameters of your instruction.
        </p>
      </div>

      <ng-container *ngIf="workspaceId$ | ngrxPush as workspaceId">
        <ng-container *ngIf="applicationId$ | ngrxPush as applicationId">
          <button
            *ngIf="instructionId$ | ngrxPush as instructionId"
            mat-mini-fab
            color="accent"
            bdEditInstructionArgument
            (editInstructionArgument)="
              onCreateInstructionArgument(
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

    <main *ngrxLet="instructionArguments$; let instructionArguments">
      <div
        class="flex gap-6 flex-wrap"
        *ngIf="
          instructionArguments && instructionArguments.length > 0;
          else emptyList
        "
      >
        <mat-card
          *ngFor="
            let instructionArgument of instructionArguments;
            let i = index
          "
          class="h-auto w-96 rounded-lg overflow-hidden bd-bg-image-4 p-0"
        >
          <aside class="flex items-center bd-bg-black px-4 py-1 gap-1">
            <mat-progress-spinner
              *ngIf="instructionArgument | bdItemShowSpinner"
              diameter="24"
              mode="indeterminate"
            ></mat-progress-spinner>
            <div class="flex flex-1 justify-end">
              <button
                mat-icon-button
                bdEditInstructionArgument
                [instructionArgument]="instructionArgument.document"
                (editInstructionArgument)="
                  onUpdateInstructionArgument(
                    instructionArgument.document.data.workspace,
                    instructionArgument.document.data.instruction,
                    instructionArgument.document.id,
                    $event
                  )
                "
                [disabled]="(connected$ | ngrxPush) === false"
              >
                <mat-icon>edit</mat-icon>
              </button>
              <button
                mat-icon-button
                (click)="
                  onDeleteInstructionArgument(
                    instructionArgument.document.data.workspace,
                    instructionArgument.document.data.instruction,
                    instructionArgument.document.id
                  )
                "
                [disabled]="(connected$ | ngrxPush) === false"
              >
                <mat-icon>delete</mat-icon>
              </button>
            </div>
          </aside>

          <div class="px-8 mt-4">
            <header class="flex gap-2 mb-8">
              <figure
                class="w-12 h-12 flex justify-center items-center bd-bg-black rounded-full"
              >
                <mat-icon
                  class="w-1/2"
                  [ngClass]="{
                    'text-yellow-500':
                      instructionArgument.document.data.kind.id === 0,
                    'text-blue-500':
                      instructionArgument.document.data.kind.id === 1,
                    'text-green-500':
                      instructionArgument.document.data.kind.id === 2,
                    'text-red-500':
                      instructionArgument.document.data.kind.id === 3
                  }"
                  >code</mat-icon
                >
              </figure>

              <div>
                <h2
                  class="mb-0 text-lg font-bold flex items-center gap-2"
                  [matTooltip]="
                    instructionArgument.document.name
                      | bdItemUpdatingMessage: instructionArgument:'Argument'
                  "
                  matTooltipShowDelay="500"
                >
                  {{ instructionArgument.document.name }}
                </h2>
                <p class="text-sm mb-0">
                  Type: {{ instructionArgument.document.data.kind.name }}.
                </p>
              </div>
            </header>

            <section class="flex gap-6 mb-4 justify-between">
              <p class="text-sm font-thin m-0">
                <mat-icon inline>auto_awesome_motion</mat-icon>
                &nbsp;
                <ng-container
                  *ngIf="instructionArgument.document.data.modifier !== null"
                  [ngSwitch]="instructionArgument.document.data.modifier.id"
                >
                  <ng-container *ngSwitchCase="0">
                    Array of Items
                  </ng-container>
                  <ng-container *ngSwitchCase="1">
                    Vector of Items
                  </ng-container>
                </ng-container>

                <ng-container
                  *ngIf="instructionArgument.document.data.modifier === null"
                >
                  Single Item
                </ng-container>
              </p>
              <p
                class="text-sm font-thin m-0"
                *ngIf="
                  instructionArgument.document.data.modifier !== null &&
                  instructionArgument.document.data.modifier.size
                "
              >
                <mat-icon inline="">data_array</mat-icon>
                &nbsp; Size:
                {{ instructionArgument.document.data.modifier?.size }}
              </p>
            </section>
          </div>
        </mat-card>
      </div>

      <ng-template #emptyList>
        <p class="text-center text-xl py-8">There's no attributes yet.</p>
      </ng-template>
    </main>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    InstructionArgumentsStore,
    InstructionArgumentQueryStore,
    ViewInstructionArgumentsStore,
  ],
})
export class ViewInstructionArgumentsComponent implements OnInit {
  @HostBinding('class') class = 'block p-8 bg-white bg-opacity-5 h-full';
  instructionBody: string | null = null;
  readonly connected$ = this._walletStore.connected$;
  readonly workspaceId$ = this._viewInstructionArgumentsStore.workspaceId$;
  readonly applicationId$ = this._viewInstructionArgumentsStore.applicationId$;
  readonly instructionId$ = this._viewInstructionArgumentsStore.instructionId$;
  readonly instructionArguments$ =
    this._instructionArgumentsStore.instructionArguments$;

  constructor(
    private readonly _route: ActivatedRoute,
    private readonly _instructionArgumentsStore: InstructionArgumentsStore,
    private readonly _walletStore: WalletStore,
    private readonly _viewInstructionArgumentsStore: ViewInstructionArgumentsStore
  ) {}

  ngOnInit() {
    this._viewInstructionArgumentsStore.setWorkspaceId(
      this._route.paramMap.pipe(map((paramMap) => paramMap.get('workspaceId')))
    );
    this._viewInstructionArgumentsStore.setApplicationId(
      this._route.paramMap.pipe(
        map((paramMap) => paramMap.get('applicationId'))
      )
    );
    this._viewInstructionArgumentsStore.setInstructionId(
      this._route.paramMap.pipe(
        map((paramMap) => paramMap.get('instructionId'))
      )
    );
  }

  onCreateInstructionArgument(
    workspaceId: string,
    applicationId: string,
    instructionId: string,
    instructionArgumentDto: InstructionArgumentDto
  ) {
    this._viewInstructionArgumentsStore.createInstructionArgument({
      workspaceId,
      applicationId,
      instructionId,
      instructionArgumentDto,
    });
  }

  onUpdateInstructionArgument(
    workspaceId: string,
    instructionId: string,
    instructionArgumentId: string,
    instructionArgumentDto: InstructionArgumentDto
  ) {
    this._viewInstructionArgumentsStore.updateInstructionArgument({
      workspaceId,
      instructionId,
      instructionArgumentId,
      instructionArgumentDto,
    });
  }

  onDeleteInstructionArgument(
    workspaceId: string,
    instructionId: string,
    instructionArgumentId: string
  ) {
    this._viewInstructionArgumentsStore.deleteInstructionArgument({
      workspaceId,
      instructionId,
      instructionArgumentId,
    });
  }
}
