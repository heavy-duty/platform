import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { InstructionArgumentItemView } from '@bulldozer-client/instructions-data-access';
import { InstructionArgumentDto } from '@heavy-duty/bulldozer-devkit';

@Component({
  selector: 'bd-instruction-arguments-list',
  template: `
    <mat-card class="p-3">
      <section class="flex flex-col gap-3">
        <header bdSectionHeader>
          <h2>
            Arguments
            <button
              color="primary"
              mat-icon-button
              aria-label="Add instruction argument"
              bdEditInstructionArgument
              (editInstructionArgument)="onCreateInstructionArgument($event)"
            >
              <mat-icon>add</mat-icon>
            </button>
          </h2>
          <p>Visualize the list of arguments and manage them.</p>
        </header>

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
                      instructionArgument.document.id,
                      $event
                    )
                  "
                  [disabled]="!connected"
                >
                  <mat-icon>edit</mat-icon>
                  <span>Update argument</span>
                </button>
                <button
                  mat-menu-item
                  (click)="
                    onDeleteInstructionArgument(instructionArgument.document.id)
                  "
                  [disabled]="!connected"
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
      </section>
    </mat-card>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InstructionArgumentsListComponent {
  @Input() connected = false;
  @Input() instructionArguments: InstructionArgumentItemView[] | null = null;
  @Output() createInstructionArgument =
    new EventEmitter<InstructionArgumentDto>();
  @Output() updateInstructionArgument = new EventEmitter<{
    instructionArgumentId: string;
    instructionArgumentDto: InstructionArgumentDto;
  }>();
  @Output() deleteInstructionArgument = new EventEmitter<string>();

  onCreateInstructionArgument(instructionArgumentDto: InstructionArgumentDto) {
    this.createInstructionArgument.emit(instructionArgumentDto);
  }

  onUpdateInstructionArgument(
    instructionArgumentId: string,
    instructionArgumentDto: InstructionArgumentDto
  ) {
    this.updateInstructionArgument.emit({
      instructionArgumentId,
      instructionArgumentDto,
    });
  }

  onDeleteInstructionArgument(instructionArgumentId: string) {
    this.deleteInstructionArgument.emit(instructionArgumentId);
  }
}
