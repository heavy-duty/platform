import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import {
  Document,
  InstructionAccount,
  InstructionAccountDto,
} from '@heavy-duty/bulldozer-devkit';

@Component({
  selector: 'bd-instruction-signers-list',
  template: `
    <section>
      <mat-card>
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
        >
          <mat-list-item
            role="listitem"
            *ngFor="let instructionSigner of instructionSigners; let i = index"
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
                  bdEditInstructionSignerTrigger
                  [instructionSigner]="instructionSigner"
                  (editInstructionSigner)="
                    onUpdateInstructionSigner(instructionSigner.id, $event)
                  "
                  [disabled]="!connected"
                >
                  <mat-icon>edit</mat-icon>
                  <span>Update signer</span>
                </button>
                <button
                  mat-menu-item
                  (click)="onDeleteInstructionSigner(instructionSigner.id)"
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
      </mat-card>
    </section>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [],
})
export class InstructionSignersListComponent {
  @Input() connected = false;
  @Input() instructionSigners: Document<InstructionAccount>[] | null = null;
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
