import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { InstructionAccountExtended } from '@heavy-duty/bulldozer/application/utils/types';

@Component({
  selector: 'bd-list-signers',
  template: `
    <section>
      <mat-card>
        <header bdSectionHeader>
          <h2>Signers</h2>
          <p>Manage signers of the instruction.</p>
        </header>

        <mat-list
          *ngIf="
            signers !== null && signers !== undefined && signers.length > 0;
            else emptyList
          "
          role="list"
        >
          <mat-list-item
            role="listitem"
            *ngFor="let signer of signers"
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
                  {{ signer.data.name }}

                  <span
                    class="text-xs font-thin"
                    *ngIf="signer.data.modifier"
                    [ngSwitch]="signer.data.modifier.id"
                  >
                    <ng-container *ngSwitchCase="0">
                      ({{ signer.data.modifier.name }}: space
                      {{ signer.data.space }})
                    </ng-container>
                    <ng-container *ngSwitchCase="1">
                      ({{ signer.data.modifier.name }})
                    </ng-container>
                  </span>
                </h3>
              </div>

              <button
                mat-mini-fab
                color="primary"
                aria-label="Account menu"
                [matMenuTriggerFor]="signerMenu"
              >
                <mat-icon>more_horiz</mat-icon>
              </button>
              <mat-menu #signerMenu="matMenu">
                <button
                  mat-menu-item
                  (click)="onUpdateSigner(signer)"
                  [disabled]="!connected"
                >
                  <mat-icon>edit</mat-icon>
                  <span>Update signer</span>
                </button>
                <button
                  mat-menu-item
                  (click)="onDeleteSigner(signer.id)"
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
})
export class ListSignersComponent {
  @Input() connected?: boolean | null = null;
  @Input() signers?: InstructionAccountExtended[] | null = null;
  @Output() updateSigner = new EventEmitter<InstructionAccountExtended>();
  @Output() deleteSigner = new EventEmitter<string>();

  onUpdateSigner(signer: InstructionAccountExtended) {
    this.updateSigner.emit(signer);
  }

  onDeleteSigner(signerId: string) {
    this.deleteSigner.emit(signerId);
  }
}
