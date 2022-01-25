import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Document, InstructionAccount } from '@heavy-duty/bulldozer-devkit';
import { InstructionSignersListStore } from './instruction-signers-list.store';

@Component({
  selector: 'bd-instruction-signers-list',
  template: `
    <section *ngIf="instructionId && applicationId">
      <mat-card>
        <header bdSectionHeader>
          <h2>
            Signers
            <button
              color="primary"
              mat-icon-button
              aria-label="Add instruction signer"
              (click)="onCreateInstructionSigner(applicationId, instructionId)"
            >
              <mat-icon>add</mat-icon>
            </button>
          </h2>
          <p>Visualize the list of signers and manage them.</p>
        </header>

        <ng-container *ngrxLet="instructionSigners$; let instructionSigners">
          <mat-list
            role="list"
            *ngIf="
              instructionSigners && instructionSigners.length > 0;
              else emptyList
            "
          >
            <mat-list-item
              role="listitem"
              *ngFor="
                let instructionSigner of instructionSigners;
                let i = index
              "
              class="h-auto bg-white bg-opacity-5 mat-elevation-z2 mb-2 last:mb-0 py-2"
            >
              <div class="flex items-center gap-4 w-full">
                <div
                  class="flex justify-center items-center w-12 h-12 rounded-full bg-black bg-opacity-10 text-xl font-bold"
                >
                  <mat-icon>rate_review</mat-icon>
                </div>

                <div class="flex-grow">
                  <h3 class="mb-0 text-lg font-bold">
                    {{ instructionSigner.name }}

                    <span
                      class="text-xs font-thin"
                      *ngIf="instructionSigner.data.modifier"
                      [ngSwitch]="instructionSigner.data.modifier.id"
                    >
                      <ng-container *ngSwitchCase="0">
                        ({{ instructionSigner.data.modifier.name }}
                      </ng-container>
                      <ng-container *ngSwitchCase="1">
                        ({{ instructionSigner.data.modifier.name }})
                      </ng-container>
                    </span>
                  </h3>
                </div>

                <button
                  mat-mini-fab
                  color="primary"
                  aria-label="Signers menu"
                  [matMenuTriggerFor]="instructionSignerMenu"
                >
                  <mat-icon>more_horiz</mat-icon>
                </button>
                <mat-menu #instructionSignerMenu="matMenu">
                  <button
                    mat-menu-item
                    (click)="onUpdateInstructionSigner(instructionSigner)"
                    [disabled]="!connected"
                  >
                    <mat-icon>edit</mat-icon>
                    <span>Update signer</span>
                  </button>
                  <button
                    mat-menu-item
                    (click)="onDeleteInstructionSigner(instructionSigner)"
                    [disabled]="!connected"
                  >
                    <mat-icon>delete</mat-icon>
                    <span>Delete signer</span>
                  </button>
                </mat-menu>
              </div>
            </mat-list-item>
          </mat-list>
        </ng-container>

        <ng-template #emptyList>
          <p class="text-center text-xl py-8">There's no signers yet.</p>
        </ng-template>
      </mat-card>
    </section>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [InstructionSignersListStore],
})
export class InstructionSignersListComponent {
  @Input() applicationId?: string;
  @Input() instructionId?: string;
  @Input() connected = false;
  readonly instructionSigners$ =
    this.instructionSignersListStore.instructionSigners$;

  constructor(
    private readonly instructionSignersListStore: InstructionSignersListStore
  ) {}

  onCreateInstructionSigner(applicationId: string, instructionId: string) {
    this.instructionSignersListStore.createInstructionSigner({
      applicationId,
      instructionId,
    });
  }

  onUpdateInstructionSigner(instructionSigners: Document<InstructionAccount>) {
    this.instructionSignersListStore.updateInstructionSigner({
      instructionAccount: instructionSigners,
    });
  }

  onDeleteInstructionSigner(instructionSigner: Document<InstructionAccount>) {
    this.instructionSignersListStore.deleteInstructionSigner({
      instructionAccount: instructionSigner,
    });
  }
}
