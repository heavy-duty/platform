import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { Collaborator, Document } from '@heavy-duty/bulldozer-devkit';

@Component({
  selector: 'bd-collaborators-list',
  template: `
    <mat-card class="p-3">
      <section class="flex flex-col gap-3">
        <header bdSectionHeader>
          <h2>Collaborators</h2>
          <p>Visualize workspace's collaborators.</p>
          <button
            *ngIf="canRequestCollaboratorStatus"
            mat-raised-button
            color="primary"
            (click)="onRequestCollaboratorStatus()"
          >
            Become a Collaborator
          </button>
        </header>

        <mat-list
          role="list"
          *ngIf="collaborators && collaborators.length > 0; else emptyList"
          class="flex flex-col gap-2"
        >
          <mat-list-item
            role="listitem"
            *ngFor="let collaborator of collaborators; let i = index"
            class="h-24 bg-white bg-opacity-5 mat-elevation-z2"
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
              </div>
              <div
                class="flex justify-center items-center w-24"
                [ngSwitch]="collaborator.data.status.id"
              >
                <ng-container *ngSwitchCase="0">
                  <div
                    *ngIf="canUpdateCollaborator"
                    class="flex justify-center gap-2"
                  >
                    <button
                      (click)="onApproveCollaboratorStatusRequest(collaborator)"
                      mat-mini-fab
                      color="primary"
                      aria-label="Approve collaborator status request"
                    >
                      <mat-icon>check</mat-icon>
                    </button>
                    <button
                      (click)="onRejectCollaboratorStatusRequest(collaborator)"
                      mat-mini-fab
                      color="warn"
                      aria-label="Reject collaborator status request"
                    >
                      <mat-icon>close</mat-icon>
                    </button>
                  </div>

                  <mat-progress-spinner
                    *ngIf="!canUpdateCollaborator"
                    mode="indeterminate"
                    diameter="32"
                  ></mat-progress-spinner>
                </ng-container>
                <div *ngSwitchCase="1" class="flex flex-col gap-1 items-center">
                  <mat-icon class="text-green-500">check_circle</mat-icon>
                  <p class="m-0 uppercase font-bold text-green-500">Approved</p>
                </div>
                <div *ngSwitchCase="2" class="flex flex-col gap-1 items-center">
                  <mat-icon class="text-red-500">cancel</mat-icon>
                  <p class="m-0 uppercase font-bold text-red-500">Rejected</p>
                </div>
                <p *ngSwitchDefault>Unknown status</p>
              </div>
            </div>
          </mat-list-item>
        </mat-list>

        <ng-template #emptyList>
          <p class="text-center text-xl py-8">There's no collaborators.</p>
        </ng-template>
      </section>
    </mat-card>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollaboratorsListComponent {
  @Input() canUpdateCollaborator = false;
  @Input() canRequestCollaboratorStatus = false;
  @Input() collaborators: Document<Collaborator>[] | null = null;
  @Output() requestCollaboratorStatus = new EventEmitter();
  @Output() approveCollaboratorStatusRequest = new EventEmitter<
    Document<Collaborator>
  >();
  @Output() rejectCollaboratorStatusRequest = new EventEmitter<
    Document<Collaborator>
  >();

  onRequestCollaboratorStatus() {
    this.requestCollaboratorStatus.emit();
  }

  onApproveCollaboratorStatusRequest(collaborator: Document<Collaborator>) {
    this.approveCollaboratorStatusRequest.emit(collaborator);
  }

  onRejectCollaboratorStatusRequest(collaborator: Document<Collaborator>) {
    this.rejectCollaboratorStatusRequest.emit(collaborator);
  }
}
