import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { Collaborator, Document, User } from '@heavy-duty/bulldozer-devkit';

@Component({
  selector: 'bd-collaborators-list',
  template: `
    <mat-card class="p-3">
      <section class="flex flex-col gap-3">
        <header bdSectionHeader>
          <h2>Collaborators</h2>
          <p>Visualize workspace's collaborators.</p>
          <button
            *ngIf="currentCollaborator === null"
            mat-raised-button
            color="primary"
            (click)="onRequestCollaboratorStatus()"
          >
            Become a Collaborator
          </button>
        </header>

        <mat-slide-toggle
          color="color"
          [checked]="mode === 'pending'"
          (toggleChange)="
            onSetCollaboratorListMode(mode === 'ready' ? 'pending' : 'ready')
          "
        >
          <ng-container *ngIf="mode === 'ready'">
            Display pending
          </ng-container>
          <ng-container *ngIf="mode === 'pending'">
            Display pending
          </ng-container>
        </mat-slide-toggle>

        <mat-checkbox
          [checked]="showRejected"
          (change)="onToggleShowRejected()"
        >
          Show rejected
        </mat-checkbox>

        <ng-container *ngIf="mode === 'ready'">
          <mat-list
            role="list"
            *ngIf="
              readyCollaborators && readyCollaborators.length > 0;
              else emptyList
            "
            class="flex flex-col gap-2"
          >
            <mat-list-item
              role="listitem"
              *ngFor="let collaborator of readyCollaborators; let i = index"
              class="h-28 bg-white bg-opacity-5 mat-elevation-z2"
            >
              <div class="flex items-center gap-4 w-full py-2">
                <div
                  class="flex justify-center items-center w-12 h-12 rounded-full bg-black bg-opacity-10 text-xl font-bold"
                >
                  {{ i + 1 }}
                </div>
                <div class="flex-grow">
                  <h3 class="mb-0 text-lg font-bold">
                    Collaborator ID: {{ collaborator.id }}
                  </h3>
                  <p class="text-xs mb-0 italic">
                    User ID: {{ collaborator.data.user }}
                  </p>
                  <p class="text-xs mb-0 italic">
                    Wallet: {{ collaborator.data.authority }}
                  </p>
                  <p
                    class="text-xs mb-0 font-bold uppercase"
                    *ngIf="collaborator.data.isAdmin"
                  >
                    admin
                  </p>
                  <p class="text-xs mb-0">
                    Collaborator since
                    {{
                      collaborator.createdAt.toNumber() * 1000
                        | date: 'mediumDate'
                    }}

                    <span
                      *ngIf="collaborator.createdAt.lt(collaborator.updatedAt)"
                      class="italic"
                    >
                      • Edited on
                      {{
                        collaborator.updatedAt.toNumber() * 1000
                          | date: 'mediumDate'
                      }}
                    </span>
                  </p>
                </div>
                <div
                  class="flex justify-center items-center w-28"
                  [ngSwitch]="collaborator.data.status.id"
                >
                  <ng-container *ngSwitchCase="0">
                    <div
                      *ngIf="currentCollaborator?.data?.isAdmin"
                      class="flex justify-center gap-2"
                    >
                      <button
                        (click)="
                          onApproveCollaboratorStatusRequest(collaborator.id)
                        "
                        mat-mini-fab
                        color="primary"
                        aria-label="Approve collaborator status request"
                      >
                        <mat-icon>check</mat-icon>
                      </button>
                      <button
                        (click)="
                          onRejectCollaboratorStatusRequest(collaborator.id)
                        "
                        mat-mini-fab
                        color="warn"
                        aria-label="Reject collaborator status request"
                      >
                        <mat-icon>close</mat-icon>
                      </button>
                    </div>

                    <mat-progress-spinner
                      *ngIf="
                        currentCollaborator !== null &&
                        !currentCollaborator.data.isAdmin
                      "
                      mode="indeterminate"
                      diameter="40"
                    ></mat-progress-spinner>
                  </ng-container>
                  <div
                    *ngSwitchCase="1"
                    class="flex flex-col gap-1 items-center"
                  >
                    <mat-icon class="text-green-500">check_circle</mat-icon>
                    <p class="m-0 uppercase font-bold text-green-500">
                      Approved
                    </p>
                    <button
                      *ngIf="currentCollaborator?.data?.isAdmin"
                      mat-stroked-button
                      color="warn"
                      (click)="onRevokeCollaboratorStatus(collaborator.id)"
                      [disabled]="currentUser?.id === collaborator.data.user"
                    >
                      Revoke
                      <mat-icon>cancel</mat-icon>
                    </button>
                  </div>
                  <div
                    *ngSwitchCase="2"
                    class="flex flex-col gap-1 items-center"
                  >
                    <mat-icon class="text-red-500">cancel</mat-icon>
                    <p class="m-0 uppercase font-bold text-red-500">Rejected</p>
                    <button
                      *ngIf="currentCollaborator?.data?.isAdmin"
                      mat-stroked-button
                      class="text-green-500"
                      (click)="onGrantCollaboratorStatus(collaborator.id)"
                      [disabled]="currentUser?.id === collaborator.data.user"
                    >
                      Grant
                      <mat-icon>check_circle</mat-icon>
                    </button>
                    <button
                      *ngIf="currentUser?.id === collaborator.data.user"
                      mat-stroked-button
                      class="text-green-500"
                      (click)="
                        onRetryCollaboratorStatusRequest(collaborator.id)
                      "
                    >
                      Try again
                      <mat-icon>cached</mat-icon>
                    </button>
                  </div>
                  <p *ngSwitchDefault>Unknown status</p>
                </div>
              </div>
            </mat-list-item>
          </mat-list>

          <ng-template #emptyList>
            <p class="text-center text-xl py-8">There's no collaborators.</p>
          </ng-template>
        </ng-container>

        <ng-container *ngIf="mode === 'pending'">
          <mat-list
            role="list"
            *ngIf="
              pendingCollaborators && pendingCollaborators.length > 0;
              else emptyList
            "
            class="flex flex-col gap-2"
          >
            <mat-list-item
              role="listitem"
              *ngFor="let collaborator of pendingCollaborators; let i = index"
              class="h-28 bg-white bg-opacity-5 mat-elevation-z2"
            >
              <div class="flex items-center gap-4 w-full py-2">
                <div
                  class="flex justify-center items-center w-12 h-12 rounded-full bg-black bg-opacity-10 text-xl font-bold"
                >
                  {{ i + 1 }}
                </div>
                <div class="flex-grow">
                  <h3 class="mb-0 text-lg font-bold">
                    Collaborator ID: {{ collaborator.id }}
                  </h3>
                  <p class="text-xs mb-0 italic">
                    User ID: {{ collaborator.data.user }}
                  </p>
                  <p class="text-xs mb-0 italic">
                    Wallet: {{ collaborator.data.authority }}
                  </p>
                  <p
                    class="text-xs mb-0 font-bold uppercase"
                    *ngIf="collaborator.data.isAdmin"
                  >
                    admin
                  </p>
                  <p class="text-xs mb-0">
                    Collaborator since
                    {{
                      collaborator.createdAt.toNumber() * 1000
                        | date: 'mediumDate'
                    }}

                    <span
                      *ngIf="collaborator.createdAt.lt(collaborator.updatedAt)"
                      class="italic"
                    >
                      • Edited on
                      {{
                        collaborator.updatedAt.toNumber() * 1000
                          | date: 'mediumDate'
                      }}
                    </span>
                  </p>
                </div>
                <div class="flex justify-center items-center w-28">
                  <div
                    *ngIf="currentCollaborator?.data?.isAdmin"
                    class="flex justify-center gap-2"
                  >
                    <button
                      (click)="
                        onApproveCollaboratorStatusRequest(collaborator.id)
                      "
                      mat-mini-fab
                      color="primary"
                      aria-label="Approve collaborator status request"
                    >
                      <mat-icon>check</mat-icon>
                    </button>
                    <button
                      (click)="
                        onRejectCollaboratorStatusRequest(collaborator.id)
                      "
                      mat-mini-fab
                      color="warn"
                      aria-label="Reject collaborator status request"
                    >
                      <mat-icon>close</mat-icon>
                    </button>
                  </div>

                  <mat-progress-spinner
                    *ngIf="
                      currentCollaborator !== null &&
                      !currentCollaborator.data.isAdmin
                    "
                    mode="indeterminate"
                    diameter="40"
                  ></mat-progress-spinner>
                </div>
              </div>
            </mat-list-item>
          </mat-list>

          <ng-template #emptyList>
            <p class="text-center text-xl py-8">
              There's no pending collaborator requests.
            </p>
          </ng-template>
        </ng-container>
      </section>
    </mat-card>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollaboratorsListComponent {
  @Input() showRejected = false;
  @Input() mode: 'ready' | 'pending' = 'ready';
  @Input() currentUser: Document<User> | null = null;
  @Input() currentCollaborator: Document<Collaborator> | null = null;
  @Input() readyCollaborators: Document<Collaborator>[] | null = null;
  @Input() pendingCollaborators: Document<Collaborator>[] | null = null;
  @Output() requestCollaboratorStatus = new EventEmitter();
  @Output() approveCollaboratorStatusRequest = new EventEmitter<string>();
  @Output() grantCollaboratorStatus = new EventEmitter<string>();
  @Output() rejectCollaboratorStatusRequest = new EventEmitter<string>();
  @Output() revokeCollaboratorStatus = new EventEmitter<string>();
  @Output() retryCollaboratorStatusRequest = new EventEmitter<string>();
  @Output() setCollaboratorListMode = new EventEmitter<'ready' | 'pending'>();
  @Output() toggleShowRejected = new EventEmitter();

  onRequestCollaboratorStatus() {
    this.requestCollaboratorStatus.emit();
  }

  onRetryCollaboratorStatusRequest(collaboratorId: string) {
    this.retryCollaboratorStatusRequest.emit(collaboratorId);
  }

  onApproveCollaboratorStatusRequest(collaboratorId: string) {
    this.approveCollaboratorStatusRequest.emit(collaboratorId);
  }

  onRejectCollaboratorStatusRequest(collaboratorId: string) {
    this.rejectCollaboratorStatusRequest.emit(collaboratorId);
  }

  onGrantCollaboratorStatus(collaboratorId: string) {
    this.grantCollaboratorStatus.emit(collaboratorId);
  }

  onRevokeCollaboratorStatus(collaboratorId: string) {
    this.revokeCollaboratorStatus.emit(collaboratorId);
  }

  onSetCollaboratorListMode(mode: 'ready' | 'pending') {
    this.setCollaboratorListMode.emit(mode);
  }

  onToggleShowRejected() {
    this.toggleShowRejected.emit();
  }
}
