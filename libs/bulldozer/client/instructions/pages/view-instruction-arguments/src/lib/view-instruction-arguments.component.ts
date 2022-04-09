import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  OnInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  InstructionArgumentApiService,
  InstructionArgumentsStore,
} from '@bulldozer-client/instructions-data-access';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import { InstructionArgumentDto } from '@heavy-duty/bulldozer-devkit';
import { map } from 'rxjs';
import { InstructionArgumentItemView } from './types';
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

      <ng-container *hdWalletAdapter="let publicKey = publicKey">
        <ng-container *ngrxLet="workspaceId$; let workspaceId">
          <ng-container *ngrxLet="applicationId$; let applicationId">
            <ng-container *ngrxLet="instructionId$; let instructionId">
              <button
                *ngIf="
                  publicKey !== null &&
                  workspaceId !== null &&
                  applicationId !== null &&
                  instructionId !== null
                "
                mat-mini-fab
                color="accent"
                bdEditInstructionArgument
                (editInstructionArgument)="
                  onCreateInstructionArgument(
                    publicKey.toBase58(),
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
        </ng-container>
      </ng-container>
    </header>

    <main>
      <ng-container *ngIf="(loading$ | ngrxPush) === false; else loadingData">
        <ng-container
          *ngrxLet="instructionArguments$; let instructionArguments"
        >
          <section
            class="flex gap-6 flex-wrap"
            *ngIf="
              instructionArguments && instructionArguments.length > 0;
              else emptyList
            "
          >
            <mat-card
              *ngFor="
                let instructionArgument of instructionArguments;
                let i = index;
                trackBy: identify
              "
              class="h-auto w-96 rounded-lg overflow-hidden bd-bg-image-4 p-0"
            >
              <aside class="flex items-center bd-bg-black px-4 py-1 gap-1">
                <div class="flex-1 flex items-center gap-2">
                  <ng-container *ngIf="instructionArgument | bdItemChanging">
                    <mat-progress-spinner
                      diameter="20"
                      mode="indeterminate"
                    ></mat-progress-spinner>

                    <p class="m-0 text-xs text-white text-opacity-60">
                      <ng-container *ngIf="instructionArgument.isCreating">
                        Creating...
                      </ng-container>
                      <ng-container *ngIf="instructionArgument.isUpdating">
                        Updating...
                      </ng-container>
                      <ng-container *ngIf="instructionArgument.isDeleting">
                        Deleting...
                      </ng-container>
                    </p>
                  </ng-container>
                </div>

                <ng-container
                  *hdWalletAdapter="
                    let publicKey = publicKey;
                    let connected = connected
                  "
                >
                  <button
                    *ngIf="publicKey !== null"
                    [attr.aria-label]="
                      'Update argument ' + instructionArgument.name
                    "
                    mat-icon-button
                    bdEditInstructionArgument
                    [instructionArgument]="{
                      name: instructionArgument.name,
                      kind: instructionArgument.kind.id,
                      max:
                        instructionArgument.kind.id === 1
                          ? instructionArgument.kind.size
                          : null,
                      maxLength: instructionArgument.kind.size,
                      modifier: instructionArgument.modifier?.id ?? null,
                      size: instructionArgument.modifier?.size ?? null
                    }"
                    (editInstructionArgument)="
                      onUpdateInstructionArgument(
                        publicKey.toBase58(),
                        instructionArgument.workspaceId,
                        instructionArgument.instructionId,
                        instructionArgument.id,
                        $event
                      )
                    "
                    [disabled]="
                      !connected || (instructionArgument | bdItemChanging)
                    "
                  >
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button
                    *ngIf="publicKey !== null"
                    [attr.aria-label]="
                      'Delete argument ' + instructionArgument.name
                    "
                    mat-icon-button
                    (click)="
                      onDeleteInstructionArgument(
                        publicKey.toBase58(),
                        instructionArgument.workspaceId,
                        instructionArgument.instructionId,
                        instructionArgument.id
                      )
                    "
                    [disabled]="
                      !connected || (instructionArgument | bdItemChanging)
                    "
                  >
                    <mat-icon>delete</mat-icon>
                  </button>
                </ng-container>
              </aside>

              <div class="px-8 mt-4">
                <header class="flex gap-2 mb-8">
                  <div class="w-1/5">
                    <figure
                      class="w-12 h-12 flex justify-center items-center bd-bg-black rounded-full flex-shrink-0"
                    >
                      <mat-icon
                        class="w-1/2"
                        [ngClass]="{
                          'text-yellow-500': instructionArgument.kind.id === 0,
                          'text-blue-500': instructionArgument.kind.id === 1,
                          'text-green-500': instructionArgument.kind.id === 2,
                          'text-red-500': instructionArgument.kind.id === 3
                        }"
                        >code</mat-icon
                      >
                    </figure>
                  </div>

                  <div class="w-4/5">
                    <h2
                      class="mb-0 text-lg font-bold overflow-hidden whitespace-nowrap overflow-ellipsis"
                      [matTooltip]="
                        instructionArgument.name
                          | bdItemUpdatingMessage
                            : instructionArgument
                            : 'Argument'
                      "
                      matTooltipShowDelay="500"
                    >
                      {{ instructionArgument.name }}
                    </h2>
                    <p class="text-sm mb-0">
                      Type: {{ instructionArgument.kind.name }}.
                    </p>
                  </div>
                </header>

                <section class="flex gap-6 mb-4 justify-between">
                  <p class="text-sm font-thin m-0">
                    <mat-icon inline>auto_awesome_motion</mat-icon>
                    &nbsp;
                    <ng-container
                      *ngIf="instructionArgument.modifier !== null"
                      [ngSwitch]="instructionArgument.modifier.id"
                    >
                      <ng-container *ngSwitchCase="0">
                        Array of Items
                      </ng-container>
                      <ng-container *ngSwitchCase="1">
                        Vector of Items
                      </ng-container>
                    </ng-container>

                    <ng-container *ngIf="instructionArgument.modifier === null">
                      Single Item
                    </ng-container>
                  </p>
                  <p
                    class="text-sm font-thin m-0"
                    *ngIf="
                      instructionArgument.modifier !== null &&
                      instructionArgument.modifier.size
                    "
                  >
                    <mat-icon inline="">data_array</mat-icon>
                    &nbsp; Size:
                    {{ instructionArgument.modifier?.size }}
                  </p>
                </section>
              </div>
            </mat-card>
          </section>
        </ng-container>
      </ng-container>

      <ng-template #loadingData>
        <div class="py-8" *ngIf="loading$ | ngrxPush">
          <mat-progress-spinner
            class="mx-auto mb-4"
            diameter="48"
            mode="indeterminate"
          ></mat-progress-spinner>
          <p class="text-center">Loading data...</p>
        </div>
      </ng-template>

      <ng-template #emptyList>
        <p class="text-center text-xl py-8">There's no attributes yet.</p>
      </ng-template>
    </main>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [InstructionArgumentsStore, ViewInstructionArgumentsStore],
})
export class ViewInstructionArgumentsComponent implements OnInit {
  @HostBinding('class') class = 'block p-8 bg-white bg-opacity-5 h-full';
  readonly workspaceId$ = this._route.paramMap.pipe(
    map((paramMap) => paramMap.get('workspaceId'))
  );
  readonly applicationId$ = this._route.paramMap.pipe(
    map((paramMap) => paramMap.get('applicationId'))
  );
  readonly instructionId$ = this._route.paramMap.pipe(
    map((paramMap) => paramMap.get('instructionId'))
  );
  readonly loading$ = this._viewInstructionArgumentsStore.loading$;
  readonly instructionArguments$ =
    this._viewInstructionArgumentsStore.instructionArguments$;

  constructor(
    private readonly _route: ActivatedRoute,
    private readonly _notificationStore: NotificationStore,
    private readonly _instructionArgumentApiService: InstructionArgumentApiService,
    private readonly _viewInstructionArgumentsStore: ViewInstructionArgumentsStore
  ) {}

  ngOnInit() {
    this._viewInstructionArgumentsStore.setInstructionId(
      this._route.paramMap.pipe(
        map((paramMap) => paramMap.get('instructionId'))
      )
    );
  }

  onCreateInstructionArgument(
    authority: string,
    workspaceId: string,
    applicationId: string,
    instructionId: string,
    instructionArgumentDto: InstructionArgumentDto
  ) {
    this._instructionArgumentApiService
      .create({
        instructionArgumentDto,
        authority,
        workspaceId,
        applicationId,
        instructionId,
      })
      .subscribe({
        next: () =>
          this._notificationStore.setEvent('Create argument request sent'),
        error: (error) => {
          this._notificationStore.setError(error);
        },
      });
  }

  onUpdateInstructionArgument(
    authority: string,
    workspaceId: string,
    instructionId: string,
    instructionArgumentId: string,
    instructionArgumentDto: InstructionArgumentDto
  ) {
    this._instructionArgumentApiService
      .update({
        authority,
        workspaceId,
        instructionId,
        instructionArgumentDto,
        instructionArgumentId,
      })
      .subscribe({
        next: () =>
          this._notificationStore.setEvent('Update argument request sent'),
        error: (error) => this._notificationStore.setError(error),
      });
  }

  onDeleteInstructionArgument(
    authority: string,
    workspaceId: string,
    instructionId: string,
    instructionArgumentId: string
  ) {
    this._instructionArgumentApiService
      .delete({
        authority,
        workspaceId,
        instructionArgumentId,
        instructionId,
      })
      .subscribe({
        next: () =>
          this._notificationStore.setEvent('Delete argument request sent'),
        error: (error) => this._notificationStore.setError(error),
      });
  }

  identify(_: number, instructionArgument: InstructionArgumentItemView) {
    return instructionArgument.id;
  }
}
