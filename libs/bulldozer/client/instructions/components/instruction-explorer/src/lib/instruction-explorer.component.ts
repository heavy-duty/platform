import { Component, Input } from '@angular/core';
import {
  InstructionApiService,
  InstructionQueryStore,
  InstructionsStore,
} from '@bulldozer-client/instructions-data-access';
import { NotificationStore } from '@bulldozer-client/notifications-data-access';
import { HdBroadcasterSocketStore } from '@heavy-duty/broadcaster';
import { InstructionDto } from '@heavy-duty/bulldozer-devkit';
import { InstructionExplorerStore } from './instruction-explorer.store';

@Component({
  selector: 'bd-instruction-explorer',
  template: `
    <mat-expansion-panel togglePosition="before">
      <mat-expansion-panel-header class="pl-6 pr-0">
        <div class="flex justify-between items-center flex-grow">
          <mat-panel-title class="font-bold"> Instructions </mat-panel-title>

          <ng-container *hdWalletAdapter="let publicKey = publicKey">
            <ng-container *ngIf="workspaceId$ | ngrxPush as workspaceId">
              <ng-container *ngIf="applicationId$ | ngrxPush as applicationId">
                <button
                  *ngIf="
                    publicKey !== null &&
                    workspaceId !== null &&
                    applicationId !== null
                  "
                  mat-icon-button
                  [disabled]="!connected"
                  aria-label="Create instruction"
                  bdStopPropagation
                  bdEditInstruction
                  (editInstruction)="
                    onCreateInstruction(
                      publicKey.toBase58(),
                      workspaceId,
                      applicationId,
                      $event
                    )
                  "
                >
                  <mat-icon>add</mat-icon>
                </button>
              </ng-container>
            </ng-container>
          </ng-container>
        </div>
      </mat-expansion-panel-header>
      <mat-nav-list dense>
        <mat-list-item
          *ngFor="let instruction of instructions$ | ngrxPush"
          class="pr-0"
        >
          <a
            class="w-full flex justify-between gap-2 items-center flex-grow m-0 pl-0"
            matLine
            [routerLink]="[
              '/workspaces',
              instruction.workspaceId,
              'applications',
              instruction.applicationId,
              'instructions',
              instruction.id
            ]"
            [matTooltip]="
              instruction.name
                | bdItemUpdatingMessage: instruction:'Instruction'
            "
            matTooltipShowDelay="500"
          >
            <span
              class="pl-12 flex-grow text-left overflow-hidden whitespace-nowrap overflow-ellipsis"
            >
              {{ instruction.name }}
            </span>
            <mat-progress-spinner
              *ngIf="instruction | bdItemShowSpinner"
              class="flex-shrink-0"
              diameter="16"
              mode="indeterminate"
            ></mat-progress-spinner>
          </a>

          <ng-container *hdWalletAdapter="let publicKey = publicKey">
            <ng-container *ngIf="publicKey !== null">
              <button
                mat-icon-button
                [attr.aria-label]="
                  'More options of ' + instruction.name + ' instruction'
                "
                [matMenuTriggerFor]="instructionOptionsMenu"
              >
                <mat-icon>more_horiz</mat-icon>
              </button>
              <mat-menu #instructionOptionsMenu="matMenu">
                <button
                  mat-menu-item
                  bdEditInstruction
                  [instruction]="instruction"
                  (editInstruction)="
                    onUpdateInstruction(
                      publicKey.toBase58(),
                      instruction.workspaceId,
                      instruction.applicationId,
                      instruction.id,
                      $event
                    )
                  "
                  [disabled]="!connected"
                >
                  <mat-icon>edit</mat-icon>
                  <span>Edit instruction</span>
                </button>
                <button
                  mat-menu-item
                  (click)="
                    onDeleteInstruction(
                      publicKey.toBase58(),
                      instruction.workspaceId,
                      instruction.applicationId,
                      instruction.id
                    )
                  "
                  [disabled]="!connected"
                >
                  <mat-icon>delete</mat-icon>
                  <span>Delete instruction</span>
                </button>
              </mat-menu>
            </ng-container>
          </ng-container>
        </mat-list-item>
      </mat-nav-list>
    </mat-expansion-panel>
  `,
  providers: [
    InstructionsStore,
    InstructionQueryStore,
    InstructionExplorerStore,
  ],
})
export class InstructionExplorerComponent {
  @Input() connected = false;

  @Input() set workspaceId(value: string) {
    this._instructionExplorerStore.setWorkspaceId(value);
  }
  @Input() set applicationId(value: string) {
    this._instructionExplorerStore.setApplicationId(value);
  }

  readonly workspaceId$ = this._instructionExplorerStore.workspaceId$;
  readonly applicationId$ = this._instructionExplorerStore.applicationId$;
  readonly instructions$ = this._instructionExplorerStore.instructions$;

  constructor(
    private readonly _hdBroadcasterSocketStore: HdBroadcasterSocketStore,
    private readonly _notificationStore: NotificationStore,
    private readonly _instructionApiService: InstructionApiService,
    private readonly _instructionExplorerStore: InstructionExplorerStore
  ) {}

  onCreateInstruction(
    authority: string,
    workspaceId: string,
    applicationId: string,
    instructionDto: InstructionDto
  ) {
    this._instructionApiService
      .create({
        authority,
        workspaceId,
        applicationId,
        instructionDto,
      })
      .subscribe({
        next: ({ transactionSignature, transaction }) => {
          this._notificationStore.setEvent('Create instruction request sent');
          this._hdBroadcasterSocketStore.send(
            JSON.stringify({
              event: 'transaction',
              data: {
                transactionSignature,
                transaction,
                topicNames: [
                  `authority:${authority}`,
                  `instructions:${applicationId}`,
                ],
              },
            })
          );
        },
        error: (error) => {
          this._notificationStore.setError(error);
        },
      });
  }

  onUpdateInstruction(
    authority: string,
    workspaceId: string,
    applicationId: string,
    instructionId: string,
    instructionDto: InstructionDto
  ) {
    this._instructionApiService
      .update({
        authority,
        workspaceId,
        applicationId,
        instructionDto,
        instructionId,
      })
      .subscribe({
        next: ({ transactionSignature, transaction }) => {
          this._notificationStore.setEvent('Update instruction request sent');
          this._hdBroadcasterSocketStore.send(
            JSON.stringify({
              event: 'transaction',
              data: {
                transactionSignature,
                transaction,
                topicNames: [
                  `authority:${authority}`,
                  `instructions:${applicationId}`,
                ],
              },
            })
          );
        },
        error: (error) => {
          this._notificationStore.setError(error);
        },
      });
  }

  onDeleteInstruction(
    authority: string,
    workspaceId: string,
    applicationId: string,
    instructionId: string
  ) {
    this._instructionApiService
      .delete({
        authority,
        workspaceId,
        applicationId,
        instructionId,
      })
      .subscribe({
        next: ({ transactionSignature, transaction }) => {
          this._notificationStore.setEvent('Delete instruction request sent');
          this._hdBroadcasterSocketStore.send(
            JSON.stringify({
              event: 'transaction',
              data: {
                transactionSignature,
                transaction,
                topicNames: [
                  `authority:${authority}`,
                  `instructions:${applicationId}`,
                ],
              },
            })
          );
        },
        error: (error) => {
          this._notificationStore.setError(error);
        },
      });
  }
}
