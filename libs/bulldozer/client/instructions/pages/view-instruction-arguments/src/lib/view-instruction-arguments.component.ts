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

    <main
      class="flex flex-col gap-4"
      *ngrxLet="instructionArguments$; let instructionArguments"
    >
      <mat-list
        role="list"
        *ngIf="
          instructionArguments && instructionArguments.length > 0;
          else emptyList
        "
        class="flex flex-col gap-2"
      >
        <mat-list-item
          role="listitem"
          *ngFor="
            let instructionArgument of instructionArguments;
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
                    instructionArgument.document.name
                      | bdItemUpdatingMessage: instructionArgument:'Argument'
                  "
                >
                  {{ instructionArgument.document.name }}
                </span>
                <mat-progress-spinner
                  *ngIf="instructionArgument | bdItemShowSpinner"
                  diameter="16"
                  mode="indeterminate"
                ></mat-progress-spinner>
              </h3>
              <p class="text-xs mb-0 italic">
                Type:

                <ng-container
                  *ngIf="instructionArgument.document.data.modifier"
                >
                  {{ instructionArgument.document.data.modifier.name }}
                  <ng-container
                    *ngIf="
                      instructionArgument.document.data.modifier.name ===
                      'array'
                    "
                  >
                    ({{ instructionArgument.document.data.modifier?.size }})
                  </ng-container>
                  of
                </ng-container>

                {{ instructionArgument.document.data.kind.name }}.
              </p>
            </div>
            <button
              mat-mini-fab
              color="primary"
              aria-label="Arguments menu"
              [matMenuTriggerFor]="instructionArgumentMenu"
            >
              <mat-icon>more_horiz</mat-icon>
            </button>
            <mat-menu #instructionArgumentMenu="matMenu">
              <button
                mat-menu-item
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
                <span>Update argument</span>
              </button>
              <button
                mat-menu-item
                (click)="
                  onDeleteInstructionArgument(
                    instructionArgument.document.data.workspace,
                    instructionArgument.document.data.application,
                    instructionArgument.document.id
                  )
                "
                [disabled]="(connected$ | ngrxPush) === false"
              >
                <mat-icon>delete</mat-icon>
                <span>Delete argument</span>
              </button>
            </mat-menu>
          </div>
        </mat-list-item>
      </mat-list>

      <ng-template #emptyList>
        <p class="text-center text-xl py-8">There's no arguments yet.</p>
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
