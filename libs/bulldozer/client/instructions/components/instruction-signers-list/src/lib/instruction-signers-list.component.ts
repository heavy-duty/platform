import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { InstructionAccountItemView } from '@bulldozer-client/instructions-data-access';
import { InstructionAccountDto } from '@heavy-duty/bulldozer-devkit';

@Component({
  selector: 'bd-instruction-signers-list',
  template: `
    <mat-card class="p-3">
      <section class="flex flex-col gap-3">
        <header bdSectionHeader>
          <h2>
            Signers
            <button
              color="primary"
              mat-icon-button
              aria-label="Add instruction signer"
              bdEditInstructionSignerTrigger
              (editInstructionSigner)="onCreateInstructionSigner($event)"
            >
              <mat-icon>add</mat-icon>
            </button>
          </h2>
          <p>Visualize the list of signers and manage them.</p>
        </header>

        <mat-list
          role="list"
          *ngIf="
            instructionSigners && instructionSigners.length > 0;
            else emptyList
          "
          class="flex flex-col gap-2"
        >
          <mat-list-item
            role="listitem"
            *ngFor="let instructionSigner of instructionSigners; let i = index"
            class="h-20 bg-white bg-opacity-5 mat-elevation-z2"
          >
            <div class="flex items-center gap-4 w-full">
              <div
                class="flex justify-center items-center w-12 h-12 rounded-full bg-black bg-opacity-10 text-xl font-bold"
              >
                <mat-icon>rate_review</mat-icon>
              </div>

              <h3 class="mb-0 flex items-center gap-2 flex-grow">
                <span
                  [matTooltip]="
                    instructionSigner.document.name
                      | bdItemUpdatingMessage: instructionSigner:'Signer'
                  "
                >
                  <span class="text-lg font-bold">
                    {{ instructionSigner.document.name }}
                  </span>

                  <span
                    class="text-xs font-thin"
                    *ngIf="instructionSigner.document.data.modifier"
                    [ngSwitch]="instructionSigner.document.data.modifier.id"
                  >
                    <ng-container *ngSwitchCase="0">
                      ({{ instructionSigner.document.data.modifier.name }}
                    </ng-container>
                    <ng-container *ngSwitchCase="1">
                      ({{ instructionSigner.document.data.modifier.name }})
                    </ng-container>
                  </span>
                </span>
                <mat-progress-spinner
                  *ngIf="instructionSigner | bdItemShowSpinner"
                  diameter="16"
                  mode="indeterminate"
                ></mat-progress-spinner>
              </h3>

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
                  bdEditInstructionSignerTrigger
                  [instructionSigner]="instructionSigner.document"
                  (editInstructionSigner)="
                    onUpdateInstructionSigner(
                      instructionSigner.document.id,
                      $event
                    )
                  "
                  [disabled]="!connected"
                >
                  <mat-icon>edit</mat-icon>
                  <span>Update signer</span>
                </button>
                <button
                  mat-menu-item
                  (click)="
                    onDeleteInstructionSigner(instructionSigner.document.id)
                  "
                  [disabled]="!connected"
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
      </section>
    </mat-card>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [],
})
export class InstructionSignersListComponent {
  @Input() connected = false;
  @Input() instructionSigners: InstructionAccountItemView[] | null = null;
  @Output() createInstructionSigner = new EventEmitter<InstructionAccountDto>();
  @Output() updateInstructionSigner = new EventEmitter<{
    instructionAccountId: string;
    instructionAccountDto: InstructionAccountDto;
  }>();
  @Output() deleteInstructionSigner = new EventEmitter<string>();

  onCreateInstructionSigner(instructionAccountDto: InstructionAccountDto) {
    this.createInstructionSigner.emit(instructionAccountDto);
  }

  onUpdateInstructionSigner(
    instructionAccountId: string,
    instructionAccountDto: InstructionAccountDto
  ) {
    this.updateInstructionSigner.emit({
      instructionAccountId,
      instructionAccountDto,
    });
  }

  onDeleteInstructionSigner(instructionAccountId: string) {
    this.deleteInstructionSigner.emit(instructionAccountId);
  }
}
