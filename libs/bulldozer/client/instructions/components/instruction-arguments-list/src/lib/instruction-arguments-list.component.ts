import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Document, InstructionArgument } from '@heavy-duty/bulldozer-devkit';
import { InstructionArgumentsListStore } from './instruction-arguments-list.store';

@Component({
  selector: 'bd-instruction-arguments-list',
  template: `
    <section *ngIf="instructionId && applicationId">
      <mat-card>
        <header bdSectionHeader>
          <h2>
            Arguments
            <button
              color="primary"
              mat-icon-button
              aria-label="Add instruction argument"
              (click)="
                onCreateInstructionArgument(applicationId, instructionId)
              "
            >
              <mat-icon>add</mat-icon>
            </button>
          </h2>
          <p>Visualize the list of arguments and manage them.</p>
        </header>

        <ng-container
          *ngrxLet="instructionArguments$; let instructionArguments"
        >
          <mat-list
            role="list"
            *ngIf="
              instructionArguments && instructionArguments.length > 0;
              else emptyList
            "
          >
            <mat-list-item
              role="listitem"
              *ngFor="
                let instructionArgument of instructionArguments;
                let i = index
              "
              class="h-20 bg-white bg-opacity-5 mat-elevation-z2 mb-2 last:mb-0"
            >
              <div class="flex items-center gap-4 w-full">
                <div
                  class="flex justify-center items-center w-12 h-12 rounded-full bg-black bg-opacity-10 text-xl font-bold"
                >
                  {{ i + 1 }}
                </div>
                <div class="flex-grow">
                  <h3 class="mb-0 text-lg font-bold">
                    {{ instructionArgument.name }}
                  </h3>
                  <p class="text-xs mb-0 italic">
                    Type:

                    <ng-container *ngIf="instructionArgument.data.modifier">
                      {{ instructionArgument.data.modifier.name }}
                      <ng-container
                        *ngIf="
                          instructionArgument.data.modifier.name === 'array'
                        "
                      >
                        ({{ instructionArgument.data.modifier?.size }})
                      </ng-container>
                      of
                    </ng-container>

                    {{ instructionArgument.data.kind.name }}.
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
                    (click)="onUpdateInstructionArgument(instructionArgument)"
                    [disabled]="!connected"
                  >
                    <mat-icon>edit</mat-icon>
                    <span>Update argument</span>
                  </button>
                  <button
                    mat-menu-item
                    (click)="onDeleteInstructionArgument(instructionArgument)"
                    [disabled]="!connected"
                  >
                    <mat-icon>delete</mat-icon>
                    <span>Delete argument</span>
                  </button>
                </mat-menu>
              </div>
            </mat-list-item>
          </mat-list>
        </ng-container>

        <ng-template #emptyList>
          <p class="text-center text-xl py-8">There's no arguments yet.</p>
        </ng-template>
      </mat-card>
    </section>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [InstructionArgumentsListStore],
})
export class InstructionArgumentsListComponent {
  @Input() applicationId?: string;
  @Input() instructionId?: string;
  @Input() connected = false;
  readonly instructionArguments$ =
    this.instructionArgumentsListStore.instructionArguments$;

  constructor(
    private readonly instructionArgumentsListStore: InstructionArgumentsListStore
  ) {}

  onCreateInstructionArgument(applicationId: string, instructionId: string) {
    this.instructionArgumentsListStore.createInstructionArgument({
      applicationId,
      instructionId,
    });
  }

  onUpdateInstructionArgument(
    instructionArgument: Document<InstructionArgument>
  ) {
    this.instructionArgumentsListStore.updateInstructionArgument({
      instructionArgument,
    });
  }

  onDeleteInstructionArgument(
    instructionArgument: Document<InstructionArgument>
  ) {
    this.instructionArgumentsListStore.deleteInstructionArgument({
      instructionArgument,
    });
  }
}
